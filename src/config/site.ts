// ----------------------------------------------------------------------------------------------------------------------------------------------------------
//  MONTECRISTI — Configuración Central
//  Portal de noticias de República Dominicana y el mundo.
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

export const siteConfig = {
  // ---- Identidad ------------------------------------------------------------------------------------------------------------------------------
  name: "Montecristi.net",
  brandName: "Montecristi",
  tagline: "El periódico digital de Montecristi para la República Dominicana y el mundo.",
  description:
    "montecristi.net es el periódico digital de Montecristi y la República Dominicana. Cobertura veraz de noticias en Montecristi, la Línea Noroeste, política, economía, deportes, farándula y actualidad mundial en tiempo real.",
  url: "https://montecristi.net",
  founded: "2019",
  copyright: `© ${new Date().getFullYear()} montecristi.net. Todos los derechos reservados.`,

  // ---- SEO & Redes Sociales ----------------------------------------------------------------------------------------------------------
  seo: {
    title: "Montecristi Noticias | Noticias de Montecristi Hoy — Periódico de Montecristi Digital",
    tagline: "El periódico de Montecristi: Noticias de hoy, sucesos y actualidad en Montecristi, la Línea Noroeste, República Dominicana y el mundo.",
    description: "montecristi.net es el periódico de Montecristi líder en noticias de Montecristi hoy y la región Noroeste. Sucesos de última hora, política, economía, deportes y farándula 24/7.",
    keywords: [
      "montecristi noticias",
      "noticias de montecristi",
      "periodico de montecristi",
      "montecristi noticias hoy",
      "noticias de hoy en montecristi",
      "noticias en montecristi",
      "periodico digital de montecristi",
      "diario digital de montecristi",
      "periodico montecristi",
      "prensa de montecristi",
      "noticias linea noroeste",
      "san fernando de montecristi noticias",
      "noticias manzanillo montecristi",
      "noticias guayubin",
      "noticias villa vasquez",
      "noticias castañuelas",
      "periodico dominicano",
      "noticias republica dominicana",
      "montecristi.net"
    ],
    defaultImage: "/morroMontecristi.jpg",
    defaultImageAlt: "montecristi.net — Periódico de Montecristi y Noticias de Hoy",
    twitterHandle: "@montecristinews",
    facebookAppId: "2025444234751260",
    locale: "es_DO",
    siteName: "Montecristi.net",
    robots: "index, follow",
    googleSiteVerification: "9HkTS1jc8URlK5Kdgo_LQSKiondqusaAnSNU3kuChX4",
  },

  // ---- Google Analytics 4 ------------------------------------------------------------------------------------------------------------
  googleAnalytics: {
    measurementId: "G-5WHQZVNVLM",
    propertyId: "530381783",
    serviceAccountEmail: process.env.GA_SERVICE_ACCOUNT_EMAIL ?? "",
    serviceAccountKey: process.env.GA_PRIVATE_KEY ?? "",
  },

  // ---- WordPress API & Feed ----------------------------------------------------------------------------------------------------------------------
  api: {
    wordpressUrl: "https://relojinformativo.do/wp-json/wp/v2",
    feedUrl: "https://relojinformativo.do/feed/",
    revalidate: 60,
  },

  // ---- Marca de Agua en Imágenes ------------------------------------------------------------------------------------------------
  watermark: {
    enabled: false,
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
    entretenimiento: {
      description: "Noticias del mundo del entretenimiento, espectáculos, música, farándula y celebridades al instante.",
      gradient: "from-[#8A1017] via-zinc-900 to-black",
      accent: "#BF1B23",
      image: "/farandula.jpg",
    },
    deportes: {
      description: "Cobertura completa del deporte nacional e internacional: béisbol, baloncesto, fútbol, atletas destacados y resultados en vivo.",
      gradient: "from-[#6E0C11] via-neutral-900 to-zinc-950",
      accent: "#BF1B23",
      image: "/viral.jpg",
    },
    estilo: {
      description: "Tendencias, estilo de vida, salud, bienestar, cultura y efemérides de interés general.",
      gradient: "from-stone-950 via-[#8A1017] to-neutral-900",
      accent: "#D92B34",
      image: "/farandula.jpg",
    },
    economia: {
      description: "Actualidad económica, finanzas, negocios, mercados y análisis del panorama financiero.",
      gradient: "from-neutral-950 via-zinc-900 to-[#8A1017]",
      accent: "#BF1B23",
      image: "/Protestas_Plaza_de_la_Bandera_día_uno.jpg",
    },
    beisbol: {
      description: "Toda la pasión del béisbol dominicano (LIDOM), Grandes Ligas (MLB) y peloteros criollos.",
      gradient: "from-[#8A1017] via-zinc-900 to-stone-950",
      accent: "#BF1B23",
      image: "/viral.jpg",
    },
    baloncesto: {
      description: "Torneos nacionales de baloncesto, NBA, selección dominicana y las mejores jugadas.",
      gradient: "from-zinc-950 via-[#6E0C11] to-black",
      accent: "#D92B34",
      image: "/viral.jpg",
    },
    futbol: {
      description: "LDF, Champions League, ligas europeas, mundiales y todo el fútbol del planeta.",
      gradient: "from-[#8A1017] via-zinc-950 to-neutral-950",
      accent: "#BF1B23",
      image: "/viral.jpg",
    },
    efemerides: {
      description: "Los hechos históricos, aniversarios y conmemoraciones que marcaron un día como hoy.",
      gradient: "from-stone-950 via-[#8A1017] to-black",
      accent: "#D92B34",
      image: "/morroMontecristi.jpg",
    },
    montecristi: {
      description: "Montecristi Noticias: Las noticias de Montecristi hoy en tiempo real. Cobertura del periódico de Montecristi en San Fernando, Villa Vásquez, Guayubín, Castañuelas, Manzanillo y la Línea Noroeste.",
      gradient: "from-[#8A1017] via-zinc-900 to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
      showClock: false,
    },
    "montecristi-por-dentro": {
      description: "Guías locales para conocer Montecristi: playas, hoteles, excursiones, historia, cultura y lugares de interés de la provincia.",
      gradient: "from-[#031934] via-[#042564] to-black",
      accent: "#BF1B23",
      image: "/morroMontecristi.jpg",
    },
    larepublica: {
      description: "Noticias dominicanas de último minuto. Política, economía, sucesos y actualidad nacional.",
      gradient: "from-slate-900 via-zinc-900 to-[#8A1017]",
      accent: "#BF1B23",
      image: "/Protestas_Plaza_de_la_Bandera_día_uno.jpg",
    },
    farandula: {
      description: "Chismes, entretenimiento y farándula dominicana e internacional.",
      gradient: "from-[#8A1017] via-zinc-900 to-stone-950",
      accent: "#BF1B23",
      image: "/farandula.jpg",
    },
    viral: {
      description: "Contenido viral y tendencias que están encendiendo las redes sociales.",
      gradient: "from-zinc-900 via-[#8A1017] to-black",
      accent: "#BF1B23",
      image: "/viral.jpg",
    },
  },

  // ---- Google News (Subscribe with Google Basic) --------------------------------------------------------------
  googleNews: {
    enabled: Boolean(process.env.GOOGLE_NEWS_PUBLICATION_ID),
    publicationId: process.env.GOOGLE_NEWS_PUBLICATION_ID || "",
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
    { name: "Edición Impresa", href: "/edicion-impresa" },
    { name: "Combustibles", href: "/combustibles" },
    { name: "Montecristi", href: "/montecristi" },
    { name: "Montecristi por Dentro", href: "/montecristi-por-dentro" },
    { name: "Entretenimiento", href: "/entretenimiento" },
    { name: "Deportes", href: "/deportes" },
    { name: "Estilo", href: "/estilo" },
    { name: "Economía", href: "/economia" },
    { name: "Béisbol", href: "/beisbol" },
    { name: "Baloncesto", href: "/baloncesto" },
    { name: "Fútbol", href: "/futbol" },
    { name: "Efemérides", href: "/efemerides" },
    { name: "En Vivo", href: "/en-vivo" },
    { name: "Conócenos", href: "/conocenos" },
  ],

  // ---- Contacto ----------------------------------------------------------------------------------------------------------------------------------
  contact: {
    email: "redaccion@montecristi.net",
    phone: "+1 (809) 751-2222",
    address: "Montecristi, República Dominicana",
  },
};

export type SiteConfig = typeof siteConfig;
