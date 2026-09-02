'use client';

import React from 'react';
import { useNewsReader, ArticleAudioData } from '@/context/NewsReaderContext';
import { Headphones, Play, Pause } from 'lucide-react';

interface ListenButtonProps {
  article: ArticleAudioData;
  className?: string;
}

/**
 * Calcula el tiempo estimado de lectura en voz alta en minutos
 */
function estimateAudioDuration(html: string): number {
  if (!html) return 1;
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 140));
}

export function ListenButton({ article, className = '' }: ListenButtonProps) {
  const {
    currentArticle,
    status,
    playArticle,
    togglePlay,
    isSupported,
  } = useNewsReader();

  if (!isSupported) {
    return null;
  }

  const isThisArticleActive = currentArticle?.id === article.id;
  const isPlaying = isThisArticleActive && status === 'playing';
  const isPaused = isThisArticleActive && (status === 'paused' || status === 'stopped');
  const durationMin = estimateAudioDuration(article.content);

  const handleClick = () => {
    if (isThisArticleActive) {
      togglePlay();
    } else {
      playArticle(article);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label={isPlaying ? "Pausar audio de la noticia" : "Escuchar esta noticia en audio"}
      className={`group relative inline-flex items-center gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border transition-all duration-300 select-none cursor-pointer ${
        isPlaying
          ? 'bg-[#042564] border-[#042564] text-white shadow-lg ring-2 ring-[#BF1B23]/40'
          : isPaused
          ? 'bg-[#021437] border-[#042564] text-white shadow-md'
          : 'bg-gradient-to-r from-zinc-50 to-white hover:from-white hover:to-zinc-50 border-gray-200/90 hover:border-[#042564]/40 text-gray-900 shadow-xs hover:shadow-md'
      } ${className}`}
    >
      {/* Indicador / Icono de Audio */}
      <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-105 ${
        isPlaying
          ? 'bg-[#BF1B23] text-white shadow-xs'
          : isPaused
          ? 'bg-[#BF1B23] text-white'
          : 'bg-[#042564] text-white'
      }`}>
        {isPlaying ? (
          <div className="flex items-center gap-0.5 px-1">
            <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : isPaused ? (
          <Play size={14} className="fill-current ml-0.5" />
        ) : (
          <Headphones size={15} />
        )}
      </div>

      {/* Textos */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs sm:text-[13px] font-black uppercase tracking-wider ${
            isPlaying ? 'text-white' : isPaused ? 'text-white' : 'text-gray-900 group-hover:text-[#042564]'
          }`}>
            {isPlaying
              ? 'Pausar audio'
              : isPaused
              ? 'Continuar escuchando'
              : 'Escuchar esta noticia'}
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-wide ${
          isPlaying ? 'text-gray-300' : isPaused ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {isPlaying ? 'Reproduciendo narración en vivo' : `Lectura automática · ${durationMin} min de audio`}
        </span>
      </div>

      {/* Punto de estado activo con Rojo Carmesí oficial */}
      {isPlaying && (
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d55] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BF1B23]" />
        </span>
      )}
    </button>
  );
}
