'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { siteConfig } from '@/config/site';
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
  const [showMsg, setShowMsg] = useState(false);
  const msgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className={`relative bg-zinc-200 flex items-center justify-center overflow-hidden ${className}`}
           style={fill ? { width: '100%', height: '100%' } : { width, height }}>
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
      className={`relative group overflow-hidden bg-zinc-100 ${fill ? 'w-full h-full' : ''} ${className || ''}`}
      onContextMenu={(e) => e.preventDefault()}
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
        className={`transition-opacity duration-300 group-hover:scale-105 pointer-events-none select-none ${fill ? 'object-cover' : ''} ${priority || loaded ? 'opacity-100' : 'opacity-0'}`}
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

      {/* Capa invisible de protección total contra guardado */}
      <div className="absolute inset-0 z-10 select-none pointer-events-auto bg-transparent" />
    </div>
  );
}
