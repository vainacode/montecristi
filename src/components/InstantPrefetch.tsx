'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * InstantPrefetch:
 * Escucha eventos de hover e interacción para pre-cargar rutas en milisegundos.
 * Cuando el lector pasa el cursor o toca un enlace, Next.js descarga los datos
 * antes de hacer clic, logrando navegación instantánea (<50ms).
 */
export function InstantPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/api') &&
        !href.startsWith('#') &&
        !href.includes('mailto:') &&
        !href.includes('tel:')
      ) {
        router.prefetch(href);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/api') &&
        !href.startsWith('#')
      ) {
        router.prefetch(href);
      }
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [router]);

  return null;
}
