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
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.doubleclick.net https://*.gstatic.com https://*.googlesyndication.com https://*.googletagservices.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.google.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https:;"
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
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).(jpg|jpeg|png|webp|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    // Para imágenes remotas (provenientes de CDN como Photon/Jetpack i0.wp.com, etc.),
    // evitamos que el servidor Node descargue y procese gigabytes de imágenes en memoria con Sharp,
    // eliminando el error de "heap out of memory" y los timeouts 500.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440],
    remotePatterns: [
      { protocol: "https", hostname: "redaccion.morroinformativo.com" },
      { protocol: "https", hostname: "deultimominuto.net" },
      { protocol: "http", hostname: "deultimominuto.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
      { protocol: "https", hostname: "remolacha.net" },
      // Catch-all for other CDNs if WP uses S3/Cloudfront
      { protocol: "https", hostname: "**" }
    ],
  },
};

export default nextConfig;
