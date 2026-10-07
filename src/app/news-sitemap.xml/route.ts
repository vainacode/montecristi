import { getPosts, getMontecristiPosts, getCategorySlug, type WPPost } from "@/lib/wp";
import { toPlainText } from "@/lib/wp-helpers";
import { siteConfig } from "@/config/site";

/**
 * Sitemap de Google News: solo artículos de las últimas 48 horas (máx. 1000),
 * con nombre de publicación, idioma, fecha y título, como pide Google News.
 */
export const revalidate = 300;

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [main, montecristi] = await Promise.all([
    getPosts({ per_page: 100 }).catch((): WPPost[] => []),
    getMontecristiPosts({ per_page: 50 }).catch((): WPPost[] => []),
  ]);

  const now = Date.now();
  const seen = new Set<string>();
  const recent = [...main, ...montecristi]
    .filter((post) => {
      const time = new Date(post.date).getTime();
      if (!Number.isFinite(time) || now - time > MAX_AGE_MS || seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 1000);

  const urls = recent
    .map((post) => {
      const loc = `${siteConfig.url}/${getCategorySlug(post)}/${post.slug}`;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.name)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.date).toISOString()}</news:publication_date>
      <news:title>${escapeXml(toPlainText(post.title.rendered))}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
