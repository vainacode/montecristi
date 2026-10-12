import { getMontecristiPosts, getPosts, getCategorySlug, type WPPost } from '@/lib/wp';
import { siteConfig } from '@/config/site';

export const revalidate = 900;

const MAX_NEWS_URLS = 1_000;
const POSTS_PER_PAGE = 100;
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeEntities(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, number) => String.fromCharCode(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCharCode(parseInt(number, 16)));
}

async function getRecentPosts(fetchPage: (page: number) => Promise<WPPost[]>, cutoff: number): Promise<WPPost[]> {
  const recentPosts: WPPost[] = [];

  for (let page = 1; page <= 10; page++) {
    const batch = await fetchPage(page);
    if (!batch.length) break;

    const recentBatch = batch.filter((post) => {
      const publishedAt = new Date(post.date).getTime();
      return Number.isFinite(publishedAt) && publishedAt <= Date.now() && publishedAt >= cutoff;
    });
    recentPosts.push(...recentBatch);

    // WordPress returns posts newest first, so older pages cannot contain eligible articles.
    const oldestPost = batch.reduce((oldest, post) =>
      new Date(post.date).getTime() < new Date(oldest.date).getTime() ? post : oldest,
    );
    if (new Date(oldestPost.date).getTime() < cutoff || batch.length < POSTS_PER_PAGE) break;
  }

  return recentPosts;
}

export async function GET() {
  const now = Date.now();
  const cutoff = now - NEWS_WINDOW_MS;
  const [primaryPosts, montecristiPosts] = await Promise.all([
    getRecentPosts((page) => getPosts({ per_page: POSTS_PER_PAGE, page }), cutoff),
    getRecentPosts((page) => getMontecristiPosts({ per_page: POSTS_PER_PAGE, page }), cutoff),
  ]);

  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const uniquePosts = new Map<string, WPPost>();
  // Match getPostBySlug's primary-feed-first behavior and avoid listing copies
  // whose route resolves to a different canonical category.
  for (const post of [...primaryPosts, ...montecristiPosts]) {
    if (!post.slug) continue;
    if (uniquePosts.has(post.slug)) continue;
    uniquePosts.set(post.slug, post);
  }

  const entries = [...uniquePosts.entries()]
    .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_NEWS_URLS)
    .map(([, post]) => {
      const path = `${getCategorySlug(post)}/${post.slug}`;
      const url = escapeXml(`${baseUrl}/${path}`);
      const publishedAt = escapeXml(new Date(post.date).toISOString());
      const title = escapeXml(decodeEntities(post.title.rendered));

      return `  <url>\n    <loc>${url}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(siteConfig.name)}</news:name>\n        <news:language>es</news:language>\n      </news:publication>\n      <news:publication_date>${publishedAt}</news:publication_date>\n      <news:title>${title}</news:title>\n    </news:news>\n  </url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${entries.join('\n')}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=300',
    },
  });
}
