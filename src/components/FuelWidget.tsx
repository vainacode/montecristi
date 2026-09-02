'use client';

import React from 'react';
import Link from 'next/link';
import { fuelData } from '@/data/fuels';

interface FuelWidgetProps {
  className?: string;
}

export function FuelWidget({ className = '' }: FuelWidgetProps) {
  // Tomamos los 6 combustibles principales exactamente como en el formato de referencia
  const displayFuels = fuelData.fuels.slice(0, 6);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 sm:p-4 text-slate-900 ${className}`}>
      {/* ── HEADER: COMBUSTIBLES / RD$ ── */}
      <div className="flex items-center justify-between pb-2 px-1">
        <h3 className="font-black text-sm uppercase tracking-wider text-[#042564] font-sans">
          COMBUSTIBLES
        </h3>
        <span className="font-bold text-xs text-gray-400 font-sans tracking-wide">
          RD$
        </span>
      </div>

      {/* ── LISTA DE COMBUSTIBLES CON FILAS ALTERNADAS ── */}
      <div className="flex flex-col rounded-sm overflow-hidden text-sm">
        {displayFuels.map((fuel, index) => {
          const isEven = index % 2 === 0;
          const isFlat = fuel.trend === 'flat' || fuel.id === 'gas-natural' || fuel.delta === 0;
          const isDown = fuel.trend === 'down';
          const isUp = fuel.trend === 'up' || (!isFlat && !isDown);

          // Color y símbolo de variación
          const symbol = isFlat ? '=' : isDown ? '↓' : '↑';
          const valueColor = isFlat
            ? 'text-[#042564]'
            : isDown
            ? 'text-emerald-600'
            : 'text-[#cc0000]';

          return (
            <div
              key={fuel.id}
              className={`px-3 py-1.5 flex items-center justify-between transition-colors ${
                isEven ? 'bg-[#f0f4f8]' : 'bg-white'
              }`}
            >
              {/* Nombre del Combustible */}
              <span className="text-[13px] font-medium text-slate-800 font-sans truncate pr-2">
                {fuel.name}
              </span>

              {/* Precio y Flecha/Signo */}
              <div className="flex items-center gap-1 text-right shrink-0">
                <span className={`text-[13.5px] font-black font-sans tracking-tight ${valueColor}`}>
                  {fuel.price.toFixed(2)}
                </span>
                <span className={`text-[12px] font-black font-sans leading-none ${valueColor}`}>
                  {symbol}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PIE SUTIL CON ENLACE ── */}
      <div className="pt-2.5 mt-1 flex items-center justify-between text-[10px] text-gray-500 font-sans px-1 border-t border-gray-100">
        <span className="text-gray-400 truncate">
          MICM Oficial
        </span>
        <Link
          href="/combustibles"
          prefetch={false}
          className="text-[#042564] hover:text-[#BF1B23] font-bold transition-colors"
        >
          Ver histórico →
        </Link>
      </div>
    </div>
  );
}
