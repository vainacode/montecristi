import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Newsreader, Source_Sans_3, Open_Sans } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsTicker } from "@/components/NewsTicker";
import { ClientUtilities } from "@/components/ClientUtilities";
import { siteConfig } from "@/config/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-source-sans",
  display: "swap",
  preload: false,
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
  preload: true,
});

const fontVariables = `${outfit.variable} ${newsreader.variable} ${sourceSans.variable} ${openSans.variable}`;

// -- Metadata global (SEO + Redes Sociales) ------------------------------------
export const metadata: Metadata = {
  // Título: páginas individuales heredan el template
  title: {
    default: siteConfig.seo.title,
    template: `%s | Montecristi.net`,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: "Redacción Montecristi", url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  metadataBase: new URL(siteConfig.url),

  // Robots y Motores IA
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // -- Open Graph (Facebook, WhatsApp, LinkedIn, etc.) ------------------------
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.tagline,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.seo.defaultImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.seo.defaultImageAlt,
        type: "image/jpeg",
      },
    ],
  },

  // -- Twitter / X Cards ------------------------------------------------------
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.tagline,
    images: [`${siteConfig.url}${siteConfig.seo.defaultImage}`],
    site: siteConfig.seo.twitterHandle,
    creator: siteConfig.seo.twitterHandle,
  },

  // -- Verificación de propiedad ----------------------------------------------
  verification: {
    google: siteConfig.seo.googleSiteVerification,
  },

  // -- Icons ----------------------------------------------------------------─
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icono.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icono.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/favicon.svg",
  },
  facebook: {
    appId: siteConfig.seo.facebookAppId,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const newsMediaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": `${siteConfig.url}/#organization`,
        "name": siteConfig.name,
        "alternateName": [
          "El Periódico Digital de Montecristi",
          "Periódico Montecristi",
          "Periódico Digital de Montecristi",
          "Diario Digital Montecristi",
          "Montecristi News"
        ],
        "url": siteConfig.url,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteConfig.url}/logo.svg`,
          "width": "420",
          "height": "80"
        },
        "description": siteConfig.description,
        "foundingDate": siteConfig.founded,
        "publishingPrinciples": `${siteConfig.url}/aviso-legal`,
        "correctionsPolicy": `${siteConfig.url}/conocenos`,
        "ethicsPolicy": `${siteConfig.url}/conocenos`,
        "diversityPolicy": `${siteConfig.url}/conocenos`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Montecristi",
          "addressRegion": "Montecristi",
          "addressCountry": "DO"
        },
        "knowsAbout": [
          "Noticias de Montecristi",
          "Periódico de Montecristi",
          "Noticias en Montecristi",
          "Noticias dominicanas",
          "Actualidad República Dominicana",
          "Deportes LIDOM MLB",
          "Línea Noroeste",
          "Política Dominicana"
        ],
        "sameAs": [
          siteConfig.social.facebook.url,
          siteConfig.social.twitter.url,
          siteConfig.social.instagram.url,
          siteConfig.social.youtube.url
        ].filter(url => url && url !== "#"),
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": siteConfig.contact.phone,
          "contactType": "newsroom",
          "email": siteConfig.contact.email,
          "areaServed": "DO",
          "availableLanguage": ["Spanish", "es"]
        }
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        "url": siteConfig.url,
        "name": siteConfig.name,
        "description": siteConfig.seo.tagline,
        "publisher": {
          "@id": `${siteConfig.url}/#organization`
        },
        "inLanguage": "es-DO",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteConfig.url}/?s={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="es" className={fontVariables} data-scroll-behavior="smooth">
      <head>
        {/* Preconnects críticos para medios de WordPress */}
        <link rel="preconnect" href="https://i0.wp.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i0.wp.com" />
        <link rel="preconnect" href="https://relojinformativo.do" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://relojinformativo.do" />
        
        {/* Schema.org NewsMediaOrganization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsMediaJsonLd) }}
        />
        {/* Facebook App ID */}
        {siteConfig.seo.facebookAppId && (
          <meta property="fb:app_id" content={siteConfig.seo.facebookAppId} />
        )}
        <meta name="geo.region" content="DO-15" />
        <meta name="geo.placename" content="Montecristi" />
        <meta name="geo.position" content="19.8486;-71.6456" />
        <meta name="ICBM" content="19.8486, -71.6456" />
      </head>
      <body className="antialiased bg-white text-gray-900 flex flex-col min-h-screen max-w-full overflow-x-clip">
        {/* Google News (Subscribe with Google Basic) — Solo se activa si hay un Publication ID configurado para montecristi.net */}
        {siteConfig.googleNews.enabled && siteConfig.googleNews.publicationId && (
          <>
            <Script
              async
              src="https://news.google.com/swg/js/v1/swg-basic.js"
              strategy="lazyOnload"
            />
            <Script id="google-news-swg" strategy="lazyOnload">
              {`
                (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
                  basicSubscriptions.init({
                    type: "NewsArticle",
                    isPartOfType: ["Product"],
                    isPartOfProductId: "${siteConfig.googleNews.publicationId}:${siteConfig.googleNews.productId}",
                    clientOptions: { theme: "light", lang: "es-419" },
                  });
                });
              `}
            </Script>
          </>
        )}

        <ClientUtilities />
        <Header />
        <NewsTicker />
        <main className="flex-grow pt-[144px] max-w-full overflow-x-clip">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
