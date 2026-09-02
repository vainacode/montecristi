export const revalidate = 30;

import { getPostBySlug, getPosts, getFeaturedImage, getCategoryNames, getCategorySlug, getTrendingPosts, WPPost } from "@/lib/wp";
import { NewsCard } from "@/components/NewsCard";
import { ProtectedImage } from "@/components/ProtectedImage";
import { MostRead } from "@/components/MostRead";
import { CustomAd } from "@/components/CustomAd";
import { AuthorBox } from "@/components/AuthorBox";
import { ListenButton } from "@/components/AudioNewsReader";
import { ViewTracker } from "@/components/ViewTracker";
import { siteConfig } from "@/config/site";
import { adsConfig } from "@/config/ads";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { ApiFallbackScreen } from "@/components/ApiFallbackScreen";

interface ArticlePageProps {
  params: Promise<{ category: string, slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { robots: { index: false, follow: false } };

  const rm = post.rank_math_head_json;
  const yoast = post.yoast_head_json;

  const rawImage = getFeaturedImage(post);
  const siteDefault = `${siteConfig.url}${siteConfig.seo.defaultImage}`;

  // La og:image SIEMPRE debe ser una URL absoluta accesible por los crawlers de Google/Facebook.
  // Prioridad: Rank Math → Yoast → imagen destacada del post → imagen por defecto del sitio.
  const ogImageUrl =
    rm?.og_image?.[0]?.url ||
    yoast?.og_image?.[0]?.url ||
    rawImage ||
    siteDefault;

  const twitterImageUrl =
    rm?.twitter_image ||
    yoast?.twitter_image ||
    rawImage ||
    siteDefault;

  const title = rm?.title || yoast?.title || post.title.rendered.replace(/<[^>]*>/g, '');
  const description =
    rm?.description ||
    yoast?.og_description ||
    post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160);

  const canonicalUrl = `${siteConfig.url}/${getCategorySlug(post)}/${post.slug}`;
  const keywords = post._embedded?.['wp:term']?.[1]?.map((t: any) => t.name).join(', ') || siteConfig.seo.keywords.join(', ');
  const categoryNames = getCategoryNames(post);

