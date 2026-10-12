// ----------------------------------------------------------------------------------------------------------------------------------------------------------
//  MONTECRISTI — Configuración Central
//  Portal de noticias de República Dominicana y el mundo.
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

export const siteConfig = {
  // ---- Identidad ------------------------------------------------------------------------------------------------------------------------------
  name: "Montecristi.net",
  brandName: "Montecristi",
  tagline: "Noticias de Montecristi y la Línea Noroeste, con cobertura de República Dominicana.",
  description:
    "Noticias de Montecristi y la Línea Noroeste: cobertura de San Fernando, Manzanillo, Guayubín, Villa Vásquez y Castañuelas, junto a la actualidad de República Dominicana.",
  url: "https://montecristi.net",
  founded: "2019",
  copyright: `© ${new Date().getFullYear()} montecristi.net. Todos los derechos reservados.`,

  // ---- SEO & Redes Sociales ----------------------------------------------------------------------------------------------------------
  seo: {
    title: "Noticias de Montecristi y la Línea Noroeste | Montecristi.net",
    tagline: "Noticias de Montecristi y la Línea Noroeste, con cobertura de República Dominicana.",
    description: "Noticias de Montecristi y la Línea Noroeste: cobertura de San Fernando, Manzanillo, Guayubín, Villa Vásquez y Castañuelas, junto a la actualidad de República Dominicana.",
    keywords: [
      "noticias de Montecristi",
      "noticias de Montecristi hoy",
      "Montecristi hoy",
      "periódico de Montecristi",
      "actualidad de Montecristi",
      "Línea Noroeste",
      "San Fernando de Montecristi",
      "Manzanillo Montecristi",
      "Guayubín",
      "Villa Vásquez",
      "Castañuelas",
      "noticias de República Dominicana",
    ],
    defaultImage: "/morroMontecristi.jpg",
    defaultImageAlt: "El Morro de Montecristi, República Dominicana",
    twitterHandle: "@montecristinews",
    facebookAppId: "2025444234751260",
    locale: "es_DO",
    siteName: "Montecristi.net",
    robots: "index, follow",
    googleSiteVerification: "LDV-13Lptx9CvzJPrTxmm_2S2r3Lmi4iHvwWt5hQBy8",
  },

  // ---- Google Analytics 4 ------------------------------------------------------------------------------------------------------------
  googleAnalytics: {
    measurementId: "G-XJMFKFRGY4",
    propertyId: "530381783",
    serviceAccountEmail: process.env.GA_SERVICE_ACCOUNT_EMAIL ?? "",
    serviceAccountKey: process.env.GA_PRIVATE_KEY ?? "",
  },

  // ---- Google AdSense ----------------------------------------------------------------------------------------------------------------
  adsense: {
    enabled: true,
    client: "ca-pub-7418549642678098",
  },

  // ---- WordPress API & Feed ----------------------------------------------------------------------------------------------------------------------
  api: {
    // Las URLs de las fuentes viven en src/config/sources.ts (solo servidor).
    montecristiCategoryId: 6,
    revalidate: 60,
  },

  // ---- Marca de Agua en Imágenes ------------------------------------------------------------------------------------------------
  watermark: {
    enabled: true,
    logoPath: "public/logo.png",
    opacity: 0.75,
    position: "bottom-right" as "bottom-right" | "bottom-left" | "center",
    sizePercent: 22,
    marginPercent: 2,
  },

  // ---- Newsletter ----------------------------------------------------------------------------------------------------------------------------
  newsletter: {
    title: "Montecristi Al Día",
    description:
      "Recibe nuestro resumen diario con las noticias más importantes de Montecristi y el país en tu correo.",
    buttonText: "Suscribirme Gratis",
    placeholder: "Tu correo electrónico",
    provider: "brevo" as "mailchimp" | "brevo" | "none",
    mailchimpApiKey: process.env.MAILCHIMP_API_KEY ?? "",
    mailchimpListId: process.env.MAILCHIMP_LIST_ID ?? "",
    brevoApiKey: process.env.BREVO_API_KEY ?? "",
    brevoListId: process.env.BREVO_LIST_ID ?? "",
  },

  // ---- Categorías ----------------------------------------------------------------------------------------------------------------------------
  categoryConfig: {
    montecristi: {
      description: "Noticias de Montecristi, San Fernando, Manzanillo, Guayubín, Villa Vásquez, Castañuelas y la Línea Noroeste.",
      gradient: "from-[#8A1017] via-zinc-900 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
      showClock: false,
    },
    elmundo: {
      description: "Noticias y actualidad de República Dominicana y el mundo.",
      gradient: "from-slate-950 via-blue-950 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    deportivas: {
      description: "Noticias deportivas dominicanas e internacionales, resultados y actualidad de los atletas.",
      gradient: "from-emerald-950 via-slate-900 to-black",
      accent: "#BF1B23",
      image: "/viral.jpg",
    },
    internacionales: {
      description: "Noticias internacionales y hechos que marcan la actualidad global.",
      gradient: "from-sky-950 via-slate-900 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    nacionales: {
      description: "Noticias de República Dominicana: política, sucesos, economía y actualidad nacional.",
      gradient: "from-blue-950 via-slate-900 to-black",
      accent: "#BF1B23",
      image: "/Protestas_Plaza_de_la_Bandera_día_uno.jpg",
    },
    politica: {
      description: "Noticias políticas de República Dominicana, declaraciones, decisiones y actividad pública.",
      gradient: "from-indigo-950 via-slate-900 to-black",
      accent: "#BF1B23",
      image: "/Protestas_Plaza_de_la_Bandera_día_uno.jpg",
    },
    regionales: {
      description: "Noticias de las provincias y comunidades de la región noroeste y todo el país.",
      gradient: "from-amber-950 via-zinc-900 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    salud: {
      description: "Noticias de salud, bienestar, prevención y servicios sanitarios.",
      gradient: "from-teal-950 via-slate-900 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    "montecristi-por-dentro": {
      description: "Guías locales para conocer Montecristi: playas, hoteles, excursiones, historia, cultura y lugares de interés de la provincia.",
      gradient: "from-[#031934] via-[#042564] to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    farandula: {
      description: "Noticias de farándula, entretenimiento, música y figuras dominicanas e internacionales.",
      gradient: "from-[#8A1017] via-zinc-900 to-stone-950",
      accent: "#BF1B23",
      image: "/farandula.jpg",
    },
  },

  // ---- Google News (Subscribe with Google Basic) --------------------------------------------------------------
  googleNews: {
    enabled: true,
    publicationId: "CAowhsfhCw",
    productId: "openaccess",
  },

  // ---- Contenido ------------------------------------------------------------------------------------------------------------------------------
  content: {
    trendingTagId: 2,
    topPostsCount: 5,
    gaLookbackDays: 7,
  },

  // ---- Redes Sociales ----------------------------------------------------------------------------------------------------------------------
  social: {
    facebook: {
      label: "Like 1.4M",
      url: "https://facebook.com/montecristinews",
      color: "#1877f2",
    },
    twitter: {
      label: "Twitter/X",
      url: "https://x.com/montecristinews",
    },
    instagram: {
      label: "Instagram",
      url: "https://instagram.com/montecristinews",
    },
    youtube: {
      label: "YouTube",
      url: "https://youtube.com/montecristinews",
    },
    googleNews: {
      label: "Google News",
      url: "#",
    },
    sin24: {
      label: "MONTECRISTI 24H",
      url: "#",
    },
    whatsapp: {
      label: "WhatsApp",
      url: "https://wa.me/18097512222",
    },
    telegram: {
      label: "Telegram",
      url: "https://t.me/montecristinews",
    },
  },

  // ---- Navegación Principal ----------------------------------------------------------------------------------------------------------
  nav: [
    { name: "Portada", href: "/" },
    { name: "Montecristi", href: "/montecristi" },
    { name: "Nacionales", href: "/nacionales" },
    { name: "Política", href: "/politica" },
    { name: "Regionales", href: "/regionales" },
    { name: "Deportes", href: "/deportivas" },
    { name: "Internacionales", href: "/internacionales" },
    { name: "Farándula", href: "/farandula" },
    { name: "Así va el Mundo", href: "/elmundo" },
    { name: "Salud", href: "/salud" },
    { name: "Montecristi por Dentro", href: "/montecristi-por-dentro" },
  ],

  // ---- Contacto ----------------------------------------------------------------------------------------------------------------------------------
  contact: {
    email: "redaccion@montecristi.net",
    phone: "+1 (809) 751-2222",
    address: "Montecristi, República Dominicana",
  },
};

export type SiteConfig = typeof siteConfig;
