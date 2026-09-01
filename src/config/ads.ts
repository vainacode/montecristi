// =============================================================================
//  MONTECRISTI — CONFIGURACIÓN DE PUBLICIDAD
//  Para cambiar un anuncio solo edita la imagen y el enlace de esa sección.
// =============================================================================

// -----------------------------------------------------------------------------
//  PORTADA  (página principal montecristi.net)
// -----------------------------------------------------------------------------

const PORTADA = {
  // Anuncio en la parte superior (Top Leaderboard)
  topLeaderboard: { visible: true },
  // Anuncio grande debajo del bloque de noticias principales — tamaño 970×90 px
  bannerHorizontal: { visible: true },
  // --- Barra Lateral junto al Hero (Arriba) ---
  sidebarHeroRect1: { visible: true },
  sidebarHeroRect2: { visible: true },
  // --- Barra Lateral junto al Feed (Abajo) ---
  sidebarFeedRect: { visible: true },
  sidebarFeedVert: { visible: true },
};

const CATEGORIA = {
  // Anuncio debajo del banner de la categoría — tamaño 970×90 px
  bannerHorizontal: { visible: true },
  // Anuncio cuadrado en la barra lateral — tamaño 300×250 px
  bannerSidebar300x250: { visible: true },
  // Anuncio vertical en la barra lateral — tamaño 300×600 px
  bannerSidebar300x600: { visible: true },
};

const ARTICULO = {
  // Anuncio que aparece dentro del texto, después del 2do párrafo — tamaño 970×90 px
  bannerEnContenido: { visible: true },
  // Anuncio cuadrado en la barra lateral — tamaño 300×250 px
  bannerSidebar300x250: { visible: true },
  // Anuncio vertical en la barra lateral — tamaño 300×600 px
  bannerSidebar300x600: { visible: true },
};


// =============================================================================
//  NO TOQUES NADA DEBAJO DE ESTA LÍNEA
// =============================================================================

export const adsConfig = {
  portada: PORTADA,
  categoria: CATEGORIA,
  articulo: ARTICULO,

  // Mapa interno que usa el componente CustomAd — se genera automáticamente
  _internal: {
    config: {
      homeTopLeaderboard: PORTADA.topLeaderboard,
      homeAfterHero: PORTADA.bannerHorizontal,
      homeSidebarHero1: PORTADA.sidebarHeroRect1,
      homeSidebarHero2: PORTADA.sidebarHeroRect2,
      homeSidebarFeedRect: PORTADA.sidebarFeedRect,
      homeSidebarFeedVert: PORTADA.sidebarFeedVert,

      categoryAfterHero: CATEGORIA.bannerHorizontal,
      categorySidebarRect: CATEGORIA.bannerSidebar300x250,
      categorySidebarVert: CATEGORIA.bannerSidebar300x600,

      articleSidebarRect: ARTICULO.bannerSidebar300x250,
      articleSidebarVert: ARTICULO.bannerSidebar300x600,
      articleInContent: ARTICULO.bannerEnContenido,
    },
    alt: {
      horizontal: "Espacio publicitario — Anúnciate en Montecristi",
      rectangle: "Espacio publicitario — Anúnciate en Montecristi",
      vertical: "Publicidad — Montecristi Digital",
    },
  },
} as const;

export type AdsConfig = typeof adsConfig;
export type AdPosition = keyof typeof adsConfig._internal.config;
export type AdSize = 'horizontal' | 'rectangle' | 'vertical';
