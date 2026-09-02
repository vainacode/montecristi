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
  generalPosts?: WPPost[];
  montecristiPosts?: WPPost[];
  posts?: WPPost[];
  dateStr: string;
  editionNumber: number;
}

/**
 * Limpia y purifica el texto para versión 100% IMPRESA:
 * - Elimina tags HTML, scripts, iframes y enlaces web.
 * - Elimina coletillas ("leer más", "sigue leyendo", "P. 3", etc.).
 * - Sanitiza créditos de marcas ajenas a "Redacción Montecristi".
 * - Entrega párrafos sólidos para maquetación en columnas periodísticas.
 */
function getPrintParagraphs(htmlStr: string): string[] {
  if (!htmlStr) return [];
  const clean = htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/\((?:sigue leyendo|leer m[aá]s|read more|ver m[aá]s|clic aqu[ií]|foto:[^)]+|P\.\s*\d+)\s*…?\)/gi, '')
    .replace(/(?:Diario al D[ií]a|Noticiario RD|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\s*\|\s*/gi, 'Redacción Montecristi | ')
    .replace(/(?:Diario al D[ií]a|Noticiario RD|Reloj Informativo|De [UÚ]ltimo Minuto|Santo[s]? V[aá]squez Informa)\s*[-–—]\s*/gi, 'Redacción Montecristi — ')
    .replace(/(?:<br\s*\/?>\s*)+/gi, '</p><p>');

  const raw = clean
    .split(/<\/(?:p|div|h\d|li)>/i)
    .map(p =>
      p
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#8220;/g, '“')
        .replace(/&#8221;/g, '”')
        .replace(/&#8216;/g, '‘')
        .replace(/&#8217;/g, '’')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .trim()
    )
    .filter(p => p.length > 20);

  if (raw.length > 0) return raw;

  const plain = htmlStr.replace(/<[^>]+>/g, '').trim();
  return plain ? [plain] : [];
}

function cleanTitle(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .trim();
}

export function PrintEditionReader({
  generalPosts = [],
  montecristiPosts = [],
  posts = [],
  dateStr,
  editionNumber
}: PrintEditionProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewAllPages, setViewAllPages] = useState<boolean>(false);

  // Unificamos las fuentes asegurando noticias completas
  const allGeneral = generalPosts.length > 0 ? generalPosts : posts;
  const allLocal = montecristiPosts.length > 0 ? montecristiPosts : allGeneral.slice(8);

  // 8 Páginas completas (cuadernillo tradicional de imprenta)
  const totalPages = 8;

  // ── REPARTO EDITORIAL PARA 8 PÁGINAS COMPLETAS ────────────────────────────
  // PÁG 1: PORTADA
  const coverLead = allGeneral[0] || null;
  const coverSecond = allGeneral[1] || null;
  const coverSidebar1 = allGeneral[2] || null;
  const coverSidebar2 = allGeneral[3] || null;
  const coverBottom1 = allGeneral[4] || null;
  const coverBottom2 = allGeneral[5] || null;

  // PÁG 2: MONTECRISTI & LA LÍNEA NOROESTE (100% Noticias Locales Reales)
  const p2Lead = allLocal[0] || allGeneral[6] || null;
  const p2Second = allLocal[1] || allGeneral[7] || null;
  const p2Third = allLocal[2] || allGeneral[8] || null;
  const p2Fourth = allLocal[3] || allGeneral[9] || null;

  // PÁG 3: PANORAMA NACIONAL & POLÍTICA
  const p3Lead = allGeneral[6] || allGeneral[0] || null;
  const p3Second = allGeneral[7] || allGeneral[1] || null;
  const p3Third = allGeneral[8] || allGeneral[2] || null;

  // PÁG 4: ECONOMÍA, NEGOCIOS & PUERTO DE MANZANILLO
  const p4Lead = allGeneral[9] || allGeneral[3] || null;
  const p4Second = allGeneral[10] || allGeneral[4] || null;
  const p4Third = allGeneral[11] || allGeneral[5] || null;

  // PÁG 5: OPINIÓN, EDITORIAL & TRIBUNA
  const p5Lead = allGeneral[12] || allGeneral[6] || null;
  const p5Second = allGeneral[13] || allGeneral[7] || null;
  const p5Third = allGeneral[14] || allGeneral[8] || null;

  // PÁG 6: SOCIEDAD, MEDIO AMBIENTE & COMUNIDAD
  const p6Lead = allGeneral[15] || allGeneral[9] || null;
  const p6Second = allGeneral[16] || allGeneral[10] || null;
  const p6Third = allGeneral[17] || allGeneral[11] || null;

  // PÁG 7: CULTURA, TURISMO & HISTORIA
  const p7Lead = allGeneral[18] || allGeneral[12] || null;
  const p7Second = allGeneral[19] || allGeneral[13] || null;
  const p7Third = allGeneral[20] || allGeneral[14] || null;

  // PÁG 8: DEPORTES & CONTRAPORTADA
  const p8Lead = allGeneral[21] || allGeneral[15] || null;
  const p8Second = allGeneral[22] || allGeneral[16] || null;
  const p8Third = allGeneral[23] || allGeneral[17] || null;

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

  const pageNames = [
    'Pág. 1 Portada',
    'Pág. 2 Montecristi',
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
        {/* PÁGINA 1: PORTADA PRINCIPAL (DISEÑO BROADSHEET INTERNACIONAL)        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(viewAllPages || currentPage === 1) && (
          <article
            style={{ transform: viewAllPages ? 'none' : `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="bg-[#ffffff] text-[#111111] w-full max-w-[960px] min-h-[1420px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-gray-300 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:transform-none print:min-h-screen print:break-after-page print:page-break-after-always"
          >
            <div className="space-y-3">
              {/* Encabezado superior */}
              <div className="flex items-center justify-between text-[11px] font-black text-gray-900 uppercase tracking-tight border-b-2 border-black pb-1">
                <span>{dateStr.toUpperCase()} · No. {editionNumber}</span>
                <span>MONTECRISTI / REPÚBLICA DOMINICANA · EDICIÓN NACIONAL COMPLETA</span>
                <span>WWW.MONTECRISTI.NET</span>
              </div>

              {/* Cabecera / Masthead de Periódico */}
              <div className="border-b-2 border-black pb-3">
                <div className="bg-[#042564] text-white p-4 sm:p-5 flex items-center justify-between rounded-xs shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-sm shrink-0">
                      <Image src="/logo.svg" alt="Montecristi.net" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                    </div>
                    <div>
                      <h2 className="font-[family-name:var(--font-source-sans)] font-black text-3xl sm:text-5xl lg:text-[52px] uppercase tracking-tighter leading-none">
                        MONTECRISTI<span className="text-[#BF1B23]">.NET</span>
                      </h2>
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-gray-200 block mt-1">
                        EL DIARIO DE SAN FERNANDO DE MONTECRISTI Y LA LÍNEA NOROESTE
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col text-right text-[10px] font-bold text-gray-300 border-l border-white/20 pl-4">
                    <span>EDICIÓN DIARIA MATUTINA</span>
                    <span className="text-white font-black">FUNDADO EN 2019</span>
                    <span>COBERTURA VERAZ & PLURAL</span>
                  </div>
                </div>
              </div>

              {/* ── CUERPO PRINCIPAL DE PORTADA: GRAN NOTICIA + COLUMNA LATERAL ── */}
              <div className="grid grid-cols-12 gap-6 pt-1">
                
                {/* Columna Izquierda: Gran Noticia Principal del Día */}
                <div className="col-span-12 lg:col-span-8 space-y-4 pr-0 lg:pr-4 lg:border-r lg:border-gray-200">
                  {coverLead && (
                    <div className="space-y-3 border-b-2 border-black pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23] bg-red-50 px-2.5 py-0.5 border border-red-200">
                        {getCategoryNames(coverLead)[0] || 'GRAN TITULAR DEL DÍA'}
                      </span>
                      
                      <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black font-serif text-gray-950 leading-[1.06] tracking-tight">
                        {cleanTitle(coverLead.title.rendered)}
                      </h2>

                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-600 border-y border-gray-100 py-1 font-sans">
                        <span className="text-[#BF1B23] uppercase">Por Redacción Montecristi</span>
                        <span>·</span>
                        <span>Santo Domingo / San Fernando</span>
                      </div>

                      {/* Foto Principal de Portada */}
                      <div className="relative aspect-[16/9] w-full bg-gray-100 border border-gray-300 overflow-hidden shadow-xs">
                        <Image
                          src={getFeaturedImage(coverLead) || siteConfig.seo.defaultImage}
                          alt="Foto Noticia Portada"
                          fill
                          priority
                          className="object-cover"
                        />
                      </div>

                      {/* Texto Completo a Doble Columna con Capitular */}
                      <div className="columns-1 sm:columns-2 gap-5 text-justify font-serif text-[12.5px] text-gray-900 leading-[1.65] pt-1">
                        {getPrintParagraphs(coverLead.content?.rendered || coverLead.excerpt?.rendered || '').map((para, idx) => (
                          <p key={idx} className={`mb-3 ${idx === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:font-serif first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:text-[#BF1B23]' : ''}`}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segunda Noticia de Portada */}
                  {coverSecond && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#042564]">
                        SEGUNDO ENFOQUE · {getCategoryNames(coverSecond)[0] || 'ACTUALIDAD'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-serif text-gray-950 leading-snug">
                        {cleanTitle(coverSecond.title.rendered)}
                      </h3>
                      <div className="columns-1 sm:columns-2 gap-4 text-justify font-serif text-[12px] text-gray-800 leading-relaxed pt-1">
                        {getPrintParagraphs(coverSecond.content?.rendered || coverSecond.excerpt?.rendered || '').slice(0, 4).map((para, idx) => (
                          <p key={idx} className="mb-2">{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Reportes Paralelos & Anuncio */}
                <div className="col-span-12 lg:col-span-4 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-[#BF1B23] text-white text-center py-1 px-2 text-[11px] font-black uppercase tracking-widest shadow-xs">
                      PANORAMA REGIONAL
                    </div>

                    {coverSidebar1 && (
                      <div className="border-b border-gray-200 pb-3 space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#BF1B23]">
                          {getCategoryNames(coverSidebar1)[0] || 'DESTACADO'}
                        </span>
                        <h4 className="text-[13.5px] font-black text-gray-950 leading-tight">
                          {cleanTitle(coverSidebar1.title.rendered)}
                        </h4>
                        <div className="relative aspect-video w-full bg-gray-100 border border-gray-200 overflow-hidden my-1.5">
                          <Image src={getFeaturedImage(coverSidebar1) || siteConfig.seo.defaultImage} alt="Foto Lateral" fill className="object-cover" />
                        </div>
                        <div className="text-justify font-serif text-[11.5px] text-gray-800 leading-relaxed space-y-1.5">
                          {getPrintParagraphs(coverSidebar1.content?.rendered || coverSidebar1.excerpt?.rendered || '').slice(0, 3).map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {coverSidebar2 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#042564]">
                          {getCategoryNames(coverSidebar2)[0] || 'INFORME'}
                        </span>
                        <h4 className="text-[13px] font-black text-gray-950 leading-tight">
                          {cleanTitle(coverSidebar2.title.rendered)}
                        </h4>
                        <div className="text-justify font-serif text-[11.5px] text-gray-800 leading-relaxed space-y-1.5">
                          {getPrintParagraphs(coverSidebar2.content?.rendered || coverSidebar2.excerpt?.rendered || '').slice(0, 3).map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-300 pt-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">ESPACIO PUBLICITARIO</span>
                    <div className="relative aspect-[300/250] w-full overflow-hidden">
                      <Image src="/ads/Bandera-300-x-250.jpg" alt="Publicidad Lateral" fill className="object-cover" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Banner Inferior */}
              <div className="mt-4 pt-2 border-t-2 border-black">
                <div className="relative w-full overflow-hidden">
                  <Image src="/ads/Bandera-970-X-90.jpg" alt="Publicidad Portada" width={970} height={90} style={{ width: '100%', height: 'auto' }} className="w-full h-auto block" />
                </div>
              </div>
            </div>

            <div className="border-t border-black pt-2 mt-3 flex items-center justify-between text-[9px] text-gray-600 font-bold uppercase tracking-wider">
              <span>ISSN 2972-8819 · EDICIÓN DIARIA IMPRESA</span>
              <span>SAN FERNANDO DE MONTECRISTI</span>
              <span className="text-[#BF1B23] font-black">PÁGINA 1 · PORTADA</span>
            </div>
          </article>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PÁGINAS INTERIORES 2 A 8 (NOTICIAS BIEN HECHAS Y COMPLETAS)          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {[
          {
            pageNum: 2,
            section: 'MONTECRISTI & LA LÍNEA NOROESTE',
            sub: 'SAN FERNANDO · GUAYUBÍN · VILLA VÁSQUEZ · CASTAÑUELAS · MANZANILLO',
            color: '#BF1B23',
            lead: p2Lead,
            second: p2Second,
            third: p2Third,
            fourth: p2Fourth,
            adSquare: '/ads/300x250-03.jpg'
          },
          {
            pageNum: 3,
            section: 'PANORAMA NACIONAL & POLÍTICA',
            sub: 'GOBIERNO · CONGRESO · JUSTICIA · PROVINCIAS · ESTADO',
            color: '#042564',
            lead: p3Lead,
            second: p3Second,
            third: p3Third,
            fourth: null,
            adSquare: '/ads/Bandera-300-x-250.jpg'
          },
          {
            pageNum: 4,
            section: 'ECONOMÍA, NEGOCIOS & PUERTO DE MANZANILLO',
            sub: 'FINANZAS · INFRAESTRUCTURA · COMERCIO EXTERIOR · TURISMO',
            color: '#8A1017',
            lead: p4Lead,
            second: p4Second,
            third: p4Third,
            fourth: null,
            adSquare: '/ads/300x250-03.jpg'
          },
          {
            pageNum: 5,
            section: 'OPINIÓN, EDITORIAL & TRIBUNA',
            sub: 'EDITORIAL INSTITUCIONAL · COLUMNAS · FIRMAS INVITADAS · ANÁLISIS',
            color: '#042564',
            lead: p5Lead,
            second: p5Second,
            third: p5Third,
            fourth: null,
            adSquare: '/ads/Bandera-300-x-250.jpg'
          },
          {
            pageNum: 6,
            section: 'COMUNIDAD, MEDIO AMBIENTE & SOCIEDAD',
            sub: 'PARQUES NACIONALES · SALUD · EDUCACIÓN · MORRO DE MONTECRISTI',
            color: '#0f766e',
            lead: p6Lead,
            second: p6Second,
            third: p6Third,
            fourth: null,
            adSquare: '/ads/300x250-03.jpg'
          },
          {
            pageNum: 7,
            section: 'CULTURA, TRADICIÓN & ESTILO DE VIDA',
            sub: 'CARNAVAL DE MONTECRISTI · HISTORIA · GASTRONOMÍA · TURISMO',
            color: '#7c3aed',
            lead: p7Lead,
            second: p7Second,
            third: p7Third,
            fourth: null,
            adSquare: '/ads/Bandera-300-x-250.jpg'
          },
          {
            pageNum: 8,
            section: 'DEPORTES & CONTRAPORTADA',
            sub: 'BÉISBOL LIDOM · MLB GRANDES LIGAS · BALONCESTO · RESUMEN FINAL',
            color: '#16a34a',
            lead: p8Lead,
            second: p8Second,
            third: p8Third,
            fourth: null,
            adSquare: '/ads/300x250-03.jpg'
          },
        ].map((page) => {
          if (!viewAllPages && currentPage !== page.pageNum) return null;
          if (!page.lead) return null;

          return (
            <article
              key={page.pageNum}
              style={{ transform: viewAllPages ? 'none' : `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-[#ffffff] text-[#111111] w-full max-w-[960px] min-h-[1420px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-gray-300 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:transform-none print:min-h-screen print:break-after-page print:page-break-after-always"
            >
              <div className="space-y-3">
                {/* Cintillo Superior */}
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider border-b-2 pb-1.5" style={{ borderColor: page.color }}>
                  <span style={{ color: page.color }}>PÁGINA {page.pageNum} · {page.section}</span>
                  <span>MONTECRISTI.NET · EDICIÓN IMPRESA</span>
                  <span>{dateStr.toUpperCase()}</span>
                </div>

                {/* Cabecilla de Sección */}
                <div className="text-white px-4 py-2 flex items-center justify-between rounded-xs" style={{ backgroundColor: page.color }}>
                  <span className="font-black text-sm uppercase tracking-widest">{page.section}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 hidden sm:inline">{page.sub}</span>
                </div>

                {/* ── 1. NOTICIA PRINCIPAL DE LA PÁGINA (COMPLETA A MÚLTIPLES COLUMNAS) ── */}
                <div className="space-y-3 pt-1 border-b-2 border-black pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border inline-block" style={{ color: page.color, borderColor: page.color, backgroundColor: `${page.color}15` }}>
                      {getCategoryNames(page.lead)[0] || 'REPORTE DESTACADO'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      Por Redacción Montecristi
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-[#111111] leading-tight">
                    {cleanTitle(page.lead.title.rendered)}
                  </h2>

                  <div className="grid grid-cols-12 gap-5 items-start">
                    <div className="col-span-12 md:col-span-5 space-y-1.5">
                      <div className="relative aspect-[4/3] w-full bg-gray-100 border border-gray-300 overflow-hidden shadow-xs">
                        <Image src={getFeaturedImage(page.lead) || siteConfig.seo.defaultImage} alt="Foto Noticia" fill className="object-cover" />
                      </div>
                      <p className="text-[10.5px] text-gray-600 italic leading-snug font-serif">
                        Cobertura informativa especial de Montecristi.net para la edición impresa.
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

                {/* ── 2. SEGUNDA Y TERCERA NOTICIAS COMPLETAS DE LA PLANA ── */}
                <div className="pt-2 grid grid-cols-12 gap-6">
                  {page.second && (
                    <div className="col-span-12 md:col-span-7 space-y-2 border-r-0 md:border-r md:border-gray-200 pr-0 md:pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: page.color }}></span>
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: page.color }}>
                          {getCategoryNames(page.second)[0] || 'SEGUNDO TEMA'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black font-serif text-[#111111] leading-snug">
                        {cleanTitle(page.second.title.rendered)}
                      </h3>

                      <div className="relative aspect-video w-full bg-gray-100 border border-gray-300 overflow-hidden my-2">
                        <Image src={getFeaturedImage(page.second) || siteConfig.seo.defaultImage} alt="Foto Noticia 2" fill className="object-cover" />
                      </div>

                      <div className="columns-1 sm:columns-2 gap-4 text-justify font-serif text-[12px] text-gray-800 leading-relaxed">
                        {getPrintParagraphs(page.second.content?.rendered || page.second.excerpt?.rendered || '').map((para, idx) => (
                          <p key={idx} className="mb-2">{para}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-12 md:col-span-5 space-y-4 flex flex-col justify-between">
                    {page.third && (
                      <div className="space-y-2 border-b border-gray-200 pb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: page.color }}>
                          ACTUALIDAD · {getCategoryNames(page.third)[0] || 'CRÓNICA'}
                        </span>
                        <h4 className="text-[14px] font-black text-gray-900 leading-snug">
                          {cleanTitle(page.third.title.rendered)}
                        </h4>
                        <div className="text-justify font-serif text-[11.5px] text-gray-800 leading-relaxed space-y-2">
                          {getPrintParagraphs(page.third.content?.rendered || page.third.excerpt?.rendered || '').slice(0, 4).map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block mb-1 text-center">ESPACIO PUBLICITARIO</span>
                      <div className="relative aspect-[300/250] w-full border border-gray-300 overflow-hidden shadow-xs">
                        <Image src={page.adSquare} alt="Publicidad Interior" fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Inferior */}
                <div className="mt-3 pt-2 border-t-2 border-black">
                  <div className="relative w-full overflow-hidden border border-gray-300 shadow-xs">
                    <Image src="/ads/Bandera-970-X-90.jpg" alt="Publicidad Plana" width={970} height={90} style={{ width: '100%', height: 'auto' }} className="w-full h-auto block" />
                  </div>
                </div>
              </div>

              <div className="border-t border-black pt-2 mt-3 flex items-center justify-between text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                <span>MONTECRISTI.NET · PERIÓDICO IMPRESO</span>
                <span>SANTO DOMINGO / MONTECRISTI</span>
                <span className="font-black" style={{ color: page.color }}>PÁGINA {page.pageNum} · {page.section}</span>
              </div>
            </article>
          );
        })}

      </div>
    </div>
  );
}
