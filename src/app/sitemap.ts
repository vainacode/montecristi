import { MetadataRoute } from 'next';
import { getCategories, getPosts, getCategorySlug, WPPost } from '@/lib/wp';
import { siteConfig } from '@/config/site';

export const revalidate = 900; // Regenera el sitemap cada 15 minutos para indexación rápida

/** Obtiene TODOS los artículos paginando de 100 en 100 hasta agotar resultados */
async function getAllPosts(): Promise<WPPost[]> {
  const all: WPPost[] = [];
  try {
    for (let page = 1; page <= 5; page++) {
      const batch = await getPosts({ per_page: 100, page });
      if (!batch || !batch.length) break;
      all.push(...batch);
      if (batch.length < 100) break;
    }
  } catch (e) {
    console.error('[Sitemap] Failed to fetch posts:', e);
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'https://montecristi.net';

  // 1. Rutas Estáticas Principales
  const staticRoutes = siteConfig.nav.map((route) => ({
    url: `${baseUrl}${route.href}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: route.href === '/' ? 1.0 : 0.85,
  }));

  // 2. Rutas Legales
  const legalRoutes = [
    '/aviso-legal',
    '/politica-de-privacidad',
    '/politica-de-cookies',
    '/terminos',
    '/mapa-del-sitio',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  try {
    // 3. Categorías Dinámicas
    const categories = await getCategories();
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.85,
    }));

    // 4. Todos los artículos con priorización de frescura (News SEO)
    const allPosts = await getAllPosts();
    const now = Date.now();
    const postRoutes = allPosts.map((post) => {
      const postTime = new Date(post.date).getTime();
      const ageHours = (now - postTime) / (1000 * 60 * 60);
      const isFresh = ageHours <= 48;

      return {
        url: `${baseUrl}/${getCategorySlug(post)}/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: isFresh ? ('hourly' as const) : ('monthly' as const),
        priority: isFresh ? 0.95 : 0.7,
      };
    });

    console.log(`[Sitemap] ${allPosts.length} artículos indexados en el sitemap.`);

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 1,
      },
      ...staticRoutes,
      ...legalRoutes,
      ...categoryRoutes,
      ...postRoutes,
    ];
  } catch (e) {
    console.error('[Sitemap] Error generando rutas dinámicas:', e);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 1,
      },
      ...staticRoutes,
      ...legalRoutes,
    ];
  }
}
