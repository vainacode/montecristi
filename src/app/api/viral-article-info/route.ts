/**
 * /api/viral-article-info — Extrae información de un artículo y genera sugerencias
 * de copys virales para Facebook y lista de imágenes disponibles.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getFeaturedImage, getCategoryNames, getCategorySlug, getPosts } from "@/lib/wp";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractSlug(input: string): string {
  let cleaned = input.trim();
  try {
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      const parsed = new URL(cleaned);
      const segments = parsed.pathname.split("/").filter(Boolean);
      return segments[segments.length - 1] || cleaned;
    }
  } catch {}
  const segments = cleaned.replace(/^\/+|\/+$/g, "").split("/");
  return segments[segments.length - 1] || cleaned;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

/**
 * Normaliza una URL de imagen para evitar duplicados por miniaturas (-1024x768, etc.)
 */
function normalizeImageUrl(url: string): string {
  try {
    const clean = url.split("?")[0].trim();
    // Quitar sufijos de redimensionado tipo -1200x800 o -1024x600 si existen
    return clean.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/i, "$1");
  } catch {
    return url;
  }
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url") || "";

  // Si no hay URL, devolver los últimos posts para selección rápida
  if (!urlParam) {
    try {
      const recentPosts = await getPosts({ per_page: 12 });
      const list = recentPosts.map((p) => {
        const catSlug = getCategorySlug(p) || "noticias";
        const postUrl = `${siteConfig.url}/${catSlug}/${p.slug}`;
        return {
          id: p.id,
          title: cleanHtml(p.title.rendered),
          slug: p.slug,
          category: getCategoryNames(p)[0] || "NOTICIAS",
          categorySlug: catSlug,
          imageUrl: getFeaturedImage(p),
          url: postUrl,
        };
      });
      return NextResponse.json({ recentPosts: list });
    } catch {
      return NextResponse.json({ recentPosts: [] });
    }
  }

  const slug = extractSlug(urlParam);
  if (!slug) {
    return NextResponse.json({ error: "No se pudo extraer el slug del artículo." }, { status: 400 });
  }

  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: `No se encontró el artículo con el slug: ${slug}` }, { status: 404 });
    }

    const cleanTitle = cleanHtml(post.title.rendered);
    const cleanExcerpt = cleanHtml(post.excerpt?.rendered || "");
    const rawContent = post.content?.rendered || "";
    const catNames = getCategoryNames(post);
    const catSlug = getCategorySlug(post);
    const category = catNames[0] || "NOTICIAS";
    const postUrl = `${siteConfig.url}/${catSlug}/${post.slug}`;

    // ── 1. EXTRACCIÓN ROBUSTA Y DEDUPLICACIÓN DE IMÁGENES ──
    const imageMap = new Map<string, string>(); // normalizedKey -> originalUrl

    // A) Imagen destacada
    const featuredImg = getFeaturedImage(post);
    if (featuredImg && !featuredImg.includes("logo") && !featuredImg.includes("avatar")) {
      imageMap.set(normalizeImageUrl(featuredImg), featuredImg);
    }

    // B) Buscar en atributos de etiquetas <img> (src, data-src, data-orig-file, data-large-file)
    const imgTagRegex = /<img\b([^>]+)>/gi;
    let matchTag;
    while ((matchTag = imgTagRegex.exec(rawContent)) !== null) {
      const tagAttrs = matchTag[1];
      const srcMatch = tagAttrs.match(/(?:src|data-src|data-orig-file|data-large-file)=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        const url = srcMatch[1].trim();
        const isAd = url.includes("/ads/") || url.includes("googleads") || url.includes("doubleclick") || url.includes("ad-banner") || url.includes("adnxs");
        if (
          !isAd &&
          !url.includes("logo") &&
          !url.includes("avatar") &&
          !url.includes("emoji") &&
          /\.(?:jpg|jpeg|png|webp|avif)(?:\?.*)?$/i.test(url)
        ) {
          imageMap.set(normalizeImageUrl(url), url);
        }
      }
    }

    // C) Extraer cualquier URL de imagen en el cuerpo (enlaces <a href="..."> o plugins)
    const rawUrlRegex = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^\s"'<>]*)?)/gi;
    let matchUrl;
    while ((matchUrl = rawUrlRegex.exec(rawContent)) !== null) {
      const url = matchUrl[1].trim();
      const isAd = url.includes("/ads/") || url.includes("googleads") || url.includes("doubleclick") || url.includes("ad-banner") || url.includes("adnxs");
      if (!isAd && !url.includes("logo") && !url.includes("avatar") && !url.includes("icon")) {
        imageMap.set(normalizeImageUrl(url), url);
      }
    }

    const contentImages = Array.from(imageMap.values());

    // ── 2. EXTRACCIÓN LIMPIA DE CITAS (SIN ETIQUETAS NI CLASES HTML) ──
    // Primero eliminamos TODAS las etiquetas HTML con sus atributos para evitar atrapar class="aligncenter..."
    const plainText = rawContent
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ");

    // Buscar citas reales entre comillas en el texto limpio
    const quoteRegex = /[“"«]([^”"»\n\r]{15,200})[”"»]/g;
    const rawQuotes: string[] = [];
    let qMatch;
    while ((qMatch = quoteRegex.exec(plainText)) !== null) {
      const candidate = qMatch[1]
        .replace(/&#8230;/g, "...")
        .replace(/&#8211;/g, "-")
        .replace(/&[a-z0-9#]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      const isBad =
        candidate.includes("wp-image") ||
        candidate.includes("aligncenter") ||
        candidate.includes("size-full") ||
        candidate.includes("http") ||
        candidate.includes("class=") ||
        candidate.includes("style=") ||
        candidate.includes("Gemini") ||
        candidate.split(" ").length < 3;

      if (!isBad && !rawQuotes.includes(candidate)) {
        rawQuotes.push(candidate);
      }
    }

    // Preferir citas con signos de exclamación o fuerza emocional
    const dramaticQuote = rawQuotes.find((q) => q.includes("¡") || q.includes("!")) || rawQuotes[0] || "";
    const topQuote = dramaticQuote;

    // ── 3. GENERAR 3 COPYS EN UN SOLO PÁRRAFO CONTINUO (CERO SALTOS DE LÍNEA) ──
    const rawSnippet = topQuote ? (topQuote.length > 65 ? topQuote.slice(0, 60) + "..." : topQuote) : "";
    const cleanQuoteSnippet = rawSnippet.replace(/^[¡!«"]+|[»"!?]+$/g, "").trim();

    // Opción 1: Gancho Rápido continuo (0 saltos de línea)
    const copy1 = (cleanQuoteSnippet
      ? `¡Dique “${cleanQuoteSnippet}”! 😱🔥 No se pudo aguantar y habló sobre todo lo que pasó; agárrate y escucha lo que dijo porque no se guardó nadita y dejó a todos con la boca abierta. Mira el video que está viral en el primer comentario. 👇`
      : `¡No se pudo aguantar y lo soltó todo! 😱🔥 ${cleanTitle}; lo que reveló en plena transmisión dejó a todo el mundo frío y no se guardó nada. Mira el video que está viral en el primer comentario. 👇`
    ).replace(/[\r\n]+/g, " ").trim();

    // Opción 2: Frase Bomba continuo (0 saltos de línea)
    const copy2 = `“¡BÚSCAME UNO QUE SE SALVE!” 💣👀 Rompió el silencio sobre esta situación y sus declaraciones tienen las redes que arden; no dejó títere con cabeza y le tiró a muchos. Mira lo que dijo en el primer comentario. 👇`.replace(/[\r\n]+/g, " ").trim();

    // Opción 3: Pregunta de Debate continuo (0 saltos de línea)
    const copy3 = `¿Se le fue la mano o tiene toda la razón? 🤐👇 Soltó una bomba que nadie se esperaba sobre este escándalo y las declaraciones se volvieron virales en minutos; tienes que ver lo que dijo. Déjanos tu opinión y mira el video en el primer comentario. 👇`.replace(/[\r\n]+/g, " ").trim();

    // ── 4. GENERACIÓN AUTOMÁTICA DE TITULARES DE ALTO IMPACTO PARA LA FOTO ──
    const headlines: { id: string; name: string; text: string }[] = [];

    // Titular 1: Basado en la cita más fuerte (si existe) o gancho de acción
    if (topQuote) {
      const cleanQuote = topQuote
        .replace(/^[¡!«"]+|[»"!?]+$/g, "")
        .replace(/&#8230;/g, "")
        .trim();
      let shortQuote = cleanQuote;
      if (cleanQuote.length > 36) {
        const truncated = cleanQuote.slice(0, 34);
        const lastSpace = truncated.lastIndexOf(" ");
        shortQuote = (lastSpace > 12 ? truncated.slice(0, lastSpace) : truncated).trim() + "...";
      }
      headlines.push({
        id: "quote",
        name: "⚡ Frase Bomba",
        text: `“¡${shortQuote.toUpperCase()}!”`,
      });
    }

    // Detectar protagonista o palabras clave en el título
    const lowerTitle = cleanTitle.toLowerCase();
    let nameTarget = "";
    if (lowerTitle.includes("casablanca")) nameTarget = "CASABLANCA";
    else if (lowerTitle.includes("yapoort")) nameTarget = "YAPOORT";
    else if (lowerTitle.includes("encarnacion") || lowerTitle.includes("encarnación")) nameTarget = "ENCARNACIÓN";
    else if (lowerTitle.includes("alofoke")) nameTarget = "ALOFOKE";

    // Titular 2: Declaración contundente
    if (nameTarget) {
      headlines.push({
        id: "target",
        name: "🔥 Confrontación",
        text: `¡${nameTarget} NO SE GUARDÓ NADA!`,
      });
    } else {
      headlines.push({
        id: "breaking",
        name: "🔥 Declaraciones",
        text: `¡ROMPIÓ EL SILENCIO Y HABLÓ CLARO!`,
      });
    }

    // Titular 3: Shock o Debate
    if (lowerTitle.includes("polemica") || lowerTitle.includes("polémica") || lowerTitle.includes("conflicto") || lowerTitle.includes("escandalo") || lowerTitle.includes("escándalo")) {
      headlines.push({
        id: "shock",
        name: "💣 Escándalo",
        text: `¡EXPLOTÓ TODO Y REVELÓ LA VERDAD!`,
      });
    } else if (cleanTitle.length <= 40) {
      headlines.push({
        id: "title",
        name: "💥 Directo",
        text: `¡${cleanTitle.toUpperCase()}!`,
      });
    } else {
      headlines.push({
        id: "shock",
        name: "💣 Impacto",
        text: `¡LO QUE DIJO DEJÓ A TODOS FRÍOS!`,
      });
    }

    if (headlines.length < 3) {
      headlines.push({
        id: "extra",
        name: "🚨 Exclusiva",
        text: `¡SE REVELÓ LO QUE NADIE ESPERABA!`,
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: cleanTitle,
        slug: post.slug,
        category,
        categorySlug: catSlug,
        url: postUrl,
        commentLink: postUrl,
        excerpt: cleanExcerpt,
        featuredImage: featuredImg,
        images: contentImages,
        topQuote,
      },
      suggestedHeadline: headlines[0]?.text || "",
      suggestedHeadlines: headlines,
      copies: [
        { id: "viral", name: "🔥 Intriga Corta (Primer Comentario)", text: copy1 },
        { id: "quote", name: "💣 Cita Bomba (Morbo Directo)", text: copy2 },
        { id: "debate", name: "🗣️ Pregunta de Debate (Comentarios)", text: copy3 },
      ],
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error al procesar el artículo." }, { status: 500 });
  }
}
