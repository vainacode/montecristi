import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.doubleclick.net https://*.gstatic.com https://*.googlesyndication.com https://*.googletagservices.com https://*.googletagmanager.com https://www.googletagmanager.com https://*.google-analytics.com https://google-analytics.com https://pagead2.googlesyndication.com https://*.amung.us https://widgets.amung.us https://whos.amung.us https://*.waust.at https://waust.at; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.google.com; img-src 'self' data: https: blob: https://*.google-analytics.com https://*.googletagmanager.com https://*.amung.us https://whos.amung.us https://*.waust.at https://waust.at; media-src 'self' https: blob: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: https://*.google-analytics.com https://*.googletagmanager.com https://*.amung.us https://whos.amung.us https://*.waust.at https://waust.at; frame-src 'self' https: https://*.amung.us https://*.waust.at;"
  }
];

const isDev = process.env.NODE_STAGING === 'true' || process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compiler: {
    // Elimina todos los console.* en producción (build y runtime)
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
  },
  async headers() {
    // En desarrollo, no sobrescribimos Cache-Control para evitar errores de Turbopack/Next.js
    if (isDev) {
      return [
        {
          source: '/:path*',
          headers: securityHeaders,
        }
      ];
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // /_next/static ya lo sirve Next.js como immutable; sobrescribirlo genera un aviso en el build.
      {
        source: '/(.*).(jpg|jpeg|png|webp|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Los iconos no llevan hash en el nombre: sin "immutable" para que un cambio
        // de favicon llegue a los navegadores (la regla anterior queda sobrescrita).
        source: '/:icon(favicon\\.ico|favicon\\.svg|icono\\.png|apple-icon\\.png|icon-512\\.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
  images: {
    // Solo WebP: cada formato extra es otra transformación que cuenta en la cuota de
    // Vercel (AVIF además es lento de generar). Las fotos de noticias no cambian: 30 días.
    formats: ['image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440],
    // Solo dominios conocidos: con "**" el optimizador era un proxy abierto que cualquiera
    // podía usar para gastar la cuota de imágenes. Las fotos de las fuentes llegan como
    // rutas propias (/media/...); si alguna foto externa no está aquí, ProtectedImage la
    // carga directa.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
    ],
  },
};

export default nextConfig;
