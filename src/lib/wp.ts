import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.api.wordpressUrl;

// Cache local con deduplicación y stale-while-revalidate. En despliegues serverless
// reduce los golpes repetidos a WordPress mientras la caché persistente de Next.js
// se encarga de compartir resultados entre invocaciones.
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

async function cachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = siteConfig.api.revalidate
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached) {
    if (cached.expiresAt > now) return cached.data;

    // No bloqueamos al visitante por una renovación vencida: devolvemos el dato
    // anterior y actualizamos la caché en segundo plano.
    if (!inFlightRequests.has(cacheKey)) {
      void refreshCache(cacheKey, fetcher, ttlSeconds);
    }
    return cached.data;
  }

  // Deduplicate in-flight requests (solves thundering herd problem)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = refreshCache(cacheKey, fetcher, ttlSeconds);

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

async function refreshCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const promise = (async () => {
    try {
      const data = await fetcher();
      if (data !== null && data !== undefined) {
        memoryCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
      return data;
    } catch (e) {
      const existing = memoryCache.get(cacheKey);
      if (existing) {
        return existing.data;
      }
      return null as any;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

// Algunos WordPress (Wordfence, LiteSpeed, Cloudflare) bloquean peticiones con el
// User-Agent por defecto de Node ("node"/"undici") y responden 403 o una página HTML
// de desafío. Enviamos cabeceras de navegador para que la API responda con JSON.
const WP_HEADERS: HeadersInit = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "es-DO,es;q=0.9,en;q=0.8",
};

// Función de fetch con timeout para evitar que la web se quede cargando infinito
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...WP_HEADERS, ...(options.headers || {}) },
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Pide un JSON a WordPress con un reintento. Lanza error si la respuesta no es
// válida, para que la caché no guarde un resultado vacío por un fallo temporal.
async function fetchWPJson<T = unknown>(url: string, revalidate: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { next: { revalidate } });
      if (!res.ok) {
        const error = new Error(`HTTP ${res.status} en ${url}`);
        // Un 4xx no se arregla reintentando (403 de un firewall, 400 de parámetros).
        if (res.status < 500) attempt = 1;
        throw error;
      }
      const text = await res.text();
      try {
        return JSON.parse(text.replace(/^\uFEFF/, "")) as T;
      } catch {
        throw new Error(`Respuesta no JSON en ${url}: ${text.slice(0, 120)}`);
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media?: number;
  featured_media_url?: string;
  jetpack_featured_media_url?: string;
  dum_api?: {
    author_name?: string;
    author_image?: string;
    categories_name?: string[];
    featured_media_url?: string;
  };
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
  yoast_head_json?: {
    title: string;
    og_title: string;
    og_description: string;
    og_image?: Array<{ url: string }>;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    canonical: string;
  };
  rank_math_head?: string;
  rank_math_head_json?: {
    title: string;
    description: string;
    og_title: string;
    og_description: string;
    og_image?: Array<{ url: string }>;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    canonical: string;
    robots: {
      index: string;
      follow: string;
    };
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// RESPALDO RSS
// Si la API REST de WordPress falla (desactivada, bloqueada por firewall/Cloudflare,
// caída), leemos el feed RSS público del mismo sitio y lo convertimos a WPPost.
// ════════════════════════════════════════════════════════════════════════════════

function decodeXml(text: string): string {
  // El contenido en CDATA ya es HTML tal cual; solo el texto fuera de CDATA lleva entidades XML.
  const cdata = text.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cdata) return cdata[1].trim();
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&")
    .trim();
}

function xmlTag(block: string, tag: string): string {
  const escaped = tag.replace(":", "\\:");
  const m = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
  return m ? decodeXml(m[1]) : "";
}

function slugFromLink(link: string): string {
  try {
    const parts = new URL(link).pathname.split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || "");
  } catch {
    return "";
  }
}

function hashId(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function parseFeed(xml: string): WPPost[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return items.map((item) => {
    const link = xmlTag(item, "link");
    const guid = xmlTag(item, "guid");
    const title = xmlTag(item, "title");
    const description = xmlTag(item, "description");
    const content = xmlTag(item, "content:encoded") || description;
    const pubDate = xmlTag(item, "pubDate");
    const date = pubDate && !isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : new Date().toISOString();
    const categoryNames = Array.from(item.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)).map((m) => decodeXml(m[1])).filter(Boolean);
    const image =
      item.match(/<media:content\b[^>]*url=["']([^"']+)["']/i)?.[1] ||
      item.match(/<media:thumbnail\b[^>]*url=["']([^"']+)["']/i)?.[1] ||
      item.match(/<enclosure\b[^>]*url=["']([^"']+)["'][^>]*type=["']image/i)?.[1] ||
      content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
      description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
      "";
    const id = Number(guid.match(/[?&]p=(\d+)/)?.[1]) || hashId(link || guid || title);
    const terms = categoryNames.map((name, i) => ({ id: i + 1, name, slug: slugify(name) }));

    return {
      id,
      date,
      slug: slugFromLink(link) || String(id),
      title: { rendered: title },
      excerpt: { rendered: description },
      content: { rendered: content },
      categories: [],
      jetpack_featured_media_url: image ? decodeXml(image) : undefined,
      _embedded: { "wp:term": [terms] },
    } as WPPost;
  }).filter((p) => p.title.rendered && p.slug);
}

/**
 * Lee un feed RSS de WordPress y devuelve los posts entre `offset` y `offset + perPage`.
 * WordPress entrega ~10 ítems por página del feed, así que pedimos `?paged=N` hasta tener suficientes.
 */
async function getFeedPosts(feedUrl: string, perPage: number, offset = 0): Promise<WPPost[]> {
  const needed = offset + perPage;
  const collected: WPPost[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 6 && collected.length < needed; page++) {
    const url = page === 1 ? feedUrl : `${feedUrl}${feedUrl.includes("?") ? "&" : "?"}paged=${page}`;
    let res: Response;
    try {
      res = await fetchWithTimeout(url, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
        next: { revalidate: siteConfig.api.revalidate },
      });
    } catch (e) {
      if (page === 1) throw e;
      break;
    }
    if (!res.ok) {
      if (page === 1) throw new Error(`Feed HTTP ${res.status} en ${url}`);
      break; // páginas siguientes que no existen devuelven 404
    }
    const xml = await res.text();
    if (page === 1 && !/<rss|<feed|<item/i.test(xml)) {
      throw new Error(`El feed no es RSS válido en ${url}: ${xml.slice(0, 120)}`);
    }
    const items = parseFeed(xml).filter((p) => !seen.has(p.slug) && seen.add(p.slug));
    if (items.length === 0) break;
    collected.push(...items);
  }

  return collected.slice(offset, needed);
}

function siteRootFromApi(apiUrl: string): string {
  return apiUrl.replace(/\/wp-json\/.*$/, "");
}

export async function getPosts(params: {
  category?: number;
  per_page?: number;
  page?: number;
  search?: string;
  tags?: number;
  offset?: number;
  includeContent?: boolean;
  /** Slug de la categoría, para usar su feed RSS si la API REST no responde. */
  categorySlug?: string;
} = {}): Promise<WPPost[]> {
  const query = new URLSearchParams();
  if (params.category) query.append('categories', params.category.toString());
  if (params.tags) query.append('tags', params.tags.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.page) query.append('page', params.page.toString());
  if (params.offset) query.append('offset', params.offset.toString());
  if (params.search) query.append('search', params.search);
  // Las listas solo necesitan título, imagen y categorías. Evitamos enviar el
  // contenido completo de cada artículo y el resto del payload de WordPress.
  const fields = [
    'id', 'date', 'slug', 'title', 'excerpt', 'featured_media',
    'featured_media_url', 'jetpack_featured_media_url', 'dum_api',
    'categories', '_links', '_embedded', 'yoast_head_json', 'rank_math_head_json',
  ];
  if (params.includeContent) fields.push('content');
  query.append('_embed', '1');
  query.append('_fields', fields.join(','));

  const cacheKey = `posts:${params.categorySlug ?? ''}:${query.toString()}`;

  const posts = await cachedFetch(cacheKey, async () => {
    try {
      // Sin ID de categoría (la API de categorías no respondió) solo sirve el feed de esa categoría.
      if (params.categorySlug && !params.category) throw new Error(`Categoría ${params.categorySlug} sin ID`);
      const data = await fetchWPJson<WPPost[]>(`${BASE_URL}/posts?${query.toString()}`, siteConfig.api.revalidate);
      if (!Array.isArray(data)) throw new Error('La API de posts no devolvió una lista');
      return data;
    } catch (e) {
      console.error('[WP] Error fetching posts:', e);
      // Búsquedas y etiquetas no tienen feed equivalente; una categoría solo si conocemos su slug.
      if (params.search || params.tags || (params.category && !params.categorySlug)) throw e;
      const feedUrl = params.categorySlug
        ? `${siteRootFromApi(BASE_URL)}/category/${params.categorySlug}/feed/`
        : siteConfig.api.feedUrl;
      const perPage = params.per_page || 10;
      const offset = params.offset ?? ((params.page || 1) - 1) * perPage;
      try {
        return await getFeedPosts(feedUrl, perPage, offset);
      } catch (feedError) {
        console.error('[WP] Error fetching RSS fallback:', feedError);
        throw e;
      }
    }
  }, siteConfig.api.revalidate);
  return Array.isArray(posts) ? posts : [];
}

export async function getMontecristiPosts(params: {
  per_page?: number;
  page?: number;
  offset?: number;
} = {}): Promise<WPPost[]> {
  const query = new URLSearchParams();
  query.append('categories', (siteConfig.api.montecristiCategoryId || 6).toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.page) query.append('page', params.page.toString());
  if (params.offset) query.append('offset', params.offset.toString());
  query.append('_embed', '1');
  const fields = [
    'id', 'date', 'slug', 'title', 'excerpt', 'featured_media',
    'featured_media_url', 'jetpack_featured_media_url', 'dum_api',
    'categories', '_links', '_embedded', 'yoast_head_json', 'rank_math_head_json',
  ];
  query.append('_fields', fields.join(','));

  const cacheKey = `montecristi:posts:${query.toString()}`;
  const montecristiBase = siteConfig.api.montecristiUrl || "https://www.santosvasquezinforma.com/wp-json/wp/v2";

  const posts = await cachedFetch(cacheKey, async () => {
    try {
      const data = await fetchWPJson<WPPost[]>(`${montecristiBase}/posts?${query.toString()}`, siteConfig.api.revalidate);
      if (!Array.isArray(data)) throw new Error('La API de Montecristi no devolvió una lista');
      return data;
    } catch (e) {
      console.error('[WP] Error fetching Montecristi posts:', e);
      const perPage = params.per_page || 10;
      const offset = params.offset ?? ((params.page || 1) - 1) * perPage;
      try {
        return await getFeedPosts(siteConfig.api.montecristiFeedUrl, perPage, offset);
      } catch (feedError) {
        console.error('[WP] Error fetching Montecristi RSS fallback:', feedError);
        throw e;
      }
    }
  }, siteConfig.api.revalidate);
  return Array.isArray(posts) ? posts : [];
}

/**
 * Busca un artículo por slug en ambas fuentes.
 * - `{ post }` con el artículo si existe.
 * - `{ post: null }` si WordPress respondió y el artículo NO existe (→ 404 real).
 * - `null` si ninguna fuente respondió (WordPress caído o bloqueado).
 */
export async function lookupPostBySlug(slug: string): Promise<{ post: WPPost | null } | null> {
  const cleanSlug = encodeURIComponent(decodeURIComponent(slug).trim());
  const cacheKey = `post:slug:${cleanSlug}`;
  const revalidate = siteConfig.api.revalidate;
  const montecristiBase = siteConfig.api.montecristiUrl || "https://www.santosvasquezinforma.com/wp-json/wp/v2";

  return cachedFetch(cacheKey, async () => {
    let anySourceAnswered = false;

    // 1. Fuente principal  2. Fuente de Montecristi (santosvasquezinforma.com)
    for (const base of [BASE_URL, montecristiBase]) {
      try {
        const posts = await fetchWPJson<WPPost[]>(`${base}/posts?slug=${cleanSlug}&_embed=1`, revalidate);
        anySourceAnswered = true;
        if (Array.isArray(posts) && posts.length > 0) return { post: posts[0] };
      } catch (e) {
        console.error(`[WP] Error fetching post by slug from ${base}:`, e);
      }
    }

    // 3. Si el slug es numérico (ID de post en santosvasquezinforma)
    if (/^\d+$/.test(cleanSlug)) {
      try {
        const res = await fetchWithTimeout(`${montecristiBase}/posts/${cleanSlug}?_embed=1`, {
          next: { revalidate },
        });
        if (res.ok || res.status === 404) anySourceAnswered = true;
        if (res.ok) {
          const postById = await res.json();
          if (postById && postById.id) return { post: postById as WPPost };
        }
      } catch (e) {
        console.error('[WP] Error fetching post by ID from Montecristi source:', e);
      }
    }

    // Sin respuesta de la API: buscamos el artículo en los feeds RSS recientes.
    if (!anySourceAnswered) {
      const wanted = decodeURIComponent(cleanSlug);
      for (const feedUrl of [siteConfig.api.feedUrl, siteConfig.api.montecristiFeedUrl]) {
        try {
          const found = (await getFeedPosts(feedUrl, 30)).find((p) => p.slug === wanted || String(p.id) === wanted);
          if (found) return { post: found };
        } catch (e) {
          console.error(`[WP] Error buscando el slug en el feed ${feedUrl}:`, e);
        }
      }
      // Lanzamos para no cachear un falso "no existe".
      throw new Error(`WordPress no respondió para el slug ${cleanSlug}`);
    }
    return { post: null };
  }, revalidate);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  return (await lookupPostBySlug(slug))?.post ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const cacheKey = 'categories:all';

  const categories = await cachedFetch(cacheKey, async () => {
    try {
      const data = await fetchWPJson<WPCategory[]>(`${BASE_URL}/categories?per_page=50`, 86400); // Cache for 24 hours
      if (!Array.isArray(data)) throw new Error('La API de categorías no devolvió una lista');
      return data;
    } catch (e) {
      console.error('[WP] Error fetching categories:', e);
      throw e;
    }
  }, 86400);
  return Array.isArray(categories) ? categories : [];
}

export async function getMedia(id: number) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/media/${id}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getTrendingPosts(): Promise<WPPost[]> {
  try {
    const posts = await getPosts({ per_page: siteConfig.content.topPostsCount });
    if (posts && posts.length > 0) return posts;
  } catch (e) {
    // disregard
  }

  return [];
}

// Las URLs que vienen de WordPress a veces llegan como "http://", "//host/..." o
// con entidades HTML ("&amp;"). En un sitio HTTPS eso rompe la carga de la foto.
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  let clean = url.trim().replace(/&amp;/g, "&").replace(/&#0?38;/g, "&");
  if (clean.startsWith("//")) clean = `https:${clean}`;
  if (clean.startsWith("http://")) clean = `https://${clean.slice(7)}`;
  return clean;
}

export function getFeaturedImage(post: WPPost): string {
  return normalizeImageUrl(getRawFeaturedImage(post));
}

function getRawFeaturedImage(post: WPPost): string {
  // 1. De Último Minuto API featured media
  if (post.dum_api?.featured_media_url) return post.dum_api.featured_media_url;

  // 2. Jetpack featured media url
  if (post.jetpack_featured_media_url) return post.jetpack_featured_media_url;

  // 3. Direct featured media url
  if (post.featured_media_url) return post.featured_media_url;

  // 4. Standard WP Featured Media
  const media = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (media) return media;

  // 5. Yoast SEO / OG Image Fallback
  const ogImage = post.yoast_head_json?.og_image?.[0]?.url;
  if (ogImage) return ogImage;

  const twitterImage = post.yoast_head_json?.twitter_image;
  if (twitterImage) return twitterImage;

  // 6. Rank Math Image Fallback
  const rmImage = post.rank_math_head_json?.og_image?.[0]?.url || post.rank_math_head_json?.twitter_image;
  if (rmImage) return rmImage;

  // 7. Extract high-res image from content (data-orig-file or data-large-file or src)
  if (post.content?.rendered) {
    const origMatch = post.content.rendered.match(/data-orig-file=["']([^"']+)["']/i);
    if (origMatch && origMatch[1]) return origMatch[1];

    const largeMatch = post.content.rendered.match(/data-large-file=["']([^"']+)["']/i);
    if (largeMatch && largeMatch[1]) return largeMatch[1];

    const match = post.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }

  // 8. Extract from excerpt
  if (post.excerpt?.rendered) {
    const origMatch = post.excerpt.rendered.match(/data-orig-file=["']([^"']+)["']/i);
    if (origMatch && origMatch[1]) return origMatch[1];

    const match = post.excerpt.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }

  return "";
}

export function getCategoryNames(post: WPPost): string[] {
  if (post.dum_api?.categories_name && post.dum_api.categories_name.length > 0) {
    return post.dum_api.categories_name;
  }
  const terms = post._embedded?.['wp:term']?.[0];
  if (terms && terms.length > 0) {
    return terms.map(t => t.name);
  }
  return ["NOTICIAS"];
}

export function getCategorySlug(post: WPPost): string {
  const terms = post._embedded?.['wp:term']?.[0];
  if (terms?.[0]?.slug) return terms[0].slug;

  if (post.dum_api?.categories_name && post.dum_api.categories_name.length > 0) {
    return slugify(post.dum_api.categories_name[0]);
  }

  return 'noticias';
}

// ════════════════════════════════════════════════════════════════════════════════
// GALLERIES API
// ════════════════════════════════════════════════════════════════════════════════

export interface WPGallery {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  date: string;
  author: {
    id: number;
    name: string;
  };
  featured_image: {
    id: number;
    source_url: string;
    thumbnail: string;
    medium: string;
    large: string;
    alt_text: string;
  } | null;
  photos_count: number;
  content?: string;
  photos?: Array<{
    id: number;
    url: string;
    width: number;
    height: number;
    thumbnail: string;
    medium: string;
    large: string;
    alt: string;
    caption: string;
  }>;
}

export interface WPGalleryResponse {
  success: boolean;
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  data: WPGallery | WPGallery[];
  error?: string;
}

export async function getGalleries(params: {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
  author?: number;
  orderby?: string;
  order?: string;
} = {}): Promise<{ galleries: WPGallery[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category.toString());
  if (params.author) query.append('author', params.author.toString());
  if (params.orderby) query.append('orderby', params.orderby);
  if (params.order) query.append('order', params.order);

  const cacheKey = `galleries:${query.toString()}`;

  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/galerias?${query.toString()}`, {
        next: { revalidate: siteConfig.api.revalidate },
      });

      if (!res.ok) return { galleries: [], total: 0, totalPages: 0 };

      const data: WPGalleryResponse = await res.json();
      if (!data.success || !Array.isArray(data.data)) {
        return { galleries: [], total: 0, totalPages: 0 };
      }

      return {
        galleries: data.data,
        total: data.total || 0,
        totalPages: data.total_pages || 0,
      };
    } catch (e) {
      console.error('[WP] Error fetching galleries:', e);
      return { galleries: [], total: 0, totalPages: 0 };
    }
  }, siteConfig.api.revalidate);
}

export async function getGalleryBySlug(slug: string): Promise<WPGallery | null> {
  const cacheKey = `gallery:slug:${slug}`;

  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/galerias/${slug}`, {
        next: { revalidate: siteConfig.api.revalidate * 5 }, // 5x revalidate time for detail pages
      });

      if (!res.ok) return null;

      const data: WPGalleryResponse = await res.json();
      if (!data.success || !data.data || typeof data.data !== 'object') {
        return null;
      }

      // Handle both direct gallery object and wrapped in 'data' property
      const gallery = Array.isArray(data.data) ? null : data.data;
      return gallery || null;
    } catch (e) {
      console.error('[WP] Error fetching gallery by slug:', e);
      return null;
    }
  }, siteConfig.api.revalidate * 5);
}

export function getFeaturedImageGallery(gallery: WPGallery): string {
  if (gallery.featured_image?.source_url) {
    return gallery.featured_image.source_url;
  }
  return "";
}
