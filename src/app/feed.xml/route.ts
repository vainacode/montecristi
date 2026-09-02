import { getPosts, getFeaturedImage, getCategorySlug } from "@/lib/wp";
import { siteConfig } from "@/config/site";

export const revalidate = 180; // Actualiza el feed cada 3 minutos

export async function GET() {
    const posts = await getPosts({ per_page: 30, includeContent: true });

    const feedItems = posts
        .map((post) => {
            const catSlug = getCategorySlug(post);
            const url = `${siteConfig.url}/${catSlug}/${post.slug}`;
            const imageUrl = getFeaturedImage(post);
            const description = post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 260);

            return `
        <item>
          <title><![CDATA[${post.title.rendered.replace(/<[^>]*>/g, "")}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <dc:creator><![CDATA[Redacción Montecristi]]></dc:creator>
          <category><![CDATA[${catSlug.toUpperCase()}]]></category>
          <description><![CDATA[${description}]]></description>
          <content:encoded><![CDATA[${post.content.rendered}]]></content:encoded>
          ${imageUrl ? `<media:content url="${imageUrl}" medium="image" width="1200" height="630"><media:title><![CDATA[${post.title.rendered.replace(/<[^>]*>/g, "")}]]></media:title></media:content>` : ""}
          ${imageUrl ? `<enclosure url="${imageUrl}" length="0" type="image/jpeg" />` : ""}
        </item>`;
        })
        .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" 
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:wfw="http://wellformedweb.org/CommentAPI/"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:atom="http://www.w3.org/2004/Atom"
      xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
      xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
      xmlns:media="http://search.yahoo.com/mrss/"
    >
      <channel>
        <title>${siteConfig.name} - Noticias de Montecristi y República Dominicana</title>
        <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
        <link>${siteConfig.url}</link>
        <description>${siteConfig.seo.description}</description>
        <language>es-DO</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <sy:updatePeriod>hourly</sy:updatePeriod>
        <sy:updateFrequency>1</sy:updateFrequency>
        ${feedItems}
      </channel>
    </rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=180, s-maxage=300, stale-while-revalidate=60",
        },
    });
}
