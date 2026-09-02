'use client';

import Image from 'next/image';
import Link from 'next/link';
import { adsConfig, type AdSize, type AdPosition } from '@/config/ads';

interface CustomAdProps {
  size: AdSize;
  position: AdPosition;
  className?: string;
}

const adMap: Record<AdPosition, { src: string; width: number; height: number; alt: string; href: string }> = {
  homeTopLeaderboard: {
    src: '/ads/Bandera-970-X-90.webp',
    width: 970,
    height: 90,
    alt: 'Publicidad — Periódico Montecristi',
    href: '/contacto',
  },
  homeAfterHero: {
    src: '/ads/Bandera-970-X-90.webp',
    width: 970,
    height: 90,
    alt: 'Publicidad — Periódico Montecristi',
    href: '/contacto',
  },
  homeSidebarHero1: {
    src: '/ads/Bandera-300-x-250.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  homeSidebarHero2: {
    src: '/ads/300x250-03.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  homeSidebarFeedRect: {
    src: '/ads/Bandera-300-x-250.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  homeSidebarFeedVert: {
    src: '/ads/300x250-03.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  categoryAfterHero: {
    src: '/ads/Bandera-970-X-90.webp',
    width: 970,
    height: 90,
    alt: 'Publicidad — Periódico Montecristi',
    href: '/contacto',
  },
  categorySidebarRect: {
    src: '/ads/Bandera-300-x-250.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  categorySidebarVert: {
    src: '/ads/300x250-03.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  articleSidebarRect: {
    src: '/ads/300x250-03.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  articleSidebarVert: {
    src: '/ads/Bandera-300-x-250.webp',
    width: 300,
    height: 250,
    alt: 'Publicidad — Montecristi Digital',
    href: '/contacto',
  },
  articleInContent: {
    src: '/ads/Bandera-970-X-90.webp',
    width: 970,
    height: 90,
    alt: 'Publicidad — Periódico Montecristi',
    href: '/contacto',
  },
};

export function CustomAd({ size, position, className = '' }: CustomAdProps) {
  const config = adsConfig._internal.config[position];

  if (!config || !config.visible) return null;

  const adData = adMap[position] || {
    src: size === 'horizontal' ? '/ads/Bandera-970-X-90.webp' : '/ads/Bandera-300-x-250.webp',
    width: size === 'horizontal' ? 970 : 300,
    height: size === 'horizontal' ? 90 : 250,
    alt: 'Publicidad — Montecristi',
    href: '/contacto',
  };

  const isHorizontal = size === 'horizontal';
  // Only the top leaderboard ad is above the fold
  const isAboveFold = position === 'homeTopLeaderboard';

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <Link
        href={adData.href}
        prefetch={false}
        className={`group relative block w-full ${
          isHorizontal ? 'max-w-[970px]' : 'max-w-[300px]'
        }`}
      >
        <Image
          src={adData.src}
          alt={adData.alt}
          width={adData.width}
          height={adData.height}
          style={{ width: '100%', height: 'auto' }}
          className="w-full h-auto object-cover block"
          priority={isAboveFold}
          loading={isAboveFold ? undefined : 'lazy'}
        />
      </Link>
    </div>
  );
}
