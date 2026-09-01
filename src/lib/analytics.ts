/**
 * analytics.ts — Integración con Google Analytics 4 Data API
 *
 * Permite obtener los artículos más leídos según visitas reales de GA4.
 * Si no hay credenciales configuradas, devuelve los posts de respaldo (WP).
 *
 * Setup necesario:
 * 1. En GA4: Admin → Cuenta de servicio → Crea una cuenta y descarga el JSON
 * 2. En Google Cloud: habilita "Google Analytics Data API" para ese proyecto
 * 3. En GA4: Admin → Gestión de acceso → agrega el email de la cuenta de servicio como "Viewer"
 * 4. En .env.local:
 *    GA_SERVICE_ACCOUNT_EMAIL=mi-cuenta@mi-proyecto.iam.gserviceaccount.com
 *    GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 */

import { siteConfig } from "@/config/site";
import type { WPPost } from "@/lib/wp";

// ── JWT para autenticación de cuenta de servicio ──────────────────────────────

async function buildServiceAccountJWT(): Promise<string | null> {
  const email = siteConfig.googleAnalytics.serviceAccountEmail;
  const rawKey = siteConfig.googleAnalytics.serviceAccountKey;

  if (!email || !rawKey) return null;

  const privateKey = rawKey.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const b64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsigned = `${b64url(header)}.${b64url(payload)}`;

  try {
    const { createSign } = await import("crypto");
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    const sig = signer.sign(privateKey, "base64url");
    return `${unsigned}.${sig}`;
  } catch (err) {
    console.error("[Analytics] JWT signing failed:", err);
    return null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function getGoogleAccessToken(): Promise<string | null> {
  const jwt = await buildServiceAccountJWT();
  if (!jwt) return null;

  const res = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    // Cache the token for almost an hour
    next: { revalidate: 3500 },
  } as RequestInit);

  if (!res.ok) {
    console.error("[Analytics] Token exchange failed:", await res.text());
    return null;
  }

  const data = await res.json();
  return data.access_token ?? null;
}

// ── GA4 Data API ──────────────────────────────────────────────────────────────

/**
 * Obtiene las rutas de página más visitadas de GA4 en los últimos N días.
 * Retorna array de paths como ["/montecristi/slug-noticia", ...]
 */
export async function getTopPagePathsFromGA(
  days = 7,
  limit = 20
): Promise<string[]> {
  const { propertyId } = siteConfig.googleAnalytics;
  if (!propertyId) return [];

  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return [];

  const res = await fetchWithTimeout(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        limit,
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                // Solo paths con al menos 2 segmentos (artículos, no portada)
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "CONTAINS", value: "/" },
                },
              },
              {
                // Excluir rutas de admin/API
                notExpression: {
                  filter: {
                    fieldName: "pagePath",
                    stringFilter: { matchType: "CONTAINS", value: "/api/" },
                  },
                },
              },
            ],
          },
        },
        orderBys: [
          { metric: { metricName: "screenPageViews" }, desc: true },
        ],
      }),
      next: { revalidate: 3600 }, // Cachear 1 hora
    } as RequestInit
  );

  if (!res.ok) {
    console.error("[Analytics] Data API error:", await res.text());
    return [];
  }

  const data = await res.json();
  const rows: Array<{ dimensionValues: Array<{ value: string }> }> =
    data.rows ?? [];

  return rows
    .map((r) => r.dimensionValues[0]?.value ?? "")
    .filter((p) => p && p !== "/");
}

// ── Posts más leídos (con fallback a WP) ─────────────────────────────────────

/**
 * Devuelve los posts más leídos según GA4.
 * Si GA no está configurado o falla, usa `fallbackPosts`.
 */
export async function getMostReadPosts(
  allPosts: WPPost[],
  fallbackPosts: WPPost[]
): Promise<WPPost[]> {
  const { propertyId, serviceAccountEmail, serviceAccountKey } =
    siteConfig.googleAnalytics;

  // Sin credenciales GA → usar fallback WP inmediatamente
  if (!propertyId || !serviceAccountEmail || !serviceAccountKey) {
    return fallbackPosts;
  }

  const paths = await getTopPagePathsFromGA(
    siteConfig.content.gaLookbackDays,
    30
  ).catch(() => []);

  if (!paths.length) return fallbackPosts;

  // Extraer slug (último segmento de la ruta)
  const slugsInOrder = paths.map((path) => {
    const parts = path.replace(/^\//, "").split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  });

  // Mapear slugs a posts ya cargados
  const ranked = slugsInOrder
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((p): p is WPPost => !!p);

  return ranked.length >= 3
    ? ranked.slice(0, siteConfig.content.topPostsCount)
    : fallbackPosts;
}
