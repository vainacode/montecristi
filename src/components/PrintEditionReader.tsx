'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Printer, ChevronLeft, ChevronRight, Share2, Check, ZoomIn, ZoomOut, Newspaper, Eye } from 'lucide-react';
import type { WPPost } from '@/lib/wp-helpers';
import { getFeaturedImage, getCategoryNames, getCategorySlug, isLocalImage, toPlainText } from '@/lib/wp-helpers';
import { siteConfig } from '@/config/site';

interface PrintEditionProps {
  generalPosts?: WPPost[];
  montecristiPosts?: WPPost[];
  dateStr: string;
  editionNumber: number;
}

// ── Modelo de la edición ─────────────────────────────────────────────────────

interface Story {
  key: string;
  title: string;
  deck: string;
  category: string;
  image: string;
  url: string;
  paragraphs: string[];
  truncated: boolean;
}

interface Plana {
  num: number;
  section: string;
  color: string;
  stories: Story[];
  ad: string;
}

const MAX_PAGES = 8;
const SECTION_COLORS = ['#BF1B23', '#042564', '#8A1017', '#0f766e', '#7c3aed', '#b45309', '#16a34a'];
const SQUARE_ADS = ['/ads/300x250-03.jpg', '/ads/Bandera-300-x-250.jpg'];

// Presupuesto de palabras por tipo de nota: mantiene las planas parejas.
const WORDS_COVER_LEAD = 330;
const WORDS_COVER_BRIEF = 70;
const WORDS_LEAD = 300;
const WORDS_SECONDARY = 140;

const SOURCE_BRANDS = /(?:Diario al D[ií]a|Noticiario RD|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\s*[|\-–—]\s*/gi;

/** HTML de WordPress → párrafos limpios para imprimir (sin imágenes, embeds ni coletillas). */
function getPrintParagraphs(html: string): string[] {
  if (!html) return [];
  const clean = html
    .replace(/<(script|style|iframe|figure|figcaption|blockquote class="(?:instagram|twitter)[^"]*")\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/(?:<br\s*\/?>\s*)+/gi, '</p><p>');

  return clean
    .split(/<\/(?:p|div|h\d|li)>/i)
    .map((p) =>
      toPlainText(p)
        .replace(/\((?:sigue leyendo|leer m[aá]s|read more|ver m[aá]s|clic aqu[ií]|foto:[^)]+|P\.\s*\d+)\s*…?\)/gi, '')
        .replace(SOURCE_BRANDS, 'Redacción Montecristi — ')
        .trim(),
    )
    .filter((p) => p.length > 30 && !/^(?:Fuente|Foto|Tomado de|V[ií]a)\s*:/i.test(p));
}

/** Toma párrafos completos hasta llenar el presupuesto de palabras (mínimo uno). */
function takeWords(paragraphs: string[], maxWords: number): { paragraphs: string[]; truncated: boolean } {
  const out: string[] = [];
  let words = 0;
  for (const p of paragraphs) {
    const count = p.split(/\s+/).length;
    if (out.length > 0 && words + count > maxWords) return { paragraphs: out, truncated: true };
    out.push(p);
    words += count;
  }
  return { paragraphs: out, truncated: false };
}

function toStory(post: WPPost, maxWords: number): Story {
  const all = getPrintParagraphs(post.content?.rendered || post.excerpt?.rendered || '');
  const { paragraphs, truncated } = takeWords(all, maxWords);
  const deck = toPlainText(post.excerpt?.rendered).replace(/\s*\[…\]|\s*\[\.\.\.\]/g, '…');
  return {
    key: `${post.id}-${post.slug}`,
    title: toPlainText(post.title.rendered),
    deck: deck.length > 220 ? `${deck.slice(0, 217).trimEnd()}…` : deck,
    category: getCategoryNames(post)[0] || 'Actualidad',
    image: getFeaturedImage(post),
    url: `${siteConfig.url.replace(/^https?:\/\//, '')}/${getCategorySlug(post)}/${post.slug}`,
    paragraphs,
    truncated,
  };
}

/**
 * Arma las planas sin repetir noticias:
 * 1. Portada con las 4 principales.
 * 2. Montecristi con las noticias locales.
 * 3. Una plana por cada categoría con 3+ notas; el resto en planas de Actualidad.
 * Si no hay suficientes noticias, la edición tiene menos planas (nunca repite).
 */
function buildEdition(general: WPPost[], local: WPPost[]): { cover: Story[]; planas: Plana[] } {
  const used = new Set<string>();
  const take = (posts: WPPost[], n: number) => {
    const picked: WPPost[] = [];
    for (const p of posts) {
      if (picked.length >= n) break;
      if (used.has(p.slug)) continue;
      used.add(p.slug);
      picked.push(p);
    }
    return picked;
  };

  const coverPosts = take(general, 4);
  const cover = coverPosts.map((p, i) => toStory(p, i === 0 ? WORDS_COVER_LEAD : WORDS_COVER_BRIEF));

  const groups: { section: string; posts: WPPost[] }[] = [];
  const localPosts = take(local, 5);
  if (localPosts.length >= 2) groups.push({ section: 'Montecristi & la Línea Noroeste', posts: localPosts });

  const remaining = general.filter((p) => !used.has(p.slug));
  const byCategory = new Map<string, WPPost[]>();
  for (const p of remaining) {
    const cat = getCategoryNames(p)[0] || 'Actualidad';
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), p]);
  }
  for (const [cat, posts] of byCategory) {
    if (posts.length >= 3) groups.push({ section: cat, posts: take(posts, 5) });
  }
  const leftovers = remaining.filter((p) => !used.has(p.slug));
  for (let i = 0; i + 3 <= leftovers.length; i += 5) {
    groups.push({ section: 'Actualidad', posts: take(leftovers.slice(i, i + 5), 5) });
  }

  const planas = groups.slice(0, MAX_PAGES - 1).map((g, i) => ({
    num: i + 2,
    section: g.section.toUpperCase(),
    color: SECTION_COLORS[i % SECTION_COLORS.length],
    stories: g.posts.map((p, j) => toStory(p, j === 0 ? WORDS_LEAD : WORDS_SECONDARY)),
    ad: SQUARE_ADS[i % SQUARE_ADS.length],
  }));

  return { cover, planas };
}

