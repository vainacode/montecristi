'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Radio, AlertCircle, RefreshCw } from 'lucide-react';

interface LiveStreamPlayerProps {
  streamUrl?: string;
  poster?: string;
}

export function LiveStreamPlayer({
  streamUrl = 'https://soportedvb.click:3620/live/deultimominutomedialive.m3u8',
  poster = '/morroMontecristi.jpg'
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    let isDestroyed = false;

    setIsLoading(true);
    setHasError(false);

    const initHls = async () => {
      // 1. Caso 1: Soporte nativo HLS (Safari en iOS / macOS)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          if (!isDestroyed) {
            setIsLoading(false);
            video.play().then(() => setIsPlaying(true)).catch(() => {
              // Autoplay policy: iniciar muteado si es necesario
              video.muted = true;
              setIsMuted(true);
              video.play().then(() => setIsPlaying(true)).catch(() => {});
            });
          }
        });
        video.addEventListener('error', () => {
          if (!isDestroyed) {
            setHasError(true);
            setErrorMessage('No se pudo cargar la señal en vivo nativa.');
            setIsLoading(false);
          }
        });
        return;
      }

      // 2. Caso 2: Navegadores con soporte MediaSource (Chrome, Firefox, Edge, Android)
      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default || HlsModule;

        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxLiveSyncPlaybackRate: 1.5,
          });

          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);

          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!isDestroyed) {
              setIsLoading(false);
              video.play().then(() => setIsPlaying(true)).catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
              });
            }
          });

          hlsInstance.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hlsInstance.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  if (!isDestroyed) {
                    setHasError(true);
                    setErrorMessage('Emisión temporalmente fuera de línea.');
                    setIsLoading(false);
                  }
                  hlsInstance.destroy();
                  break;
              }
            }
          });
        } else {
          setHasError(true);
          setErrorMessage('Tu navegador no soporta reproducción de transmisiones HLS en vivo.');
          setIsLoading(false);
        }
      } catch (err) {
        // Fallback directo a src
        video.src = streamUrl;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
        setIsLoading(false);
      }
    };

    initHls();

    return () => {
      isDestroyed = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [streamUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted && volume === 0) {
      setVolume(1);
      video.volume = 1;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVol);
    video.volume = newVol;
    video.muted = newVol === 0;
    setIsMuted(newVol === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Indicador EN VIVO Superior */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white pointer-events-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF1B23] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BF1B23]"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white">
          SEÑAL EN VIVO
        </span>
      </div>

      {/* Marca de Agua Montecristi.net */}
      <div className="absolute top-4 right-4 z-20 opacity-80 pointer-events-none">
        <span className="text-[10px] font-[family-name:var(--font-source-sans)] font-black uppercase tracking-wider text-white drop-shadow-md">
          MONTECRISTI<span className="text-[#BF1B23]">.NET</span>
        </span>
      </div>

      {/* Spinner de Carga */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white">
          <div className="w-12 h-12 border-3 border-white/20 border-t-[#BF1B23] rounded-full animate-spin mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-200">
            Conectando con la señal en directo...
          </p>
        </div>
      )}

      {/* Pantalla de Error o Fuera de Emisión */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-4 text-[#BF1B23]">
            <Radio size={28} />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
            Emisión en Pausa
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
            {errorMessage || 'La transmisión se reanudará en breves momentos. Puedes reintentar la conexión.'}
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-[#BF1B23] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw size={14} />
            Reintentar Señal
          </button>
        </div>
      )}

      {/* Barra de Controles Personalizada */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar transmisión' : 'Reproducir transmisión'}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Control de Volumen */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-24 accent-[#BF1B23] cursor-pointer h-1 rounded-lg bg-white/30"
          />

          {/* Insignia LIVE */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#BF1B23]/30 border border-[#BF1B23]/50 text-[#BF1B23] text-[9px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BF1B23] animate-pulse" />
            DIRECTO
          </span>
        </div>

        {/* Pantalla Completa */}
        <button
          onClick={toggleFullscreen}
          aria-label="Pantalla completa"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
}
