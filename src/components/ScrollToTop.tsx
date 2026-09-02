'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // 1. Resetear scroll al cambiar de ruta
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  // 2. Controlar visibilidad del botón flotante según el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#042564] hover:bg-[#BF1B23] text-white border-2 border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#BF1B23] ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-8 pointer-events-none scale-75'
      }`}
    >
      <ArrowUp
        size={20}
        className="transform group-hover:-translate-y-0.5 transition-transform duration-200"
      />
    </button>
  );
}