// ── Piezas de maquetación ────────────────────────────────────────────────────

function StoryImage({ src, alt, ratio = 'aspect-[4/3]', priority = false }: { src: string; alt: string; ratio?: string; priority?: boolean }) {
  const finalSrc = src || siteConfig.seo.defaultImage;
  return (
    <div className={`relative ${ratio} w-full overflow-hidden border border-gray-300 bg-gray-100`}>
      <Image
        src={finalSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={!isLocalImage(finalSrc)}
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
      />
    </div>
  );
}

function Paragraphs({ story, dropCapColor }: { story: Story; dropCapColor?: string }) {
  return (
    <>
      {story.paragraphs.map((para, idx) => (
        <p key={idx} className="mb-2.5">
          {idx === 0 && dropCapColor ? (
            <>
              {/* Letra capital de periódico */}
              <span className="float-left mr-2 mt-0.5 font-serif text-[3.2em] font-black leading-[0.82]" style={{ color: dropCapColor }}>
                {para.charAt(0)}
              </span>
              {para.slice(1)}
            </>
          ) : (
            para
          )}
        </p>
      ))}
      {story.truncated && (
        <p className="mb-3 break-words text-left font-sans text-[10px] font-bold uppercase tracking-wide text-gray-500 [text-align-last:left]">
          Continúa en {story.url}
        </p>
      )}
    </>
  );
}

function PageFooter({ left, right, color }: { left: string; right: string; color: string }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-black pt-2 text-[9px] font-bold uppercase tracking-wider text-gray-600">
      <span>{left}</span>
      <span className="hidden sm:inline">San Fernando de Montecristi · República Dominicana</span>
      <span className="font-black" style={{ color }}>{right}</span>
    </div>
  );
}

function BottomBanner() {
  return (
    <div className="mt-4 border-t-2 border-black pt-3">
      <Image src="/ads/Bandera-970-X-90.jpg" alt="Publicidad" width={970} height={90} className="block h-auto w-full" />
    </div>
  );
}

const PAGE_CLASS =
  'w-full max-w-[980px] bg-white p-5 sm:p-8 text-[#111111] shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-gray-300 print:max-w-none print:border-none print:p-0 print:shadow-none';

