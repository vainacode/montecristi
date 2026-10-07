import "server-only";

/**
 * Fuentes de contenido. Solo se importa en el servidor: estas URLs nunca deben
 * llegar al JavaScript del navegador ni al HTML público.
 */
export const sources = {
  main: {
    api: "https://www.losmocanos.com/wp-json/wp/v2",
    feed: "https://www.losmocanos.com/feed/",
  },
  montecristi: {
    api: "https://www.santosvasquezinforma.com/wp-json/wp/v2",
    feed: "https://www.santosvasquezinforma.com/category/montecristi/feed/",
  },
};

/**
 * Orígenes de las fotos. Se publican como /media/<clave>/<ruta> para que el
 * dominio de la fuente no aparezca en el sitio.
 */
export const mediaOrigins: Record<string, string> = {
  a: "https://www.losmocanos.com",
  b: "https://www.santosvasquezinforma.com",
};

/** Nombres de marca de las fuentes que se reemplazan por el nombre del sitio. */
export const hiddenBrandPatterns: RegExp[] = [
  // Solo el dominio y la marca en una palabra: "los mocanos" a secas es un gentilicio
  // (gente de Moca) y puede aparecer en las noticias.
  /(?:www\.)?los\s?mocanos\.com/gi,
  /\bLosMocanos\b/gi,
  /(?:www\.)?santos?\s*v[aá]squez\s*informa(?:\.com)?/gi,
];
