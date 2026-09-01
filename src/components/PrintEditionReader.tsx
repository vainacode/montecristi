'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ZoomIn,
  ZoomOut,
  Newspaper,
  Eye,
  FileText
} from 'lucide-react';
import type { WPPost } from '@/lib/wp';
import { getFeaturedImage, getCategoryNames } from '@/lib/wp';
import { siteConfig } from '@/config/site';

interface PrintEditionProps {
  posts: WPPost[];
  dateStr: string;
  editionNumber: number;
}

/**
 * Limpia y purifica el texto para versión 100% IMPRESA:
 * - Elimina enlaces (<a ...>), manteniendo únicamente el texto plano.
 * - Elimina coletillas web ("sigue leyendo", "haz clic", "read more", etc.).
 * - Divide en párrafos sólidos sin saltos muertos.
 */
function getPrintParagraphs(htmlStr: string): string[] {
  if (!htmlStr) return [];
  const clean = htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/\((?:sigue leyendo|leer m[aá]s|read more|ver m[aá]s|clic aqu[ií]|foto:[^)]+)\s*…?\)/gi, '')
    .replace(/(?:<br\s*\/?>\s*)+/gi, '</p><p>');

  const raw = clean
    .split(/<\/(?:p|div|h\d)>/i)
    .map(p =>
      p
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim()
    )
    .filter(p => p.length > 25);

  if (raw.length > 0) return raw;

  const plain = htmlStr.replace(/<[^>]+>/g, '').trim();
  return plain ? [plain] : [];
}

function cleanPrintExcerpt(htmlStr: string, maxLen = 220): string {
  if (!htmlStr) return '';
  const plain = htmlStr
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\((?:sigue leyendo|leer m[aá]s|read more|ver m[aá]s|clic aqu[ií]|foto:[^)]+)\s*…?\)/gi, '')
    .trim();

  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen) + '...';
}

function splitHeadlineWords(headline: string) {
  const clean = headline.replace(/<[^>]+>/g, '').trim();
  const words = clean.split(' ');
  if (words.length <= 2) {
    return { firstPart: words[0] || '', secondPart: words.slice(1).join(' ') };
  }
  const mid = Math.min(2, Math.ceil(words.length / 3));
  return {
    firstPart: words.slice(0, mid).join(' '),
    secondPart: words.slice(mid).join(' ')
  };
}

