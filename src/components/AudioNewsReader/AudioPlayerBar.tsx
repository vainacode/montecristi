'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useNewsReader } from '@/context/NewsReaderContext';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  ChevronDown,
  ChevronUp,
  Gauge,
  Sparkles,
  Headphones,
} from 'lucide-react';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayerBar() {
  const {
    status,
    currentArticle,
    currentChunkIndex,
    totalChunks,
    progress,
    rate,
    availableVoices,
    selectedVoice,
    isMinimized,
    isVisible,
    errorMessage,
    togglePlay,
    stop,
    nextChunk,
    prevChunk,
    seekToChunk,
    setRate,
    setVoice,
    toggleMinimize,
    closePlayer,
  } = useNewsReader();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowVoiceModal(false);
        setShowSpeedMenu(false);
      }
    };
    if (showVoiceModal || showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoiceModal, showSpeedMenu]);

  if (!isVisible || !currentArticle) {
    return null;
  }

  const isPlaying = status === 'playing';

  // ── 1. MODO MINIMIZADO: Píldora Flotante Compacta (Paleta Oficial) ──────────
  if (isMinimized) {
    return (
      <aside
        aria-label="Reproductor de audio minimizado"
        className="fixed bottom-4 right-4 z-[90] animate-fade-in-up"
      >
        <div className="flex items-center gap-3 bg-[#021437]/95 backdrop-blur-md border border-white/15 text-white px-4 py-2.5 rounded-full shadow-2xl hover:border-[#BF1B23]/60 transition-all group">
          {/* Botón Play/Pausa en Rojo Oficial */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar audio' : 'Reanudar audio'}
            className="w-9 h-9 rounded-full bg-[#BF1B23] hover:bg-[#8A1017] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
          </button>

          {/* Información y Título Clickeable para Expandir */}
          <div
            onClick={toggleMinimize}
            className="flex flex-col max-w-[180px] sm:max-w-[240px] cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4d55] flex items-center gap-1">
              <span>AUDIO</span>
              <span className="text-gray-300 font-normal">· {progress}%</span>
            </span>
            <span className="text-xs font-bold text-gray-100 truncate">
              {currentArticle.title}
            </span>
          </div>

          {/* Botón Expandir */}
          <button
            onClick={toggleMinimize}
            aria-label="Expandir reproductor"
            className="p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronUp size={18} />
          </button>

          {/* Botón Cerrar */}
          <button
            onClick={closePlayer}
            aria-label="Cerrar reproductor"
            className="p-1.5 text-gray-300 hover:text-[#ff4d55] transition-colors cursor-pointer border-l border-white/10 pl-2"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    );
  }

  // ── 2. MODO EXPANDIDO: Barra Completa Profesional (Paleta Oficial) ──────────
  return (
    <aside
      aria-label="Reproductor de audio de noticias"
      className="fixed bottom-0 left-0 right-0 z-[90] bg-[#021437]/95 backdrop-blur-xl border-t border-white/15 text-white shadow-[0_-15px_40px_rgba(0,0,0,0.6)] animate-fade-in-up"
    >
      {/* ── BARRA DE PROGRESO INTERACTIVA SUPERIOR CON PALETA OFICIAL ── */}
      <div
        onClick={(e) => {
          if (totalChunks <= 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = clickX / rect.width;
          const targetIndex = Math.min(totalChunks - 1, Math.max(0, Math.floor(ratio * totalChunks)));
          seekToChunk(targetIndex);
        }}
        className="w-full h-1.5 bg-white/10 cursor-pointer relative group/progress transition-all hover:h-2.5"
      >
        <div
          className="h-full bg-gradient-to-r from-[#042564] via-[#BF1B23] to-[#ff4d55] transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform ring-2 ring-[#BF1B23]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          
          {/* ── SECCIÓN IZQUIERDA: Marca, Título de Noticia y Ecualizador ── */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* Logo de Montecristi */}
            <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0 p-1 flex items-center justify-center overflow-hidden shadow-inner">
              <Image
                src="/logo.svg"
                alt="Montecristi.net"
                width={28}
                height={28}
                className="w-full h-full object-contain grayscale brightness-125 opacity-85"
              />
            </div>

            {/* Metadatos y Título */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d55] flex items-center gap-1">
                  <Headphones size={11} />
                  <span>MONTECRISTI.NET · AUDIO</span>
                </span>
                <span className="text-[9px] font-mono text-gray-300 bg-white/10 px-2 py-0.2 rounded-full">
                  Párrafo {currentChunkIndex + 1}/{Math.max(1, totalChunks)}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full font-sans tracking-tight">
                {currentArticle.title}
              </h4>
            </div>

            {/* Animación Ecualizador Waveform en Rojo Oficial */}
            {isPlaying && (
              <div className="hidden lg:flex items-end gap-1 h-5 px-2 shrink-0">
                <span className="w-1 bg-[#BF1B23] rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
                <span className="w-1 bg-[#ff4d55] rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" style={{ height: '90%' }} />
                <span className="w-1 bg-[#BF1B23] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                <span className="w-1 bg-[#ff4d55] rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '100%' }} />
                <span className="w-1 bg-[#BF1B23] rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" style={{ height: '50%' }} />
              </div>
            )}
          </div>

          {/* ── SECCIÓN CENTRAL: Controles Principales de Reproducción ── */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
            {/* Párrafo Anterior */}
            <button
              onClick={prevChunk}
              disabled={currentChunkIndex === 0}
              aria-label="Párrafo anterior"
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <SkipBack size={18} />
            </button>

            {/* Botón Principal PLAY/PAUSA (Rojo Carmesí oficial #BF1B23) */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#BF1B23] hover:bg-[#8A1017] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(191,27,35,0.45)] hover:shadow-[0_6px_25px_rgba(191,27,35,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ring-2 ring-white/20"
            >
              {isPlaying ? (
                <Pause size={20} className="fill-current" />
              ) : (
                <Play size={20} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Párrafo Siguiente */}
            <button
              onClick={nextChunk}
              disabled={currentChunkIndex >= totalChunks - 1}
              aria-label="Párrafo siguiente"
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <SkipForward size={18} />
            </button>

            {/* Detener */}
            <button
              onClick={stop}
              aria-label="Detener reproducción"
              className="p-2 rounded-full text-gray-300 hover:text-[#ff4d55] hover:bg-white/10 transition-all cursor-pointer hidden sm:block"
            >
              <Square size={16} />
            </button>
          </div>

          {/* ── SECCIÓN DERECHA: Velocidad, Selector de Voz, Minimizar y Cerrar ── */}
          <div ref={modalRef} className="flex items-center justify-between sm:justify-end gap-2 shrink-0 relative">
            
            {/* Selector de Velocidad */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(prev => !prev);
                  setShowVoiceModal(false);
                }}
                aria-label={`Velocidad de reproducción actual: ${rate}x`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-black tracking-wider transition-colors cursor-pointer"
              >
                <Gauge size={13} className="text-[#ff4d55]" />
                <span>{rate}x</span>
              </button>

              {/* Menú de Velocidades */}
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#042564] border border-white/20 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 min-w-[100px] z-50 animate-fade-in-up">
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 px-2 py-1">
                    Velocidad
                  </div>
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setRate(opt);
                        setShowSpeedMenu(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        rate === opt
                          ? 'bg-[#BF1B23] text-white font-black'
                          : 'text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <span>{opt}x</span>
                      {opt === 1 && <span className="text-[9px] opacity-70">Normal</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selector de Voz */}
            {availableVoices.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowVoiceModal(prev => !prev);
                    setShowSpeedMenu(false);
                  }}
                  aria-label="Seleccionar voz del lector"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
                >
                  <Volume2 size={13} className="text-[#ff4d55] shrink-0" />
                  <span className="truncate text-[11px]">
                    {selectedVoice?.name.replace(/Google|Microsoft|Apple|es-DO|es-MX|es-ES/gi, '').trim() || 'Voz'}
                  </span>
                </button>

                {/* Modal / Menú de Voces */}
                {showVoiceModal && (
                  <div className="absolute bottom-full mb-2 right-0 bg-[#042564] border border-white/20 rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-64 max-h-60 overflow-y-auto z-50 animate-fade-in-up">
                    <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-1">
                        <Sparkles size={10} className="text-[#ff4d55]" />
                        Voces en Español
                      </span>
                    </div>

                    {availableVoices
                      .filter(v => v.lang.toLowerCase().startsWith('es'))
                      .map((v, idx) => (
                        <button
                          key={`${v.voiceURI || v.name}-${v.lang}-${idx}`}
                          onClick={() => {
                            setVoice(v);
                            setShowVoiceModal(false);
                          }}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                            selectedVoice?.voiceURI === v.voiceURI
                              ? 'bg-[#021437] border border-[#BF1B23] text-white font-bold'
                              : 'text-gray-200 hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate">{v.name}</span>
                          <span className="text-[9px] text-gray-400 font-mono">{v.lang}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Separador */}
            <div className="w-px h-5 bg-white/15 hidden sm:block" />

            {/* Minimizar */}
            <button
              onClick={toggleMinimize}
              aria-label="Minimizar reproductor"
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronDown size={18} />
            </button>

            {/* Cerrar */}
            <button
              onClick={closePlayer}
              aria-label="Cerrar reproductor de audio"
              className="p-2 rounded-full text-gray-300 hover:text-[#ff4d55] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

          </div>

        </div>

        {/* Mensaje de Error si surge */}
        {errorMessage && (
          <div className="mt-2 text-[11px] text-white bg-[#BF1B23]/40 border border-[#BF1B23] px-3 py-1 rounded-md text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </aside>
  );
}