// Columnas balanceadas: el navegador reparte el texto para que todas terminen a la misma altura.
// Al imprimir, el ancho de "pantalla" es el de la hoja (979 px < lg), así que forzamos las 3 columnas.
const FLOW_CLASS = 'columns-1 sm:columns-2 lg:columns-3 print:columns-3 gap-6 [column-fill:balance] [column-rule:1px_solid_#e5e7eb]';

// ── Componente ───────────────────────────────────────────────────────────────

export function PrintEditionReader({ generalPosts = [], montecristiPosts = [], dateStr, editionNumber }: PrintEditionProps) {
  const { cover, planas } = useMemo(() => buildEdition(generalPosts, montecristiPosts), [generalPosts, montecristiPosts]);
  const totalPages = 1 + planas.length;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewAllPages, setViewAllPages] = useState<boolean>(false);

  const isVisible = (num: number) => viewAllPages || currentPage === num;
  // `zoom` sí cambia el espacio que ocupa la plana (transform: scale dejaba huecos).
  const pageStyle: React.CSSProperties = { zoom: zoomLevel / 100 };

  // Al imprimir, cada plana debe caber en UNA hoja tabloide (11×17"). Medimos cada plana
  // al ancho de la hoja y la escalamos lo justo (nunca la agrandamos).
  useEffect(() => {
    const PRINT_WIDTH = 979; // 10.2" útiles a 96 ppp
    const PRINT_HEIGHT = 1530; // 16.2" útiles, con margen de seguridad
    const fit = () => {
      document.querySelectorAll<HTMLElement>('.print-plana').forEach((el) => {
        const wasHidden = el.classList.contains('hidden');
        const prev = { width: el.style.width, maxWidth: el.style.maxWidth, zoom: el.style.zoom, padding: el.style.padding, border: el.style.border };
        el.classList.remove('hidden');
        // Igual que en la hoja: sin el relleno ni el borde de pantalla.
        Object.assign(el.style, { width: `${PRINT_WIDTH}px`, maxWidth: 'none', zoom: '1', padding: '0', border: '0' });
        const scale = Math.min(1, PRINT_HEIGHT / el.offsetHeight);
        Object.assign(el.style, prev);
        if (wasHidden) el.classList.add('hidden');
        el.style.setProperty('--print-zoom', scale.toFixed(3));
      });
    };
    window.addEventListener('beforeprint', fit);
    return () => window.removeEventListener('beforeprint', fit);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pageNames = ['Portada', ...planas.map((p) => p.section.charAt(0) + p.section.slice(1).toLowerCase())];
  const [lead, ...briefs] = cover;

  return (
    <div className="min-h-screen bg-[#090d16] px-2 py-6 font-sans text-[#111111] selection:bg-[#BF1B23] selection:text-white sm:px-4 sm:py-10 print:bg-white print:p-0">
      {/* ── BARRA DE CONTROL (NO SE IMPRIME) ── */}
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#18181b] p-3.5 text-white shadow-2xl sm:p-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BF1B23] text-white shadow-md">
            <Newspaper size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#BF1B23]">
              Edición impresa · {totalPages} {totalPages === 1 ? 'página' : 'páginas'}
            </span>
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">Periódico Montecristi.net</h1>
          </div>
        </div>

        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/10 p-1.5 text-xs font-bold">
          <button
            onClick={() => { setViewAllPages(false); setCurrentPage((p) => Math.max(1, p - 1)); }}
            disabled={currentPage === 1 && !viewAllPages}
            aria-label="Página anterior"
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-white transition-all hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          {pageNames.map((name, i) => (
            <button
              key={name + i}
              onClick={() => { setViewAllPages(false); setCurrentPage(i + 1); }}
              className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                currentPage === i + 1 && !viewAllPages ? 'bg-[#BF1B23] font-black text-white shadow-sm' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {i + 1}. {name}
            </button>
          ))}
          <button
            onClick={() => setViewAllPages((v) => !v)}
            className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-1 transition-all ${
              viewAllPages ? 'bg-amber-600 font-black text-white shadow-sm' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Eye size={13} />
            {viewAllPages ? 'Una plana' : 'Ver todas'}
          </button>
          <button
            onClick={() => { setViewAllPages(false); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
            disabled={currentPage === totalPages && !viewAllPages}
            aria-label="Página siguiente"
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-white transition-all hover:bg-white/15 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl bg-white/10 p-1 xl:flex">
            <button onClick={() => setZoomLevel((z) => Math.max(70, z - 10))} aria-label="Reducir zoom" className="cursor-pointer rounded-lg p-1.5 text-gray-300 transition-all hover:bg-white/15 hover:text-white">
              <ZoomOut size={16} />
            </button>
            <span className="px-1 font-mono text-[11px] text-gray-300">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(130, z + 10))} aria-label="Aumentar zoom" className="cursor-pointer rounded-lg p-1.5 text-gray-300 transition-all hover:bg-white/15 hover:text-white">
              <ZoomIn size={16} />
            </button>
          </div>
          <button onClick={handleShare} aria-label="Compartir edición" className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 p-2.5 text-xs font-bold text-white transition-all hover:bg-white/20">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Compartir'}</span>
          </button>
          <button
            onClick={() => window.print()}
            aria-label="Imprimir la edición completa o guardar en PDF"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#BF1B23] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#8A1017] active:scale-95"
          >
            <Printer size={16} />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </header>

      <div className="flex select-text flex-col items-center gap-10 pb-16 print:block print:gap-0 print:pb-0">
        {/* ═══════════════════ PÁGINA 1 · PORTADA ═══════════════════ */}
        {lead && (
          <article
            style={pageStyle}
            className={`${PAGE_CLASS} print-plana ${isVisible(1) ? '' : 'hidden print:block'}`}
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-1 text-[10px] font-black uppercase tracking-tight text-gray-900 sm:text-[11px]">
              <span>{dateStr} · No. {editionNumber}</span>
              <span className="hidden md:inline">Montecristi · República Dominicana</span>
              <span>montecristi.net</span>
            </div>

            {/* Cabecera */}
            <div className="border-b-4 border-double border-black py-3 text-center">
              <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                <Image src="/logo.svg" alt="" width={56} height={56} className="h-[clamp(28px,8vw,56px)] w-[clamp(28px,8vw,56px)] shrink-0 object-contain" />
                <h2 className="min-w-0 font-[family-name:var(--font-source-sans)] text-[clamp(26px,8.5vw,68px)] font-black uppercase leading-none tracking-tighter text-[#042564]">
                  Montecristi<span className="text-[#BF1B23]">.net</span>
                </h2>
              </div>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.35em] text-gray-600 sm:text-[11px]">
                El diario de San Fernando de Montecristi y la Línea Noroeste
              </p>
            </div>

            {/* Gran noticia */}
            <section className="border-b-2 border-black py-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23]">{lead.category}</span>
              <h3 className="mt-1 font-serif text-[30px] font-black leading-[1.05] tracking-tight text-gray-950 sm:text-[46px]">
                {lead.title}
              </h3>
              {lead.deck && <p className="mt-2 font-serif text-[15px] italic leading-snug text-gray-700 sm:text-[17px]">{lead.deck}</p>}
              <p className="mt-2 border-y border-gray-200 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                Por <span className="text-[#BF1B23]">Redacción Montecristi</span>
              </p>

              {/* Foto a todo el ancho y texto en columnas balanceadas: terminan parejas */}
              <figure className="mt-3">
                <StoryImage src={lead.image} alt={lead.title} ratio="aspect-[16/9] sm:aspect-[21/9]" priority />
              </figure>
              <div className={`mt-3 text-justify font-serif text-[12.5px] leading-[1.6] text-gray-900 [hyphens:auto] ${FLOW_CLASS}`} lang="es">
                <Paragraphs story={lead} dropCapColor="#BF1B23" />
              </div>
            </section>

            {/* Breves de portada: misma extensión → tarjetas parejas */}
            {briefs.length > 0 && (
              <section className="grid gap-5 py-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-gray-200 print:grid-cols-3 print:gap-0">
                {briefs.map((story) => (
                  <div key={story.key} className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
                    <StoryImage src={story.image} alt={story.title} ratio="aspect-[16/10]" />
                    <span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-[#042564]">{story.category}</span>
                    <h4 className="mt-0.5 font-serif text-[16px] font-black leading-tight text-gray-950">{story.title}</h4>
                    <div className="mt-1.5 text-justify font-serif text-[11.5px] leading-relaxed text-gray-800 [hyphens:auto]" lang="es">
                      <Paragraphs story={story} />
                    </div>
                  </div>
                ))}
              </section>
            )}

            <BottomBanner />
            <PageFooter left={`Edición No. ${editionNumber}`} right="Página 1 · Portada" color="#BF1B23" />
          </article>
        )}

        {/* ═══════════════════ PLANAS INTERIORES ═══════════════════ */}
        {planas.map((plana) => {
          const [main, ...rest] = plana.stories;
          return (
            <article
              key={plana.num}
              style={pageStyle}
              className={`${PAGE_CLASS} print-plana ${isVisible(plana.num) ? '' : 'hidden print:block'}`}
            >
              <div className="flex items-center justify-between border-b-2 pb-1.5 text-[10px] font-black uppercase tracking-wider sm:text-[11px]" style={{ borderColor: plana.color }}>
                <span style={{ color: plana.color }}>Página {plana.num}</span>
                <span className="hidden md:inline">Montecristi.net · Edición impresa</span>
                <span>{dateStr}</span>
              </div>

              <div className="mt-2 px-4 py-2 text-white" style={{ backgroundColor: plana.color }}>
                <span className="text-sm font-black uppercase tracking-widest">{plana.section}</span>
              </div>

              {/* Noticia principal: foto dentro del flujo de columnas, sin huecos */}
              <section className="border-b-2 border-black py-4">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: plana.color }}>{main.category}</span>
                <h3 className="mt-1 font-serif text-[26px] font-black leading-[1.08] text-gray-950 sm:text-[38px]">{main.title}</h3>
                {main.deck && <p className="mt-2 font-serif text-[14px] italic leading-snug text-gray-700 sm:text-[16px]">{main.deck}</p>}
                <figure className="mt-3">
                  <StoryImage src={main.image} alt={main.title} ratio="aspect-[16/9] sm:aspect-[21/9]" />
                </figure>
                <div className={`mt-3 text-justify font-serif text-[12.5px] leading-[1.6] text-gray-900 [hyphens:auto] ${FLOW_CLASS}`} lang="es">
                  <Paragraphs story={main} dropCapColor={plana.color} />
                </div>
              </section>

              {/* Resto de notas y anuncio en un único flujo balanceado */}
              {rest.length > 0 && (
                <section className={`py-4 text-justify font-serif text-[11.5px] leading-relaxed text-gray-800 [hyphens:auto] ${FLOW_CLASS}`} lang="es">
                  {rest.map((story, i) => (
                    <React.Fragment key={story.key}>
                      <div className="mb-4 border-b border-gray-200 pb-3">
                        <span className="block break-after-avoid font-sans text-[9px] font-black uppercase tracking-wider" style={{ color: plana.color }}>
                          {story.category}
                        </span>
                        <h4 className="mb-1.5 break-after-avoid text-left font-serif text-[17px] font-black leading-tight text-gray-950">{story.title}</h4>
                        {i === 0 && (
                          <figure className="mb-2 break-inside-avoid">
                            <StoryImage src={story.image} alt={story.title} ratio="aspect-[16/10]" />
                          </figure>
                        )}
                        <Paragraphs story={story} />
                      </div>
                      {i === 1 && (
                        <aside className="mb-4 break-inside-avoid">
                          <span className="mb-1 block text-center font-mono text-[8px] uppercase tracking-widest text-gray-400">Espacio publicitario</span>
                          <Image src={plana.ad} alt="Publicidad" width={300} height={250} className="mx-auto block h-auto w-full max-w-[300px] border border-gray-300" />
                        </aside>
                      )}
                    </React.Fragment>
                  ))}
                </section>
              )}

              <BottomBanner />
              <PageFooter left={`Edición No. ${editionNumber}`} right={`Página ${plana.num} · ${plana.section}`} color={plana.color} />
            </article>
          );
        })}

        {!lead && (
          <p className="rounded-xl bg-white/10 px-6 py-10 text-center text-sm font-bold text-white print:hidden">
            La edición de hoy se está preparando. Vuelve en unos minutos.
          </p>
        )}
      </div>
    </div>
  );
}
