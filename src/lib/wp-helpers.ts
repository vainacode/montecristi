/**
 * Tipos y utilidades puras de WordPress. Se puede importar desde componentes de
 * cliente: no contiene URLs de las fuentes ni hace peticiones.
 */

export function slugify(text: string): string {
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

export function getFeaturedImageGallery(gallery: WPGallery): string {
  if (gallery.featured_image?.source_url) {
    return gallery.featured_image.source_url;
  }
  return "";
}
