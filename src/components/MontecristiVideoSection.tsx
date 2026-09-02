'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface VideoItem {
  id: string;
  title: string;
  category: 'ENTREVISTA' | 'HISTORIA' | 'VLOG' | 'TURISMO';
  author: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: '022v78uKdJU',
    title: 'Primer Dominicano en llegar a Grandes Ligas "Osvaldo Virgil": una historia diferente',
    category: 'ENTREVISTA',
    author: 'MORRO TV Canal 34',
  },
  {
    id: 'LD4Z-yWvULA',
    title: 'La verdadera historia del Parque y el Reloj de Montecristi',
    category: 'HISTORIA',
    author: 'MORRO TV Canal 34',
  },
  {
    id: 'gEG95sopULw',
    title: 'Lo que nadie te dice de visitar Montecristi: guía de viaje real',
    category: 'VLOG',
    author: 'Check in Mañanero',
  },
  {
    id: 'OqbJwIE4fDw',
    title: '¿Qué pasa en estas 7 islas desiertas? (Cayos Siete Hermanos, Montecristi)',
    category: 'TURISMO',
    author: 'Andariego DO',
  },
];

export function MontecristiVideoSection() {
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(VIDEOS[0]);

  return (
    <section className="container mx-auto px-4 my-16">
      {/* ── HEADER DE LA SECCIÓN ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BF1B23]/10 border border-[#BF1B23]/20 text-[#BF1B23] text-[10px] font-black uppercase tracking-[0.25em] mb-2">
            <Film size={12} />
            <span>MULTIMEDIA & REPORTAJES</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black font-serif text-gray-900 tracking-tight flex items-center gap-3">
            <span>Montecristi en Video</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-sans pt-1">
            Entrevistas exclusivas, historias, documentales y vlogs de nuestra provincia.
          </p>
        </div>

        <Link
          href={siteConfig.social.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider shadow-md hover:shadow-red-600/30 active:scale-95 transition-all self-start md:self-auto"
        >
          <IconYouTube />
          <span>Ver Canal en YouTube</span>
        </Link>
      </div>

      {/* ── CONTENIDO: REPRODUCTOR NATIVO DIRECTO + LISTA LATERAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Reproductor Directo en la Página (Sin textos duplicados ni modales) */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-black border border-gray-200/80 shadow-lg">
          <div className="relative aspect-video w-full">
            <iframe
              key={currentVideo.id}
              src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?rel=0`}
              title={currentVideo.title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        {/* Lista de Reportajes y Vlogs */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 px-1 pb-1">
            <Sparkles size={14} className="text-[#BF1B23]" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-700">
              Reportajes y Vlogs
            </span>
          </div>

          {VIDEOS.map((item) => {
            const isCurrent = currentVideo.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentVideo(item)}
                className={`w-full text-left group flex items-center gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-red-50/70 border-[#BF1B23]/40 shadow-xs ring-1 ring-[#BF1B23]/20'
                    : 'bg-white hover:bg-gray-50/90 border-gray-200/80 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 shadow-xs">
                  <Image
                    src={`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="112px"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-[#042564]/40 flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded bg-[#BF1B23] text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        En pantalla
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#BF1B23] block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-[#BF1B23] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-medium block mt-1 truncate">
                    {item.author}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
