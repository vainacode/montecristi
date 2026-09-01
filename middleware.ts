import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Middleware de seguridad + compatibilidad con Cloudflare.
 *
 * Lo que hace:
 *  - Bloquea bots comunes con User-Agent vacío o malicioso
 *  - Agrega headers de caché amigables para Cloudflare CDN
 *  - Protege rutas de API con rate-limit básico
 *  - Rate limiting por usuario (IP) por minuto
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ── Identificación de usuario (IP) ──
  // NextRequest.ip is only available in certain runtimes, use headers instead
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1";
  
  // ── Rate Limiting ──
  // Limitar a 60 peticiones por minuto por IP (excepto assets estáticos)
  const isAsset = pathname.startsWith("/_next") || pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
  
  if (!isAsset) {
    const limitResult = rateLimit(ip, 60, 60000);
    
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
    response.headers.set("X-RateLimit-Limit", limitResult.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", limitResult.resetAt.toString());

    // ── Bloqueo de rutas maliciosas / hackers ───────────────────────────────────
    const hackerPaths = [
      "/wp-admin", "/wp-login", "/wp-content", "/wp-includes", "/xmlrpc.php",
      "/.env", "/config.php", "/license.txt", "/readme.html", "/.git",
      "/.vscode", "/composer.json", "/package.json", "/auth", "/admin",
      "/wp-json/wp/v2/users"
    ];

    if (hackerPaths.some(path => pathname.toLowerCase().startsWith(path.toLowerCase()))) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // ── Bot / scraper básico: bloquear UA vacío o malicioso ────────────────────
    const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";
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

