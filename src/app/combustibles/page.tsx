'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calculator,
  Copy,
  Check,
  Fuel,
  ExternalLink,
  Flame
} from 'lucide-react';
import { fuelData, FuelItem } from '@/data/fuels';
import { CustomAd } from '@/components/CustomAd';

export default function CombustiblesPage() {
  const [selectedFuel, setSelectedFuel] = useState<FuelItem>(fuelData.fuels[0]);
  const [gallons, setGallons] = useState<number>(12);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeHistoryFuel, setActiveHistoryFuel] = useState<string>('Gasolina Premium');

  const embedCode = `<iframe src="https://montecristi.net/widget.php" width="340" height="420" frameborder="0" style="border-radius:12px;"></iframe>`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const calculatedTotal = (selectedFuel.price * gallons).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-[#0A0F1E] text-[#E8EDF5] min-h-screen font-sans selection:bg-[#F5A623] selection:text-[#0A0F1E]">
      
      {/* ── Sub-Navbar CombustibleRD ─────────────────────────────────────── */}
      <div className="bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/10 sticky top-[64px] md:top-[80px] z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/combustibles" className="flex items-center gap-2.5 text-lg font-bold text-white hover:text-[#F5A623] transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="tracking-tight font-black font-mono">CombustibleRD</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <a href="#precios" className="hover:text-white transition-colors hidden sm:inline">Precios</a>
            <a href="#variaciones" className="hover:text-white transition-colors hidden sm:inline">Variaciones</a>
            <a href="#calculadora" className="hover:text-white transition-colors hidden sm:inline">Calculadora</a>
            <a href="#historial" className="hover:text-white transition-colors hidden sm:inline">Historial</a>
            <a href="#widget" className="bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 px-3 py-1.5 rounded-lg hover:bg-[#F5A623] hover:text-[#0A0F1E] font-bold transition-all">
              Obtener Widget
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section id="precios" className="pt-12 pb-8 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-[#F5A623] text-xs font-mono font-bold uppercase tracking-[0.2em]">
            República Dominicana
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-mono">
            Precios de <span className="text-[#F5A623]">combustibles</span><br />esta semana
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto font-medium">
            Datos oficiales del Ministerio de Industria y Comercio (MICM), actualizados cada viernes.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 bg-[#1C2542] border border-[#F5A623]/30 px-4 py-2 rounded-full text-xs font-medium text-gray-200 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              <span>Precios actualizados correspondientes a la <strong>{fuelData.validRange.toLowerCase()}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fuel Grid ────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">
            Precios vigentes — RD$ por galón
          </p>
          <span className="text-[11px] text-gray-400">
            Fuente oficial: <a href="https://combustibles.micm.gob.do/" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline">MICM</a>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {fuelData.fuels.slice(0, 6).map((fuel) => {
            const isDown = fuel.trend === 'down';
            const isUp = fuel.trend === 'up';

            return (
              <div
                key={fuel.id}
                className="bg-[#111827] border border-white/10 hover:border-[#F5A623]/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-[#F5A623]/10"
              >
                <div>
                  <span className="text-xl block mb-2">{fuel.icon}</span>
                  <h3 className="text-xs font-bold text-gray-200 group-hover:text-[#F5A623] transition-colors line-clamp-1">
                    {fuel.name}
                  </h3>
                </div>

                <div className="pt-4 mt-2 border-t border-white/5 space-y-1">
                  <div className="text-xl font-bold font-mono text-white">
                    <span className="text-xs text-gray-400 font-normal mr-1">RD$</span>
                    {fuel.price.toFixed(2)}
                  </div>

                  <div>
                    {isDown && (
                      <span className="inline-block text-[10px] font-bold font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">
                        ▼ RD${Math.abs(fuel.delta).toFixed(2)}
                      </span>
                    )}
                    {isUp && (
                      <span className="inline-block text-[10px] font-bold font-mono text-[#E74C3C] bg-[#E74C3C]/10 px-2 py-0.5 rounded-md">
                        ▲ RD${Math.abs(fuel.delta).toFixed(2)}
                      </span>
                    )}
                    {!isDown && !isUp && (
                      <span className="inline-block text-[10px] font-bold font-mono text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-md">
                        — sin cambio
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Combustibles Adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
          {fuelData.fuels.slice(6, 9).map((fuel) => (
            <div key={fuel.id} className="bg-[#111827]/70 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-300 block">{fuel.name}</span>
                <span className="text-[10px] text-gray-500">{fuel.description}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-white block">RD$ {fuel.price.toFixed(2)}</span>
                <span className="text-[10px] font-mono text-[#2ECC71]">▼ RD${Math.abs(fuel.delta).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Variaciones esta semana ──────────────────────────────────────── */}
      <section id="variaciones" className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Flame size={18} className="text-[#F5A623]" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
              Cambios esta semana
            </h3>
          </div>

          <div className="divide-y divide-white/5">
            {fuelData.fuels.slice(0, 6).map((fuel) => (
              <div key={fuel.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200">{fuel.name}</span>
                {fuel.trend === 'down' && (
                  <span className="font-mono font-bold text-[#2ECC71] bg-[#2ECC71]/10 px-2.5 py-1 rounded-md">
                    ▼ Bajó RD${Math.abs(fuel.delta).toFixed(2)}
                  </span>
                )}
                {fuel.trend === 'up' && (
                  <span className="font-mono font-bold text-[#E74C3C] bg-[#E74C3C]/10 px-2.5 py-1 rounded-md">
                    ▲ Subió RD${Math.abs(fuel.delta).toFixed(2)}
                  </span>
                )}
                {fuel.trend === 'flat' && (
                  <span className="font-mono font-bold text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-md">
                    — Mantiene precio
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculadora de Llenado ───────────────────────────────────────── */}
      <section id="calculadora" className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623] flex items-center justify-center text-[#0A0F1E] shadow-md">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight">
                Calculadora de Combustible
              </h3>
              <p className="text-xs text-gray-400">
                Calcula cuánto te costará llenar tu tanque según el combustible
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Selecciona el combustible</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fuelData.fuels.slice(0, 6).map((fuel) => (
                <button
                  key={fuel.id}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    selectedFuel.id === fuel.id
                      ? 'bg-[#F5A623] border-[#F5A623] text-[#0A0F1E] shadow-md'
                      : 'bg-[#1C2542] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <span className="block truncate">{fuel.shortName}</span>
                  <span className="font-mono text-[11px] opacity-80">RD${fuel.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
              <span>Cantidad de galones:</span>
              <span className="text-[#F5A623] font-mono text-sm font-black">{gallons} galones</span>
            </div>
            <input
              type="range"
              min={1}
              max={35}
              value={gallons}
              onChange={(e) => setGallons(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>1 gal</span>
              <span>10 gal (Carro)</span>
              <span>18 gal (SUV)</span>
              <span>35 gal (Camioneta)</span>
            </div>
          </div>

          <div className="bg-[#1C2542] border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total a pagar</span>
              <span className="text-xs text-gray-300">{gallons} galones de {selectedFuel.name}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#F5A623]">
                RD$ {calculatedTotal}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Historial de Precios ─────────────────────────────────────────── */}
      <section id="historial" className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">
              Historial de precios
            </h3>
            <div className="flex gap-1.5 text-xs font-mono">
              <span className="bg-[#1C2542] text-gray-300 px-2.5 py-1 rounded-md">Últimas 4 semanas</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                  <th className="pb-2.5 font-bold">Semana</th>
                  <th className="pb-2.5 font-bold">G. Premium</th>
                  <th className="pb-2.5 font-bold">G. Regular</th>
                  <th className="pb-2.5 font-bold">Gasoil Ópt.</th>
                  <th className="pb-2.5 font-bold">GLP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fuelData.history.map((h, i) => (
                  <tr key={h.week} className={i === fuelData.history.length - 1 ? 'text-white font-bold bg-white/5' : 'text-gray-300'}>
                    <td className="py-2.5">{h.week}</td>
                    <td className="py-2.5">RD$ {h.premium.toFixed(2)}</td>
                    <td className="py-2.5">RD$ {h.regular.toFixed(2)}</td>
                    <td className="py-2.5">RD$ {h.gasoilOptimo.toFixed(2)}</td>
                    <td className="py-2.5">RD$ {h.glp.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Widget Promo Section (Idéntico a combustiblerd.noticias.com.do) ─ */}
      <section id="widget" className="container mx-auto px-4 pb-16 max-w-4xl">
        <div className="bg-[#1C2542] border border-[#F5A623]/25 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              <span>📦</span> Embebe los precios en tu sitio web
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Copia este código HTML y pégalo donde quieras mostrar los precios actualizados automáticamente.
            </p>
          </div>

          <div className="bg-[#0A0F1E] border border-white/15 rounded-xl p-3.5 font-mono text-xs text-[#F5A623] break-all select-all">
            <code>{embedCode}</code>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={handleCopy}
              className="bg-[#F5A623] hover:bg-[#d98e18] text-[#0A0F1E] font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedCode ? '¡Código Copiado!' : 'Copiar código'}</span>
            </button>

            <a
              href="/widget.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1"
            >
              <span>Ver Widget (.php) en vivo</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[11px] text-gray-400">
              Parámetros opcionales: <code className="text-[#F5A623]">?theme=light</code> para tema claro, <code className="text-[#F5A623]">?compact=1</code> para versión compacta.
            </p>
          </div>

          {/* Vista Previa */}
          <div className="pt-4 flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Vista Previa del Widget</span>
            <div className="w-[340px] h-[420px] rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-[#111827]">
              <iframe
                src="/widget.php"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Vista Previa Widget CombustibleRD"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-500 font-mono space-y-2">
        <p>© {new Date().getFullYear()} CombustibleRD · Montecristi.net. Todos los derechos reservados.</p>
        <p className="space-x-3">
          <Link href="/terminos" className="hover:text-gray-300">Términos y Condiciones</Link>
          <span>·</span>
          <Link href="/politica-de-privacidad" className="hover:text-gray-300">Privacidad</Link>
          <span>·</span>
          <a href="https://combustibles.micm.gob.do/" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline">MICM Oficial</a>
        </p>
      </footer>

    </div>
  );
}
