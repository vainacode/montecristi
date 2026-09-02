import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url || 'https://montecristi.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // Motores de Búsqueda y Google News
      {
        userAgent: [
          'Googlebot',
          'Googlebot-News',
          'Googlebot-Image',
          'Bingbot',
          'Applebot',
        ],
        allow: '/',
        disallow: ['/api/'],
      },
      // Motores de Inteligencia Artificial (ChatGPT, Perplexity, Gemini, Claude)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/feed.xml`,
    ],
    host: baseUrl,
  };
}
