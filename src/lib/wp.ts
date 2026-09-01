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

// Función de fetch con timeout para evitar que la web se quede cargando infinito
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
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

export async function getPosts(params: {
  category?: number;
  per_page?: number;
  page?: number;
  search?: string;
  tags?: number;
  offset?: number;
  includeContent?: boolean;
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
    'categories', '_embedded.wp:featuredmedia', '_embedded.wp:term',
  ];
  if (params.includeContent) fields.push('content');
  query.append('_embed', '1');
  query.append('_fields', fields.join(','));

  const cacheKey = `posts:${query.toString()}`;

  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/posts?${query.toString()}`, {
        next: { revalidate: siteConfig.api.revalidate },
      });

      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('[WP] Error fetching posts:', e);
      return [];
    }
  }, siteConfig.api.revalidate);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const cleanSlug = encodeURIComponent(decodeURIComponent(slug).trim());
  const cacheKey = `post:slug:${cleanSlug}`;

  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/posts?slug=${cleanSlug}&_embed=1`, {
        next: { revalidate: siteConfig.api.revalidate },
      });

      if (!res.ok) return null;
      const posts = await res.json();
      return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch (e) {
      console.error('[WP] Error fetching post by slug:', e);
      return null;
    }
  }, siteConfig.api.revalidate);
}

export async function getCategories(): Promise<WPCategory[]> {
  const cacheKey = 'categories:all';

  return cachedFetch(cacheKey, async () => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/categories?per_page=50`, {
        next: { revalidate: 86400 }, // Cache for 24 hours
      });

      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('[WP] Error fetching categories:', e);
      return [];
    }
  }, 86400);
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

export function getFeaturedImage(post: WPPost): string {
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
