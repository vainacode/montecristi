import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Proxy (antes "middleware") de seguridad + compatibilidad con Cloudflare.
 *
 * Lo que hace:
 *  - Bloquea bots comunes con User-Agent vacío o malicioso
 *  - Agrega headers de caché amigables para Cloudflare CDN
 *  - Protege rutas de API con rate-limit básico
 *  - Rate limiting por usuario (IP) por minuto
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ── Identificación de usuario (IP) ──
  // NextRequest.ip is only available in certain runtimes, use headers instead
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1";
  
  // ── Rate Limiting ──
  // Límite por IP y minuto (excepto assets estáticos, buscadores y prefetch)
  const isAsset = pathname.startsWith("/_next") || pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
  
  if (!isAsset) {
    const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";

    // Buscadores y redes sociales no se limitan: un 429 a Googlebot o al bot de
    // Google News saca artículos del índice, y a Facebook/WhatsApp les rompe la vista previa.
    const isCrawler = /googlebot|google-inspectiontool|googleother|adsbot-google|mediapartners-google|storebot-google|bingbot|duckduckbot|yandex|applebot|facebookexternalhit|facebookcatalog|meta-externalagent|twitterbot|whatsapp|telegrambot|linkedinbot|slackbot|discordbot/.test(ua);

    // Los prefetch de <Link> no son navegación real; no deben gastar el cupo del visitante.
    const isPrefetch = request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch";

    // Muchos usuarios de datos móviles en RD comparten IP (CGNAT), por eso el cupo es amplio.
    const limitResult = isCrawler || isPrefetch
      ? { success: true, limit: 0, remaining: 0, resetAt: 0 }
      : rateLimit(ip, 240, 60000);
    
    if (!limitResult.success) {
      return new NextResponse("Too Many Requests", { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": limitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": limitResult.resetAt.toString(),
        }
      });
    }
    
    // Continuar con la respuesta
    const response = NextResponse.next();
    
    // Agregar headers informativos
    if (limitResult.limit > 0) {
      response.headers.set("X-RateLimit-Limit", limitResult.limit.toString());
      response.headers.set("X-RateLimit-Remaining", limitResult.remaining.toString());
      response.headers.set("X-RateLimit-Reset", limitResult.resetAt.toString());
    }

    // ── Bloqueo de rutas maliciosas / hackers ───────────────────────────────────
    const hackerPaths = [
      "/wp-admin", "/wp-login", "/wp-content", "/wp-includes", "/xmlrpc.php",
      "/.env", "/config.php", "/license.txt", "/readme.html", "/.git",
      "/.vscode", "/composer.json", "/package.json", "/auth", "/admin",
      "/wp-json/wp/v2/users"
    ];

    // "/auth" y "/admin" se comparan por segmento completo para no bloquear
    // categorías como "/administracion-publica"; el resto por prefijo ("/wp-login.php").
    const lowerPath = pathname.toLowerCase();
    const segmentOnly = new Set(["/auth", "/admin"]);
    if (hackerPaths.some(path => segmentOnly.has(path)
      ? lowerPath === path || lowerPath.startsWith(`${path}/`)
      : lowerPath.startsWith(path))) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // ── Bot / scraper básico: bloquear UA vacío o malicioso ────────────────────
    const botKeywords = [
      "python-requests", "cheerio", "beautifulsoup", "headlesschrome",
      "puppeteer", "wget", "curl", "libwww-perl", "axios", "node-fetch",
      "go-http-client", "postmanruntime", "insomnia", "scrapy"
    ];

    if (ua.trim() === "" || botKeywords.some(keyword => ua.includes(keyword))) {
      return new NextResponse("Access Denied: Suspected Bot Activity", { status: 403 });
    }

    // ── Cache-Control para Cloudflare CDN ────────────────────────────────────────
    if (
      pathname.match(/^\/[a-z-]+\/[a-z0-9-]+$/) &&
      !pathname.startsWith("/api/")
    ) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    }

    const staticPages = ["/aviso-legal", "/politica-de-privacidad", "/politica-de-cookies", "/terminos", "/conoce-montecristi", "/contacto"];
    if (staticPages.includes(pathname)) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=3600"
      );
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|woff2?)).*)",
  ],
};