export function PrintEditionReader({ posts, dateStr, editionNumber }: PrintEditionProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewAllPages, setViewAllPages] = useState<boolean>(false);

  // 8 Páginas completas (cuadernillo tradicional estándar de imprenta)
  const totalPages = 8;

  // ── REPARTO EDITORIAL PARA 8 PÁGINAS COMPLETAS ────────────────────────────
  // PÁG 1: PORTADA
  const topTeaserPost = posts[0] || null;
  const leadHeadlinePost = posts[1] || null;
  const mainPhotoPost = posts[2] || posts[0] || null;
  const sidebarPosts = [posts[3], posts[4], posts[5]].filter(Boolean) as WPPost[];
  const coverBreves = [posts[6], posts[7]].filter(Boolean) as WPPost[];

  // PÁG 2: MONTECRISTI Y LÍNEA NOROESTE
  const p2Lead = posts[8] || posts[1] || null;
  const p2Second = posts[9] || posts[3] || null;
  const p2Third = posts[10] || posts[5] || null;

  // PÁG 3: NACIONALES & POLÍTICA
  const p3Lead = posts[11] || posts[2] || null;
  const p3Second = posts[12] || posts[4] || null;
  const p3Third = posts[13] || posts[6] || null;

  // PÁG 4: ECONOMÍA, NEGOCIOS & PUERTO DE MANZANILLO
  const p4Lead = posts[14] || posts[7] || null;
  const p4Second = posts[15] || posts[8] || null;
  const p4Third = posts[16] || posts[9] || null;

  // PÁG 5: OPINIÓN, EDITORIAL & TRIBUNA
  const p5Lead = posts[17] || posts[10] || null;
  const p5Second = posts[18] || posts[11] || null;
  const p5Third = posts[19] || posts[12] || null;

  // PÁG 6: COMUNIDAD, MEDIO AMBIENTE & SOCIEDAD
  const p6Lead = posts[20] || posts[13] || null;
  const p6Second = posts[21] || posts[14] || null;
  const p6Third = posts[22] || posts[15] || null;

  // PÁG 7: CULTURA, HISTORIA & ESTILO
  const p7Lead = posts[23] || posts[16] || null;
  const p7Second = posts[24] || posts[17] || null;
  const p7Third = posts[25] || posts[18] || null;

  // PÁG 8: DEPORTES & CONTRAPORTADA
  const p8Lead = posts[26] || posts[19] || null;
  const p8Second = posts[27] || posts[20] || null;
  const p8Third = posts[28] || posts[21] || null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const photoSplit = mainPhotoPost ? splitHeadlineWords(mainPhotoPost.title.rendered) : { firstPart: '', secondPart: '' };

  const pageNames = [
    'Pág. 1 Portada',
    'Pág. 2 Noroeste',
    'Pág. 3 Nacional',
    'Pág. 4 Economía',
    'Pág. 5 Opinión',
    'Pág. 6 Sociedad',
    'Pág. 7 Cultura',
    'Pág. 8 Deportes'
  ];

  return (
    <div className="bg-[#090d16] text-[#111111] min-h-screen py-6 sm:py-10 px-2 sm:px-4 font-sans selection:bg-[#BF1B23] selection:text-white">

      {/* ── BARRA DE CONTROL DEL KIOSKO (NO SE IMPRIME) ────────────────── */}
      <header className="max-w-6xl mx-auto mb-6 bg-[#18181b] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 print:hidden border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BF1B23] flex items-center justify-center text-white shadow-md">
            <Newspaper size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23] block">
              EDICIÓN IMPRESA COMPLETA · 8 PÁGINAS
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Periódico Montecristi.net
            </h1>
          </div>
        </div>

        {/* Selector de Páginas de 1 a 8 */}
        <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/10 text-xs font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => { setViewAllPages(false); setCurrentPage(p => Math.max(1, p - 1)); }}
            disabled={currentPage === 1 && !viewAllPages}
            aria-label="Página anterior"
            className="p-1.5 rounded-lg hover:bg-white/15 disabled:opacity-30 transition-all cursor-pointer text-white shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNames.map((name, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => { setViewAllPages(false); setCurrentPage(pageNum); }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 text-[11px] ${
                  currentPage === pageNum && !viewAllPages
                    ? 'bg-[#BF1B23] text-white font-black shadow-sm'
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                {name}
              </button>
            );
          })}

          <button
            onClick={() => setViewAllPages(v => !v)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              viewAllPages ? 'bg-amber-600 text-white font-black shadow-sm' : 'hover:bg-white/10 text-gray-300'
            }`}
            title="Ver todas las 8 planas continuas"
          >
            <Eye size={13} />
            {viewAllPages ? '1 Plana' : 'Ver 8 Planas'}
          </button>

          <button
            onClick={() => { setViewAllPages(false); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
            disabled={currentPage === totalPages && !viewAllPages}
            aria-label="Página siguiente"
            className="p-1.5 rounded-lg hover:bg-white/15 disabled:opacity-30 transition-all cursor-pointer text-white shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setZoomLevel(z => Math.max(75, z - 10))}
              aria-label="Reducir zoom"
              className="p-1.5 hover:bg-white/15 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-mono px-1 text-gray-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(125, z + 10))}
              aria-label="Aumentar zoom"
              className="p-1.5 hover:bg-white/15 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <button
            onClick={handleShare}
            aria-label="Compartir edición"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          <button
            onClick={handlePrint}
            aria-label="Imprimir periódico completo de 8 páginas o guardar en PDF"
            className="flex items-center gap-2 bg-[#BF1B23] hover:bg-[#8A1017] active:scale-95 text-white px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
          >
            <Printer size={16} />
            <span>Imprimir 8 Páginas / PDF</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEDOR DE LAS 8 PLANAS IMPRESAS ───────────────────────────── */}
      <div className="flex flex-col items-center gap-10 overflow-x-auto pb-16 select-text">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PÁGINA 1: PORTADA PRINCIPAL                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(viewAllPages || currentPage === 1) && (
          <article
            style={{ transform: viewAllPages ? 'none' : `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="bg-[#ffffff] text-[#111111] w-full max-w-[960px] min-h-[1380px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-gray-300 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:transform-none print:min-h-screen print:break-after-page print:page-break-after-always"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-black text-gray-900 uppercase tracking-tight border-b-2 border-black pb-1">
                <span>{dateStr.toUpperCase()} | No. {editionNumber}</span>
                <span>SANTO DOMINGO / MONTECRISTI, RD | EDICIÓN IMPRESA DE 8 PÁGINAS</span>
                <span>WWW.MONTECRISTI.NET</span>
              </div>

              {/* Cabecera Masthead */}
              <div className="grid grid-cols-12 gap-3 border-b-2 border-black pb-2.5 items-stretch">
                <div className="col-span-12 sm:col-span-8 bg-[#BF1B23] text-white p-3 sm:p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-sm shrink-0">
                      <Image src="/logo.svg" alt="Montecristi.net" width={42} height={42} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                    </div>
                    <div>
                      <h2 className="font-[family-name:var(--font-source-sans)] font-black text-3xl sm:text-4xl lg:text-[44px] uppercase tracking-tighter leading-none">
                        MONTECRISTI<span className="text-white/90">.NET</span>
                      </h2>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-white/90 block mt-0.5">
                        El Periódico de Montecristi y la Línea Noroeste
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-4 bg-white border border-gray-300 p-2 flex items-center gap-2.5 overflow-hidden">
                  {topTeaserPost && (
                    <>
                      <div className="relative w-20 h-16 shrink-0 bg-gray-100 border border-gray-200 overflow-hidden">
                        <Image src={getFeaturedImage(topTeaserPost) || siteConfig.seo.defaultImage} alt="Teaser" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between h-full min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#BF1B23] block truncate">
                          {getCategoryNames(topTeaserPost)[0] || 'PRIMICIA'}
                        </span>
                        <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-900 leading-tight line-clamp-2">
                          {cleanPrintExcerpt(topTeaserPost.title.rendered, 70)}
                        </h4>
                        <span className="text-[9px] font-black text-[#BF1B23] uppercase block mt-0.5">P. 7</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cuerpo de Portada */}
              <div className="grid grid-cols-12 gap-5 pt-1">
                <div className="col-span-12 lg:col-span-8 space-y-3.5 pr-0 lg:pr-3 lg:border-r lg:border-gray-200">
                  {leadHeadlinePost && (
                    <div className="space-y-1.5 border-b border-gray-200 pb-2.5">
                      <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-serif text-[#BF1B23] leading-[1.08] tracking-tight">
                        {leadHeadlinePost.title.rendered.replace(/<[^>]+>/g, '')}
                      </h2>
                      <p className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug">
                        {cleanPrintExcerpt(leadHeadlinePost.excerpt?.rendered || leadHeadlinePost.content?.rendered || '', 200)}{' '}
                        <span className="text-[#BF1B23] font-black">P. 3</span>
                      </p>
                    </div>
                  )}

                  {mainPhotoPost && (
                    <div className="space-y-2.5">
                      <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-black font-serif leading-[1.12] tracking-tight">
                        <span className="text-[#BF1B23]">{photoSplit.firstPart} </span>
                        <span className="text-[#27272a]">{photoSplit.secondPart}</span>
                      </h3>
                      <div className="relative aspect-[16/10] w-full bg-gray-100 border border-gray-300 overflow-hidden shadow-xs">
                        <Image src={getFeaturedImage(mainPhotoPost) || siteConfig.seo.defaultImage} alt="Foto Portada" fill priority className="object-cover" />
                      </div>
                      <p className="text-[11px] text-gray-700 leading-snug font-serif italic">
                        {cleanPrintExcerpt(mainPhotoPost.excerpt?.rendered || mainPhotoPost.content?.rendered || '', 160)}{' '}
                        <span className="text-[#BF1B23] font-black not-italic font-sans">P. 2</span>
                      </p>
                      <div className="columns-1 sm:columns-2 gap-5 text-justify font-serif text-[12.5px] text-gray-900 leading-[1.65] pt-2 border-t border-gray-200">
                        {getPrintParagraphs(mainPhotoPost.content?.rendered || mainPhotoPost.excerpt?.rendered || '').map((para, idx) => (
                          <p key={idx} className={`mb-3 ${idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:font-serif first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:text-[#BF1B23]' : ''}`}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {coverBreves.length > 0 && (
                    <div className="border-t-2 border-black pt-2.5 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-2.5 border border-gray-200">
                      {coverBreves.map((breve, bIdx) => (
                        <div key={breve.id} className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#BF1B23]">
                            BREVE · {getCategoryNames(breve)[0] || 'ACTUALIDAD'}
                          </span>
                          <h5 className="text-[11px] font-bold text-gray-900 leading-tight">
                            {breve.title.rendered.replace(/<[^>]+>/g, '')}
                          </h5>
                          <p className="text-[10px] text-gray-700 font-serif leading-snug">
                            {cleanPrintExcerpt(breve.excerpt?.rendered || breve.content?.rendered || '', 110)}{' '}
                            <span className="text-[#BF1B23] font-black">P. {4 + bIdx}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="bg-[#BF1B23] text-white text-center py-1 px-2 text-[11px] font-black uppercase tracking-widest mb-3">
                      NACIONALES
                    </div>
                    <div className="space-y-3.5">
                      {sidebarPosts.map((post, idx) => (
                        <div key={post.id} className={`${idx !== sidebarPosts.length - 1 ? 'border-b border-gray-200 pb-3' : ''} space-y-1.5`}>
                          <h4 className="text-[12.5px] sm:text-[13px] font-black text-gray-900 leading-tight">
                            {post.title.rendered.replace(/<[^>]+>/g, '')}
                          </h4>
                          <div className="relative aspect-video w-full bg-gray-100 border border-gray-200 overflow-hidden">
                            <Image src={getFeaturedImage(post) || siteConfig.seo.defaultImage} alt="Noticia Lateral" fill className="object-cover" />
                          </div>
                          <p className="text-[11px] text-gray-700 leading-snug font-serif text-justify">
                            {cleanPrintExcerpt(post.excerpt?.rendered || post.content?.rendered || '', 130)}{' '}
                            <span className="text-[#BF1B23] font-black font-sans">P. {3 + idx}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-300 pt-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">ESPACIO PUBLICITARIO</span>
                    <div className="relative aspect-[300/250] w-full border border-gray-300 overflow-hidden shadow-xs">
                      <Image src="/ads/Bandera-300-x-250.jpg" alt="Publicidad Lateral" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Inferior */}
              <div className="mt-3 pt-2 border-t-2 border-black">
                <div className="relative w-full overflow-hidden border border-gray-300 shadow-xs">
                  <Image src="/ads/Bandera-970-X-90.jpg" alt="Publicidad Portada" width={970} height={90} style={{ width: '100%', height: 'auto' }} className="w-full h-auto block" />
                </div>
              </div>
            </div>

            <div className="border-t border-black pt-2 mt-2 flex items-center justify-between text-[9px] text-gray-600 font-bold uppercase tracking-wider">
              <span>ISSN 2972-8819 · EDICIÓN DIARIA IMPRESA</span>
              <span>SAN FERNANDO DE MONTECRISTI</span>
              <span className="text-[#BF1B23] font-black">PÁGINA 1 · PORTADA</span>
            </div>
          </article>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PÁGINAS INTERIORES 2 A 8 (MAQUETACIÓN DENSA Y COMPLETA)             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {[
          { pageNum: 2, section: 'MONTECRISTI & LA LÍNEA NOROESTE', sub: 'SAN FERNANDO · VILLA VÁSQUEZ · GUAYUBÍN · MANZANILLO', color: '#BF1B23', lead: p2Lead, second: p2Second, third: p2Third, adSquare: '/ads/300x250-03.jpg' },
          { pageNum: 3, section: 'PANORAMA NACIONAL & POLÍTICA', sub: 'GOBIERNO · CONGRESO · JUSTICIA · PROVINCIAS', color: '#042564', lead: p3Lead, second: p3Second, third: p3Third, adSquare: '/ads/Bandera-300-x-250.jpg' },
          { pageNum: 4, section: 'ECONOMÍA, NEGOCIOS & PUERTO DE MANZANILLO', sub: 'FINANZAS · ZONAS FRANCAS · COMERCIO EXTERIOR · TURISMO', color: '#c95805', lead: p4Lead, second: p4Second, third: p4Third, adSquare: '/ads/300x250-03.jpg' },
          { pageNum: 5, section: 'OPINIÓN, EDITORIAL & TRIBUNA', sub: 'EDITORIAL OFICIAL · COLUMNAS · FIRMAS INVITADAS · CARTAS', color: '#8A1017', lead: p5Lead, second: p5Second, third: p5Third, adSquare: '/ads/Bandera-300-x-250.jpg' },
          { pageNum: 6, section: 'COMUNIDAD, MEDIO AMBIENTE & SOCIEDAD', sub: 'PARQUES NACIONALES · SALUD · EDUCACIÓN · MORRO DE MONTECRISTI', color: '#0f766e', lead: p6Lead, second: p6Second, third: p6Third, adSquare: '/ads/300x250-03.jpg' },
          { pageNum: 7, section: 'CULTURA, TRADICIÓN & ESTILO DE VIDA', sub: 'CARNAVAL DE MONTECRISTI · HISTORIA · GASTROMOMÍA · GENTE', color: '#7c3aed', lead: p7Lead, second: p7Second, third: p7Third, adSquare: '/ads/Bandera-300-x-250.jpg' },
          { pageNum: 8, section: 'DEPORTES & CONTRAPORTADA', sub: 'BÉISBOL LIDOM · MLB GRANDES LIGAS · BALONCESTO · PASATIEMPOS', color: '#16a34a', lead: p8Lead, second: p8Second, third: p8Third, adSquare: '/ads/300x250-03.jpg' },
        ].map((page) => {
          if (!viewAllPages && currentPage !== page.pageNum) return null;
          if (!page.lead) return null;

          return (
            <article
              key={page.pageNum}
              style={{ transform: viewAllPages ? 'none' : `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-[#ffffff] text-[#111111] w-full max-w-[960px] min-h-[1380px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-gray-300 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:transform-none print:min-h-screen print:break-after-page print:page-break-after-always"
            >
              <div className="space-y-3">
                {/* Cintillo Superior */}
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider border-b-2 pb-1.5" style={{ borderColor: page.color }}>
                  <span style={{ color: page.color }}>PÁGINA {page.pageNum} · {page.section}</span>
                  <span>MONTECRISTI.NET</span>
                  <span>{dateStr.toUpperCase()}</span>
                </div>

                {/* Cabecilla de Sección */}
                <div className="text-white px-4 py-1.5 flex items-center justify-between" style={{ backgroundColor: page.color }}>
                  <span className="font-black text-sm uppercase tracking-widest">{page.section}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 hidden sm:inline">{page.sub}</span>
                </div>

                {/* Noticia Principal Completa */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border inline-block" style={{ color: page.color, borderColor: page.color, backgroundColor: `${page.color}15` }}>
                    {getCategoryNames(page.lead)[0] || 'TEMA DESTACADO'}
                  </span>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-[#111111] leading-tight">
                    {page.lead.title.rendered.replace(/<[^>]+>/g, '')}
                  </h2>

                  <div className="grid grid-cols-12 gap-5 items-start">
                    <div className="col-span-12 md:col-span-5 space-y-1.5">
                      <div className="relative aspect-[4/3] w-full bg-gray-100 border border-gray-300 overflow-hidden shadow-xs">
                        <Image src={getFeaturedImage(page.lead) || siteConfig.seo.defaultImage} alt="Foto Noticia" fill className="object-cover" />
                      </div>
                      <p className="text-[10.5px] text-gray-600 italic leading-snug">
                        Cobertura informativa oficial de Montecristi.net.
                      </p>
                    </div>

                    <div className="col-span-12 md:col-span-7">
                      <div className="columns-1 sm:columns-2 gap-4 text-justify font-serif text-[12.5px] text-gray-900 leading-[1.65]">
                        {getPrintParagraphs(page.lead.content?.rendered || page.lead.excerpt?.rendered || '').map((para, idx) => (
                          <p key={idx} className={`mb-3 ${idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:font-serif first-letter:float-left first-letter:mr-2.5 first-letter:leading-none' : ''}`} style={idx === 0 ? { color: page.color } : {}}>
                            <span className="text-gray-900">{para}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2da y 3ra Noticias de la Plana + Anuncio Cuadrado */}
                <div className="border-t-2 border-black pt-3 mt-3 grid grid-cols-12 gap-5">
                  {page.second && (
                    <div className="col-span-12 md:col-span-7 space-y-2 border-r-0 md:border-r md:border-gray-200 pr-0 md:pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: page.color }}></span>
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: page.color }}>
                          {getCategoryNames(page.second)[0] || 'SEGUNDO REPORTE'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black font-serif text-[#111111] leading-snug">
                        {page.second.title.rendered.replace(/<[^>]+>/g, '')}
                      </h3>

                      <div className="relative aspect-video w-full bg-gray-100 border border-gray-300 overflow-hidden mb-2">
                        <Image src={getFeaturedImage(page.second) || siteConfig.seo.defaultImage} alt="Foto Noticia 2" fill className="object-cover" />
                      </div>

                      <div className="text-justify font-serif text-[12px] text-gray-800 leading-relaxed space-y-2">
                        {getPrintParagraphs(page.second.content?.rendered || page.second.excerpt?.rendered || '').slice(0, 4).map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-12 md:col-span-5 space-y-3 flex flex-col justify-between">
                    {page.third && (
                      <div className="space-y-1.5 border-b border-gray-200 pb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: page.color }}>
                          ACTUALIDAD · {getCategoryNames(page.third)[0] || 'INFORME'}
                        </span>
                        <h4 className="text-[13px] font-black text-gray-900 leading-tight">
                          {page.third.title.rendered.replace(/<[^>]+>/g, '')}
                        </h4>
                        <p className="text-[11px] text-gray-700 font-serif leading-snug text-justify">
                          {cleanPrintExcerpt(page.third.content?.rendered || page.third.excerpt?.rendered || '', 180)}
                        </p>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">ESPACIO PUBLICITARIO</span>
                      <div className="relative aspect-[300/250] w-full border border-gray-300 overflow-hidden shadow-xs">
                        <Image src={page.adSquare} alt="Publicidad" fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Horizontal Inferior */}
                <div className="mt-3 pt-2 border-t-2 border-black">
                  <div className="relative w-full overflow-hidden border border-gray-300 shadow-xs">
                    <Image src="/ads/Bandera-970-X-90.jpg" alt="Publicidad" width={970} height={90} style={{ width: '100%', height: 'auto' }} className="w-full h-auto block" />
                  </div>
                </div>
              </div>

              {/* Pie de Plana */}
              <div className="border-t border-black pt-2 mt-2 flex items-center justify-between text-[9px] text-gray-800 font-bold uppercase tracking-wider">
                <span>EDICIÓN IMPRESA MONTECRISTI.NET</span>
                <span>{page.section}</span>
                <span className="font-black" style={{ color: page.color }}>PÁGINA {page.pageNum} {page.pageNum === 8 ? '· CONTRAPORTADA' : ''}</span>
              </div>
            </article>
          );
        })}

      </div>
    </div>
  );
}
