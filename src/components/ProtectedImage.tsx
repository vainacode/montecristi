'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BroadcastCintillo } from './BroadcastCintillo';

interface ProtectedImageProps {
  src?: string | null;
  alt: string;
  title?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showCintillo?: boolean;
}

interface ContextMenuPos {
  x: number;
  y: number;
}

export function ProtectedImage({
  src,
  alt,
  title,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
  showCintillo = true,
}: ProtectedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPos | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Cerrar menú contextual al hacer clic fuera o al hacer scroll
  useEffect(() => {
    if (!contextMenu) return;
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setContextMenu(null);
    });
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
    };
  }, [contextMenu]);

  const copyWithCintillo = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setContextMenu(null);
    if (!src || isCopying) return;

    setIsCopying(true);
    showToast('Generando foto con cintillo...');

    try {
      const cleanTitle = title || alt || 'montecristi';
      const apiUrl = `/api/image?url=${encodeURIComponent(src)}&format=png&cintilloOnly=1&title=${encodeURIComponent(cleanTitle)}`;
      
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Error al procesar la imagen');

      const blob = await res.blob();

      // Intentar copiar directamente al portapapeles del sistema
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('✓ ¡Foto copiada con cintillo al portapapeles!');
          setIsCopying(false);
          return;
        } catch {
          // Si el navegador deniega el permiso del portapapeles, recurrir a descarga automática
        }
      }

      // Fallback: Descarga directa si el navegador no permite ClipboardItem
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cintillo.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      showToast('✓ Foto con cintillo descargada');
    } catch {
      showToast('No se pudo copiar la foto. Intenta de nuevo.');
    } finally {
      setIsCopying(false);
    }
  };

  const downloadWithCintillo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setContextMenu(null);
    if (!src) return;

    const cleanTitle = title || alt || 'montecristi';
    const downloadUrl = `/api/image?url=${encodeURIComponent(src)}&download=1&cintilloOnly=1&title=${encodeURIComponent(cleanTitle)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cintillo.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('✓ Descargando foto con cintillo...');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Posición del clic dentro de la ventana
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Asegurar que el menú no se salga de la pantalla
    const menuWidth = 240;
    const menuHeight = 110;
    const x = clickX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 12 : clickX;
    const y = clickY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 12 : clickY;

    setContextMenu({ x, y });
  };

  if (!src || imageFailed) {
    return (
      <div
        className={`relative bg-zinc-200 flex items-center justify-center overflow-hidden ${className || ''}`}
        style={fill ? { width: '100%', height: '100%' } : { width, height }}
      >
        <div className="relative w-1/2 aspect-square opacity-20 grayscale brightness-75">
          <Image
            src="/logo.svg"
            alt="Montecristi.net"
            fill
            className="object-contain"
          />
        </div>
        {showCintillo && <BroadcastCintillo />}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden bg-zinc-100 select-none ${fill ? 'w-full h-full' : ''} ${className || ''}`}
      onContextMenu={handleContextMenu}
    >
      {/* SKELETON ANIMATION (solo en imágenes diferidas, no en LCP priority) */}
      {!priority && !loaded && (
        <div className="absolute inset-0 z-20 sk-shimmer" />
      )}

      <Image
        src={src || "/placeholder.jpg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`transition-opacity duration-300 group-hover:scale-105 select-none ${fill ? 'object-cover' : ''} ${priority || loaded ? 'opacity-100' : 'opacity-0'}`}
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? undefined : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setImageFailed(true)}
        draggable={false}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
      
      {/* Cintillo oficial informativo en todas las fotos */}
      {showCintillo && (
        <BroadcastCintillo />
      )}

      {/* Botón flotante para copiar foto con cintillo (visible al pasar el ratón o tocar) */}
      <div className="absolute top-2.5 right-2.5 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 pointer-events-auto">
        <button
          type="button"
          onClick={copyWithCintillo}
          disabled={isCopying}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/75 hover:bg-[#042564] text-white text-[11px] font-bold shadow-lg backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Copiar foto con el cintillo oficial de Montecristi.net"
          aria-label="Copiar foto con cintillo"
        >
          {isCopying ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Copiando...</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copiar foto</span>
            </>
          )}
        </button>
      </div>

      {/* Menú contextual personalizado al hacer clic derecho */}
      {contextMenu && (
        <div
          className="fixed z-9999 bg-[#042564]/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/15 py-1.5 min-w-[210px] animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[9px] font-black uppercase tracking-wider text-blue-200/80 border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Montecristi.net</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#BF1B23]" />
          </div>

          <button
            type="button"
            onClick={copyWithCintillo}
            disabled={isCopying}
            className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/15 flex items-center gap-2.5 transition-colors cursor-pointer text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{isCopying ? 'Copiando foto...' : 'Copiar foto con cintillo'}</span>
          </button>

          <button
            type="button"
            onClick={downloadWithCintillo}
            className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/15 flex items-center gap-2.5 transition-colors cursor-pointer text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Descargar con cintillo</span>
          </button>
        </div>
      )}

      {/* Notificación Toast al copiar */}
      {toastMsg && (
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md border border-white/20 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
