import "server-only";
import { mediaOrigins, hiddenBrandPatterns } from "@/config/sources";
import { siteConfig } from "@/config/site";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const origins = Object.entries(mediaOrigins).map(([key, origin]) => ({
  key,
  origin,
  host: new URL(origin).hostname.replace(/^www\./, ""),
}));

// Cualquier URL de una fuente: http(s), protocolo relativo o pasada por el CDN de Jetpack (i0.wp.com/host/...).
// La ruta se corta antes de una barra invertida para no romper las comillas escapadas (\") de un JSON.
const sourceUrlRegex = new RegExp(
  `(?:https?:)?//(?:i[0-3]\\.wp\\.com/)?(?:www\\.)?(${origins.map((o) => escapeRegex(o.host)).join("|")})(/[^"'\\s<>)\\\\]*)?`,
  "gi",
);

/** Archivos que se sirven por /media: todo /wp-content/ y cualquier imagen por su extensión. */
export function isMediaPath(path: string): boolean {
  return path.startsWith("/wp-content/") || /\.(?:jpe?g|png|gif|webp|avif|svg)$/i.test(path);
}

function keyForHost(host: string): string | undefined {
  return origins.find((o) => o.host === host.toLowerCase().replace(/^www\./, ""))?.key;
}

/** Convierte una URL de foto de una fuente en /media/<clave>/...; otras URLs quedan igual. */
export function toMediaPath(url: string): string {
  if (!url) return url;
  return url.replace(sourceUrlRegex, (match, host: string, path = "/") => {
    const key = keyForHost(host);
    if (!key) return match;
    // Las fotos van por nuestro proxy; los demás enlaces de la fuente quedan relativos
    // (formatContent los convierte en enlaces internos del sitio).
    // Sin query string: Next 16 no optimiza imágenes locales con "?…" sin configuración extra,
    // y los "?resize=" de Jetpack no hacen falta al pedir el original.
    const cleanPath = path.split(/[?#]/)[0];
    return isMediaPath(cleanPath) ? `/media/${key}${cleanPath}` : path;
  });
}

/** /media/<clave>/... → URL real de la fuente (para uso interno del servidor). */
export function resolveMediaPath(pathOrUrl: string): string {
  let value = pathOrUrl;
  try {
    const parsed = new URL(pathOrUrl, siteConfig.url);
    if (parsed.origin === new URL(siteConfig.url).origin) value = parsed.pathname + parsed.search;
  } catch {
    return pathOrUrl;
  }
  const m = value.match(/^\/media\/([a-z0-9]+)(\/.*)$/i);
  if (!m) return pathOrUrl;
  const origin = mediaOrigins[m[1]];
  return origin ? `${origin}${m[2]}` : pathOrUrl;
}

/** Quita de un texto/HTML cualquier rastro del dominio o la marca de las fuentes. */
export function scrubSourceText(text: string): string {
  if (!text) return text;
  let out = toMediaPath(text)
    // Pie que agregan WordPress/Yoast a los feeds: "The post X appeared first on Fuente."
    .replace(/<p>\s*(?:The post|La entrada)\b[\s\S]*?(?:appeared first on|apareci[oó] primero en)[\s\S]*?<\/p>/gi, "");
  for (const pattern of hiddenBrandPatterns) out = out.replace(pattern, siteConfig.name);
  return out;
}
