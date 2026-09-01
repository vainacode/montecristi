import { MetadataRoute } from 'next';
import { getCategories, getPosts, getCategorySlug, WPPost } from '@/lib/wp';
import { siteConfig } from '@/config/site';

export const revalidate = 3600; // Regenera el sitemap cada hora

/** Obtiene TODOS los artículos paginando de 100 en 100 hasta agotar resultados */
async function getAllPosts(): Promise<WPPost[]> {
  // Limitamos a los 500 artículos más recientes para prevenir timeouts en el build de Vercel (> 60s)
  // 500 es un número balanceado para SEO y rendimiento de generación estática.
  const all: WPPost[] = [];
  try {
    // Intentamos traer los primeros 500 (WP API suele limitar a 100 por página)
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

  // 1. Rutas Estáticas
  const staticRoutes = siteConfig.nav.map((route) => ({
    url: `${baseUrl}${route.href}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 2. Rutas Legales
  const legalRoutes = [
    '/aviso-legal',
    '/politica-de-privacidad',
    '/politica-de-cookies',
    '/terminos',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  try {
    // 3. Categorías Dinámicas
    const categories = await getCategories();
    const categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }));

    // 4. Todos los artículos (paginado, sin límite artificial)
    const allPosts = await getAllPosts();
    const postRoutes = allPosts.map((post) => ({
      url: `${baseUrl}/${getCategorySlug(post)}/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'never' as const,
      priority: 0.6,
    }));

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
