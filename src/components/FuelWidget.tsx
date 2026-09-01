'use client';

import React from 'react';
import Link from 'next/link';
import { fuelData } from '@/data/fuels';
import { Fuel, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';

interface FuelWidgetProps {
  className?: string;
}

export function FuelWidget({ className = '' }: FuelWidgetProps) {
  const topFuels = fuelData.fuels.slice(0, 5);

  return (
    <div className={`bg-[#0f172a] text-white rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#BF1B23] animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Fuel size={14} className="text-[#BF1B23]" />
              Combustibles RD
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            MICM Oficial
          </span>
        </div>

        {/* List */}
        <div className="divide-y divide-white/5">
          {topFuels.map((fuel) => {
            const isDown = fuel.trend === 'down';
            const isUp = fuel.trend === 'up';

            return (
              <div key={fuel.id} className="py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-200 truncate pr-2">
                  {fuel.shortName}
                </span>

                <div className="flex items-center gap-2 text-right">
                  {isDown && (
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      ▼ {Math.abs(fuel.delta).toFixed(2)}
                    </span>
                  )}
                  {isUp && (
                    <span className="text-[10px] font-bold text-red-400 font-mono">
                      ▲ {Math.abs(fuel.delta).toFixed(2)}
                    </span>
                  )}
                  {!isDown && !isUp && (
                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                      — 0.00
                    </span>
                  )}
                  <span className="text-xs font-black font-mono text-white min-w-[70px]">
                    RD${fuel.price.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
        <span className="text-gray-400 font-mono">
          {fuelData.validRange.replace('Semana del ', '')}
        </span>
        <Link
          href="/combustibles"
          prefetch={false}
          className="text-[#BF1B23] hover:text-white font-bold flex items-center gap-1 transition-colors"
        >
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