  return {
    title,
    description,
    keywords,
    openGraph: {
      type: "article",
      title: rm?.og_title || yoast?.og_title || title,
      description: rm?.og_description || yoast?.og_description || description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "es_DO",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Jose Veras"],
      section: categoryNames[0] || "Noticias",
    },
    twitter: {
      card: 'summary_large_image',
      title: rm?.twitter_title || yoast?.twitter_title || title,
      description: rm?.twitter_description || yoast?.twitter_description || description,
      images: [twitterImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    facebook: { appId: siteConfig.seo.facebookAppId },
  };
}

// Lista de dominios de feeds/fuentes a convertir en enlaces internos propios
const SOURCE_DOMAINS = [
  'noticiariord.net',
  'santosvasquezinforma.com',
  'www.santosvasquezinforma.com',
  'diarioaldia.com',
  'relojinformativo.do',
  'morroinformativo.com',
  'deultimominuto.net',
  'remolacha.net'
];

// Utility to clean and format content, convert links and sanitize brands
function formatContent(content: string, currentCategory = 'noticias') {
  let processed = content;

  // 1. ---- ELIMINAR ANUNCIOS Y CÓDIGOS DE TERCEROS INCRUSTADOS EN EL FEED WP ----
  processed = processed
    .replace(/<ins\b[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, '')
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?(?:adsbygoogle|taboola|outbrain|mgid|propeller|monetag)[\s\S]*?<\/script>/gi, '')
    .replace(/<div\b[^>]*class="[^"]*(?:ad-slot|ad-unit|ad_banner|wp-block-ad|anuncio|publicidad|adsbygoogle|banner-ad|ad-wrapper|code-block|advertisement)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, ''); // comentarios de WordPress

  // 2. ---- SANITIZACIÓN DE MARCA (Hacer que siempre pertenezca a Montecristi.net) ----
  processed = processed
    // Encabezados de agencia de noticias al inicio: "Diario al Día| ...", "Noticiario RD | ...", "Santos Vasquez Informa | ..."
    .replace(/(?:Diario al D[ií]a|Noticiario RD|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\s*\|\s*/gi, 'Redacción Montecristi | ')
    .replace(/(?:Diario al D[ií]a|Noticiario RD|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\s*[-–—]\s*/gi, 'Redacción Montecristi — ')
    // Referencias a la publicación en el cuerpo del texto
    .replace(/\b(?:para|en|por|según|informó|reportó|exclusiva de)\s+(?:Noticiario RD|Diario al D[ií]a|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\b/gi, (match) => {
      return match.replace(/(?:Noticiario RD|Diario al D[ií]a|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)/gi, siteConfig.name);
    })
    .replace(/\b(?:Noticiario RD|Diario al D[ií]a|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\b/gi, siteConfig.name);

  // 3. ---- Convertir todos los <br> y saltos de línea de WordPress en párrafos reales ----
  processed = processed
    .replace(/<br\s*\/?>\s*/gi, '</p><p>')
    .replace(/(?:<\/p>\s*<p>)+/gi, '</p><p>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');

  // 4. ---- CONVERSIÓN DE ENLACES: INTERNOS A NUESTRO SITIO, EXTERNOS CON TARGET BLANK ----
  processed = processed.replace(
    /<a\s+([^>]*?)href=(["'])(.*?)\2([^>]*?)>([\s\S]*?)<\/a>/gi,
    (_match, before, _quote, rawHref, after, text) => {
      const cleanHref = rawHref.trim();
      let isSourceDomain = false;
      let path = '';

      try {
        if (cleanHref.startsWith('/') && !cleanHref.startsWith('//')) {
          isSourceDomain = true;
          path = cleanHref;
        } else {
          const parsed = new URL(cleanHref);
          const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
          if (SOURCE_DOMAINS.some(d => host === d || host.endsWith('.' + d))) {
            isSourceDomain = true;
            path = parsed.pathname;
          }
        }
      } catch {
        // Enlace relativo o malformado
        if (cleanHref.startsWith('/')) {
          isSourceDomain = true;
          path = cleanHref;
        }
      }

      if (isSourceDomain) {
        // Convertir enlace a la ruta interna de montecristi.net
        const cleanPath = path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        let internalUrl = '/';
        if (cleanPath) {
          const parts = cleanPath.split('/').filter(Boolean);
          if (parts.length === 1) {
            internalUrl = `/${currentCategory}/${parts[0]}`;
          } else {
            internalUrl = `/${cleanPath}`;
          }
        }

        const attrs = (before + ' ' + after)
          .replace(/\s*(?:target|rel)=["'][^"']*["']/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        return `<a href="${internalUrl}"${attrs ? ' ' + attrs : ''} class="text-brand-dark hover:text-brand-light font-bold underline decoration-brand-dark/30 hover:decoration-brand-dark transition-colors">${text}</a>`;
      }

      // Enlaces externos auténticos (mantener target="_blank" rel="noopener noreferrer")
      const attrs = (before + ' ' + after)
        .replace(/\s*(?:target|rel)=["'][^"']*["']/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer"${attrs ? ' ' + attrs : ''} class="text-brand-dark hover:text-brand-light font-bold underline decoration-brand-dark/30 hover:decoration-brand-dark transition-colors">${text}</a>`;
    }
  );

  // 5. ---- Párrafos con enlace único → botón CTA con estilo por plataforma ----
  processed = processed.replace(
    /<p([^>]*)>\s*(?:<(?:strong|b|em|i)>\s*)*<a\s+href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>\s*(?:<\/(?:strong|b|em|i)>\s*)*<\/p>/gi,
    (_match, _pAttrs, href, _aAttrs, rawText) => {
      const text = rawText.replace(/<[^>]*>/g, '').trim();
      if (!text) return _match;

      const isTelegram = /t\.me|telegram/i.test(href);
      const isWhatsApp = /whatsapp|wa\.me/i.test(href);
      const isInstagram = /instagram\.com/i.test(href);
      const isTwitter = /twitter\.com|x\.com/i.test(href);
      const isFacebook = /facebook\.com/i.test(href);
      const isYouTube = /youtube\.com|youtu\.be/i.test(href);

      let bg = '#8B0000';
      let hoverBg = '#FF0000';
      let platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

      if (isTelegram) {
        bg = '#0088cc'; hoverBg = '#0077b5';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.01 9.475c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.239l-2.95-.924c-.642-.2-.654-.642.135-.95l11.512-4.437c.537-.194 1.006.13.385.32z"/></svg>`;
      } else if (isWhatsApp) {
        bg = '#25D366'; hoverBg = '#20b858';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;
      } else if (isInstagram) {
        bg = '#833ab4'; hoverBg = '#bc1888';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;
      } else if (isTwitter) {
        bg = '#000000'; hoverBg = '#1a1a1a';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
      } else if (isFacebook) {
        bg = '#1877F2'; hoverBg = '#1464d8';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
      } else if (isYouTube) {
        bg = '#FF0000'; hoverBg = '#cc0000';
        platformIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white"/></svg>`;
      }

      const isExternal = /^https?:\/\//i.test(href);
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

      return `<div class="not-prose my-10 flex justify-center">
  <a href="${href}" ${targetAttr}
     style="display:inline-flex;align-items:center;gap:12px;background:${bg};color:white;padding:14px 28px;border-radius:12px;font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,0.18);transition:all 0.2s ease;"
     onmouseover="this.style.background='${hoverBg}';this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.25)'"
     onmouseout="this.style.background='${bg}';this.style.transform='translateY(0)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'">
    ${platformIcon}
    <span>${text}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>
</div>`;
    }
  );

  // 6. ---- YouTube Embed ------------------------------------------------------------------------------------
  processed = processed.replace(
    /<iframe[^>]+?src=['"]([^'"]*?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)[^'"]*)['"][^>]*>\s*<\/iframe>/gi,
    (match, src) => {
      const otherAttrs = match
        .replace(/<iframe/i, '')
        .replace(/<\/iframe>/i, '')
        .replace(/\s*(?:width|height|style|class|src)\s*=\s*(["'])(?:(?!\1).)*\1/gi, '')
        .replace(/\s*(?:width|height|style|class|src)\s*=\s*[^"'\s>]+/gi, '')
        .replace(/>\s*$/, '');

      return `<div class="group my-16 relative not-prose">
  <div class="absolute -inset-2 bg-red-600/8 blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
  <div class="bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white"/></svg>
      <span class="text-[11px] font-black uppercase tracking-[0.25em]">Video</span>
      <span class="ml-auto text-[9px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-2.5 py-0.5 rounded-full">YouTube</span>
    </div>
    <div class="relative w-full aspect-video">
      <iframe src="${src}" class="absolute inset-0 w-full h-full border-0" loading="lazy" ${otherAttrs}></iframe>
    </div>
  </div>
</div>`;
    }
  );

  // 7. ---- Dailymotion Embed --------------------------------------------------------------------------------
  processed = processed.replace(
    /<iframe[^>]+?src=['"]([^'"]*?(?:dailymotion\.com|geo\.dailymotion\.com)[^'"]*)['"][^>]*>\s*<\/iframe>/gi,
    (_match, src) => {
      return `<div class="group my-16 relative not-prose">
  <div class="bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#0066dc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.01 9.475c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.239l-2.95-.924c-.642-.2-.654-.642.135-.95l11.512-4.437c.537-.194 1.006.13.385.32z"/></svg>
      <span class="text-[11px] font-black uppercase tracking-[0.25em]">Video</span>
      <span class="ml-auto text-[9px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-2.5 py-0.5 rounded-full">Dailymotion</span>
    </div>
    <div class="relative w-full aspect-video">
      <iframe src="${src}" class="absolute inset-0 w-full h-full border-0" loading="lazy" allowfullscreen="true"></iframe>
    </div>
  </div>
</div>`;
    }
  );

  // 8. ---- Instagram Embed -----------------------------------------------------------------------------------
  processed = processed.replace(
    /(<blockquote class="instagram-media"[^>]*>[\s\S]*?<\/blockquote>)/gi,
    (match) => {
      const slugMatch = /instagram\.com\/(?:p|reels|reel|tv)\/([^/?#&\s]+)/i.exec(match);
      const slug = slugMatch ? slugMatch[1] : null;

      if (!slug) return match;

      return `<div class="group my-24 flex justify-center not-prose">
  <div class="relative bg-[#121212] p-2 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-700 hover:shadow-[0_50px_100px_rgba(220,39,67,0.15)] hover:-translate-y-1 w-full max-w-[540px]">
    <div class="absolute -inset-2 bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
    <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 mb-2 bg-white/5 rounded-t-[2rem]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-[0_0_15px_rgba(188,24,136,0.3)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        </div>
        <span class="text-white text-[11px] font-black uppercase tracking-[0.3em]">Instagram</span>
      </div>
      <div class="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
         <div class="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></div>
         <span class="text-[8px] text-white/40 font-black uppercase tracking-widest">Post Original</span>
      </div>
    </div>
    <div class="overflow-hidden rounded-b-[1.8rem] bg-zinc-50 border border-gray-100 flex items-center justify-center">
      <iframe src="https://www.instagram.com/p/${slug}/embed" width="100%" height="640" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy" class="border-0 m-0 p-0" style="border:none; overflow:hidden;"></iframe>
    </div>
  </div>
</div>`;
    }
  );

  // 9. ---- Twitter / X Embed ---------------------------------------------------------------------------------
  processed = processed.replace(
    /(<blockquote class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>)/gi,
    (match) => `<div class="group my-16 flex justify-center not-prose">
  <div class="bg-black rounded-2xl overflow-hidden w-full max-w-[550px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-white/8">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      <span class="text-white text-[11px] font-black uppercase tracking-[0.25em]">Publicación en X</span>
      <span class="ml-auto text-[9px] text-white/30 font-bold uppercase tracking-widest border border-white/10 px-2.5 py-0.5 rounded-full">Twitter / X</span>
    </div>
    <div class="px-4 pb-4 pt-2 bg-[#16181c]">${match}</div>
  </div>
</div>`
  );

  // 10. ---- Facebook Video / Reel -----------------------------------------------------------------------------
  processed = processed.replace(
    /<iframe[^>]*src="[^"]*?facebook\.com\/plugins\/video\.php[^"]*"[^>]*>\s*<\/iframe>/gi,
    (match) => `<div class="group my-24 flex justify-center not-prose">
  <div class="relative bg-[#18191a] p-2 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/5 transition-all duration-700 hover:shadow-[0_50px_100px_rgba(24,119,242,0.15)] hover:-translate-y-1">
    <div class="absolute -inset-2 bg-gradient-to-tr from-[#1877F2]/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
    <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 mb-2 bg-white/5 rounded-t-[2rem]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shadow-[0_0_15px_rgba(24,119,242,0.5)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </div>
        <span class="text-white text-[11px] font-black uppercase tracking-[0.3em]">Facebook Video</span>
      </div>
      <div class="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
         <div class="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
         <span class="text-[8px] text-white/40 font-black uppercase tracking-widest">HD Ready</span>
      </div>
    </div>
    <div class="overflow-hidden rounded-b-[1.8rem] bg-black flex items-center justify-center">${match.replace('<iframe', '<iframe loading="lazy"')}</div>
  </div>
</div>`
  );

  // 11. ---- Facebook Post -------------------------------------------------------------------------------------
  processed = processed.replace(
    /<iframe[^>]*src="[^"]*?facebook\.com\/plugins\/(?!video)[^"]*"[^>]*>\s*<\/iframe>/gi,
    (match) => {
      const iframe = match
        .replace('<iframe', '<iframe loading="lazy"')
        .replace(/\s+width="[^"]*"/, ' width="100%"')
        .replace(/style="[^"]*"/, 'style="border:none;overflow:hidden;width:100%"');
      return `<div class="group my-16 flex justify-center not-prose">
  <div class="bg-white rounded-2xl overflow-hidden w-full max-w-[550px] shadow-[0_20px_60px_rgba(24,119,242,0.12)] ring-1 ring-[#1877F2]/15">
    <div class="flex items-center gap-3 px-5 py-3.5 bg-[#1877F2]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      <span class="text-white text-[11px] font-black uppercase tracking-[0.25em]">Publicación en Facebook</span>
      <span class="ml-auto text-[9px] text-white/60 font-bold uppercase tracking-widest border border-white/20 px-2.5 py-0.5 rounded-full">Facebook</span>
    </div>
    <div class="flex justify-center p-4">${iframe}</div>
  </div>
</div>`;
    }
  );

  // 12. ---- Lazy load + Centrar Imágenes ------------------------------------------------------------------------
  processed = processed.replace(/<img(?![^>]*\bloading\b)([^>]*)\/?>/gi, (match, attrs) => `<img loading="lazy" decoding="async"${attrs}>`);
  processed = processed.replace(/<img([^>]*)\/?>/gi, (_m, attrs) => {
    if (/style=/.test(attrs)) return `<img${attrs.replace(/style="([^"]*)"/, 'style="$1;display:block;margin-left:auto;margin-right:auto"')}>`;
    return `<img${attrs} style="display:block;margin-left:auto;margin-right:auto">`;
  });

  // 13. ---- Limpiar WordPress CMS Markers ----------------------------------------------------------------------
  processed = processed
    .replace(/\sclass="([^"]*)"/gi, (_, classValue) => {
      const cleaned = classValue.replace(/\bwp-block-\S+/g, '').replace(/\bhas-\S*-background-color\S*/g, '').replace(/\bis-layout-\S+/g, '').replace(/\bwp-[a-z][a-z-]*\b/g, '').replace(/\s{2,}/g, ' ').trim();
      return cleaned ? ` class="${cleaned}"` : '';
    })
    .replace(/data-wp-[^=\s]*="[^"]*"\s*/gi, '');

  // 14. ---- Marca de Agua Invisible (Anti-Scraping) ------------------------------------------------------------
  const watermark = `<div style="display:none;font-size:1px;color:transparent;opacity:0;">Este contenido pertenece a ${siteConfig.name} - ${siteConfig.url}. Prohibida su reproducción no autorizada.</div>`;
  
  return processed + watermark;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  return <ArticleContent slug={slug} />;
}

async function ArticleContent({ slug }: { slug: string }) {
  // Ejecutamos las peticiones en paralelo para no bloquear secuencialmente
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <ApiFallbackScreen 
        message="No se ha podido encontrar o sincronizar el artículo solicitado. Es posible que haya sido reubicado o que la conexión esté temporalmente interrumpida." 
      />
    );
  }

  const categoryId = post.categories?.[0];

  // Estas peticiones pueden ir en paralelo mientras procesamos el post
  const [trendingPosts, relatedPostsRaw] = await Promise.all([
    getTrendingPosts(),
    getPosts({ category: categoryId, per_page: 7 })
  ]).catch(() => [[], []]);

  const relatedPosts = relatedPostsRaw
    .filter(p => p.id !== post.id)
    .slice(0, 6);

  const imageUrl = getFeaturedImage(post);
  const categories = getCategoryNames(post);
  const catSlug = getCategorySlug(post);
  const postTags = post._embedded?.['wp:term']?.[1] || [];
  const shareUrl = `${siteConfig.url}/${catSlug}/${slug}`;
  const shareTitle = post.title.rendered;

  const formattedContent = formatContent(post.content.rendered, catSlug);
  
  // Dividir el contenido para inyectar publicidad de forma limpia y equilibrada
  const rawParagraphs = formattedContent.split('</p>').map(p => p.trim()).filter(Boolean);
  const totalParas = rawParagraphs.length;
  
  const showFirstAd = adsConfig.articulo.bannerEnContenido.visible && totalParas >= 4;
  const showSecondAd = adsConfig.articulo.bannerEnContenido.visible && totalParas >= 9;

  const splitIndex1 = showFirstAd ? Math.min(3, Math.floor(totalParas / 2)) : totalParas;
  const splitIndex2 = showSecondAd ? Math.min(splitIndex1 + 5, Math.floor(totalParas * 0.75)) : totalParas;

  const contentParts = {
    part1: rawParagraphs.slice(0, splitIndex1).map(p => p.endsWith('</p>') ? p : p + '</p>').join(''),
    part2: showFirstAd 
      ? rawParagraphs.slice(splitIndex1, splitIndex2).map(p => p.endsWith('</p>') ? p : p + '</p>').join('')
      : '',
    part3: showSecondAd 
      ? rawParagraphs.slice(splitIndex2).map(p => p.endsWith('</p>') ? p : p + '</p>').join('')
      : ''
  };

  const rawContent = post.content.rendered.toLowerCase();
  const hasYouTube = rawContent.includes('youtube.com') || rawContent.includes('youtu.be');
  const hasInstagram = rawContent.includes('instagram-media');
  const hasTwitter = rawContent.includes('twitter-tweet');
  const hasFacebook = rawContent.includes('facebook.com/plugins') || rawContent.includes('fb-post');

  const siteDefault = `${siteConfig.url}${siteConfig.seo.defaultImage}`;
  const cleanHeadline = post.title.rendered.replace(/<[^>]*>/g, '');
  const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${shareUrl}#article`,
        ...(siteConfig.googleNews.enabled && siteConfig.googleNews.publicationId ? {
          "isPartOf": {
            "@type": ["CreativeWork", "Product"],
            "name": siteConfig.name,
            "productID": `${siteConfig.googleNews.publicationId}:${siteConfig.googleNews.productId}`
          }
        } : {
          "isPartOf": {
            "@type": ["CreativeWork", "WebSite"],
            "name": siteConfig.name,
            "url": siteConfig.url
          }
        }),
        "headline": cleanHeadline,
        "description": cleanExcerpt,
        "image": imageUrl ? [imageUrl] : [siteDefault],
        "datePublished": new Date(post.date).toISOString(),
        "dateModified": new Date(post.date).toISOString(),
        "inLanguage": "es-DO",
        "isAccessibleForFree": "True",
        "articleSection": categories[0] || "Noticias",
        "keywords": postTags.map((t: any) => t.name).join(", "),
        "author": {
          "@type": "Person",
          "name": "Redacción Montecristi",
          "url": `${siteConfig.url}/conocenos`,
          "jobTitle": "Equipo Editorial"
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": siteConfig.name,
          "url": siteConfig.url,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteConfig.url}/logo.svg`,
            "width": "420",
            "height": "80"
          }
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".article-lead", ".article-body p"]
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": shareUrl
        },
        "articleBody": post.content.rendered.replace(/<[^>]*>/g, '').slice(0, 3000)
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${shareUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": siteConfig.url
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categories[0] || "Noticias",
            "item": `${siteConfig.url}/${catSlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": cleanHeadline,
            "item": shareUrl
          }
        ]
      }
    ]
  };

  return (
    <article className="bg-white min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker postId={post.id} />
      {/* 1. ARTICLE HEADER */}
      <div className="bg-zinc-50 border-b border-gray-100 mb-12">
        <div className="container mx-auto px-4 pt-6 pb-12 md:pt-10 md:pb-16 lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                <Link href="/">INICIO</Link>
                <span>/</span>
                <Link href={`/${catSlug}`} className="hover:text-brand-light transition-colors">{categories[0] || 'NOTICIAS'}</Link>
              </nav>

              {hasYouTube && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z" /><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white" /></svg>
                  VIDEO
                </span>
              )}
              {hasInstagram && (
                <span className="bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                  Instagram
                </span>
              )}
              {hasTwitter && (
                <span className="bg-black text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X / Twitter
                </span>
              )}
              {hasFacebook && (
                <span className="bg-[#1877F2] text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </span>
              )}
              {postTags.slice(0, 3).map((tag: any) => (
                <span key={tag.id} className="bg-brand-dark text-white px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest opacity-80 ring-1 ring-brand-light/20">
                  # {tag.name}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-brand-dark leading-[1.14] tracking-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#BF1B23] p-1.5 flex items-center justify-center shadow-sm overflow-hidden ring-1 ring-[#BF1B23]/20">
                  <Image
                    src="/logo.svg"
                    alt="Redacción Montecristi"
                    width={22}
                    height={22}
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-gray-900 font-bold">Redacción Montecristi</span>
              </div>
              <span className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-brand-dark" />
                <span>{new Date(post.date).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* BOTÓN OFICIAL: ESCUCHAR ESTA NOTICIA (TEXT-TO-SPEECH) */}
            <div className="pt-5">
              <ListenButton
                article={{
                  id: post.id,
                  title: post.title.rendered.replace(/<[^>]*>/g, ''),
                  author: "Redacción Montecristi",
                  date: new Date(post.date).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' }),
                  category: categories[0] || 'NOTICIAS',
                  slug: post.slug,
                  categorySlug: catSlug,
                  imageUrl: imageUrl,
                  content: post.content.rendered,
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-5 mt-6 lg:mt-0">
            <div className="relative aspect-[16/10] sm:aspect-[4/3] max-h-[320px] sm:max-h-none rounded-sm overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <ProtectedImage
                src={imageUrl}
                alt={post.title.rendered}
                title={post.title.rendered}
                fill
                className="w-full h-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Main Content Area */}
          <div className="lg:col-span-8">

            {/* Responsive Social Share */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-8 pb-4 border-b border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2 shrink-0">COMPARTIR:</span>
              <Link href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xs">
                <IconFacebook size={14} /> Facebook
              </Link>
              <Link href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xs">
                <IconTwitter size={14} /> Twitter/X
              </Link>
              <Link href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xs">
                <IconWhatsApp size={14} /> WhatsApp
              </Link>
              <Link href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xs">
                <Send size={13} /> Telegram
              </Link>
            </div>

            {/* Prose Content */}
            <div className="prose prose-zinc max-w-none text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: contentParts.part1 }} suppressHydrationWarning />
              
              {showFirstAd && (
                <div className="my-10 not-prose">
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center mb-2">Publicidad</div>
                  <CustomAd size="horizontal" position="articleInContent" />
                </div>
              )}

              {contentParts.part2 && (
                <div dangerouslySetInnerHTML={{ __html: contentParts.part2 }} suppressHydrationWarning />
              )}

              {showSecondAd && (
                <div className="my-10 not-prose">
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center mb-2">Publicidad</div>
                  <CustomAd size="horizontal" position="articleInContent" />
                </div>
              )}

              {contentParts.part3 && (
                <div dangerouslySetInnerHTML={{ __html: contentParts.part3 }} suppressHydrationWarning />
              )}
            </div>

            {/* ANUNCIO INFERIOR */}
            <div className="my-10 not-prose">
              <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center mb-2">Publicidad</div>
              <CustomAd size="horizontal" position="categoryAfterHero" />
            </div>

            {/* RELATED NEWS SECTION */}
            <section className="mt-20 pt-12 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-2 h-8 bg-brand-dark" />
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Noticias Relacionadas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {relatedPosts.map(p => (
                  <NewsCard key={p.id} post={p} variant="grid" />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 h-full relative">
            <div className="sticky top-[100px] flex flex-col gap-8 pb-12">
              <MostRead posts={trendingPosts.slice(0, 5)} />
              
              <div className="flex flex-col gap-6">
                <CustomAd size="rectangle" position="articleSidebarRect" />
                <CustomAd size="rectangle" position="articleSidebarVert" />
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* MOBILE FLOATING SHARE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] py-3 px-4 flex items-center justify-between gap-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Compartir:</span>
        <div className="flex items-center gap-3">
          <Link href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <IconFacebook />
          </Link>
          <Link href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <IconTwitter />
          </Link>
          <Link href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <IconWhatsApp />
          </Link>
          <Link href={`https://t.me/share/url?url=${shareUrl}`} target="_blank" className="w-10 h-10 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Send size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Custom SVGs for Social
const IconFacebook = ({ size = 18 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
const IconTwitter = ({ size = 18 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
const IconWhatsApp = ({ size = 18 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
