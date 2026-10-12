import type { MetadataRoute } from 'next';
import { getCategories, getMontecristiCategories, getPosts, getMontecristiPosts, getCategorySlug, getFeaturedImage, type WPPost } from '@/lib/wp';
import { siteConfig } from '@/config/site';
import { montecristiGuides } from '@/data/montecristiPorDentro';

// Refresh the sitemap hourly while keeping newly published pages discoverable quickly.
export const revalidate = 3600;

const POSTS_PER_SITEMAP_SOURCE = 24_000;
const POSTS_PER_PAGE = 100;

async function getAllPosts(fetchPage: (page: number) => Promise<WPPost[]>): Promise<WPPost[]> {
  const posts: WPPost[] = [];
  const maxPages = Math.ceil(POSTS_PER_SITEMAP_SOURCE / POSTS_PER_PAGE);

  for (let page = 1; page <= maxPages; page++) {
    const batch = await fetchPage(page);
    if (!batch.length) break;

    posts.push(...batch);
    if (batch.length < POSTS_PER_PAGE) break;
  }

  return posts;
}

function toValidDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const routes = new Map<string, MetadataRoute.Sitemap[number]>();

  // Only include public, indexable pages. Omit lastModified where the page has no reliable date.
  const staticPaths = [
    '/',
    '/montecristi-por-dentro',
    '/conoce-montecristi',
    '/conocenos',
    '/politica-editorial',
    '/contacto',
    '/en-vivo',
    '/edicion-impresa',
    '/combustibles',
    '/galerias',
    '/aviso-legal',
    '/politica-de-privacidad',
    '/politica-de-cookies',
    '/terminos',
    '/mapa-del-sitio',
    ...montecristiGuides.map(({ slug }) => `/montecristi-por-dentro/${slug}`),
  ];

  for (const path of staticPaths) {
    const url = new URL(path, `${baseUrl}/`).toString();
    routes.set(url, { url });
  }

  try {
    const [categories, montecristiCategories, primaryPosts, montecristiPosts] = await Promise.all([
      getCategories(),
      getMontecristiCategories(),
      getAllPosts((page) => getPosts({ per_page: POSTS_PER_PAGE, page })),
      getAllPosts((page) => getMontecristiPosts({ per_page: POSTS_PER_PAGE, page })),
    ]);

    // The dynamic category route supports configured editorial sections with published content.
    for (const category of [...categories, ...montecristiCategories]) {
      if (category.count <= 0 || !(category.slug in siteConfig.categoryConfig)) continue;
      const url = new URL(`/${category.slug}`, `${baseUrl}/`).toString();
      routes.set(url, { url });
    }

    // The article resolver checks the primary feed first by slug. Use the same
    // precedence here so sitemap URLs never point to a secondary copy that
    // permanently redirects to the primary article's canonical category.
    const seenSlugs = new Set<string>();
    for (const post of [...primaryPosts, ...montecristiPosts]) {
      if (!post.slug) continue;
      if (seenSlugs.has(post.slug)) continue;
      seenSlugs.add(post.slug);

      const categorySlug = getCategorySlug(post);
      const url = new URL(`/${categorySlug}/${post.slug}`, `${baseUrl}/`).toString();
      const lastModified = toValidDate(post.modified) ?? toValidDate(post.date);
      const image = getFeaturedImage(post);
      routes.set(url, {
        url,
        ...(lastModified ? { lastModified } : {}),
        ...(image ? { images: [image] } : {}),
      });
    }

    console.info(`[Sitemap] Generated ${routes.size} unique public URLs (${primaryPosts.length + montecristiPosts.length} source entries).`);
  } catch (error) {
    console.error('[Sitemap] Failed to load dynamic URLs:', error);
  }

  return Array.from(routes.values());
}
