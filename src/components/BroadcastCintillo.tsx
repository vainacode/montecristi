import React from 'react';
import Image from 'next/image';

interface BroadcastCintilloProps {
  label?: string;
  showBadge?: boolean;
}

export function BroadcastCintillo({
  showBadge = true
}: BroadcastCintilloProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-7 md:h-8 flex items-stretch justify-between bg-[#042564] shadow-md overflow-hidden select-none pointer-events-none">
      
      {/* ── Logo oficial logo.svg + Nombre idéntico al Header (MONTECRISTI.NET) ── */}
      <div className="flex-1 flex items-center justify-center gap-2 pl-3 pr-1 z-10">
        <div className="relative h-4 md:h-5 w-4 md:w-5 shrink-0 flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Logo Montecristi.net"
            width={20}
            height={20}
            style={{ width: 'auto', height: '100%' }}
            className="h-full object-contain grayscale brightness-125 opacity-90 drop-shadow-xs"
          />
        </div>
        <span className="font-[family-name:var(--font-source-sans)] font-black tracking-tight text-white uppercase text-[11px] md:text-[13px] leading-none drop-shadow-xs">
          MONTECRISTI<span className="font-bold text-white/90">.NET</span>
        </span>
      </div>

      {/* ── Franja Diagonal Roja de Acento y Badge Circular ── */}
      <div className="relative h-full w-14 sm:w-16 shrink-0 flex items-center justify-end z-10">
        {/* Corte trapezoidal inclinado como en la referencia */}
        <div
          className="absolute inset-0 bg-[#BF1B23]"
          style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />
        {showBadge && (
          <div className="relative z-20 mr-1.5 flex items-center justify-center w-4.5 h-4.5 md:w-5 md:h-5 rounded-full bg-white shadow-sm border border-red-100">
            <span className="w-2 h-2 rounded-full bg-[#BF1B23] animate-pulse" />
          </div>
        )}
      </div>

    </div>
  );
}
