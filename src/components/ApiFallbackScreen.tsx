'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  Fuel, 
  BookOpen, 
  Radio, 
  Newspaper, 
  ArrowRight,
  Send,
  Clock,
  PhoneCall
} from 'lucide-react';
import { siteConfig } from '@/config/site';

interface ApiFallbackScreenProps {
  categoryName?: string;
  onRetry?: () => void;
  message?: string;
  isCompact?: boolean;
}

export function ApiFallbackScreen({
  categoryName,
  onRetry,
  message,
  isCompact = false,
}: ApiFallbackScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(25);
  const [autoRetry, setAutoRetry] = useState(true);

  // Auto retry countdown
  useEffect(() => {
    if (!autoRetry || isRetrying) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRetry();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRetry, isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
      setTimeout(() => setIsRetrying(false), 1500);
    } else {
      window.location.reload();
    }
  };

  const editorialSections = [
    {
      eyebrow: "Edición Digital",
      title: "Edición Impresa",
      desc: "Lee la versión completa maquetada del periódico en formato interactivo.",
      href: "/edicion-impresa",
      icon: Newspaper,
      badge: "Disponible",
    },
    {
      eyebrow: "Economía & Finanzas",
      title: "Combustibles en RD",
      desc: "Calculadora de precios, subsidios y variaciones oficiales de la semana.",
      href: "/combustibles",
      icon: Fuel,
      badge: "Oficial",
    },
    {
      eyebrow: "Guía Turística",
      title: "Montecristi por Dentro",
      desc: "Lugares, rutas, hoteles y patrimonio histórico de nuestra provincia.",
      href: "/montecristi-por-dentro",
      icon: BookOpen,
      badge: "Local",
    },
    {
      eyebrow: "Señal Digital",
      title: "Emisión En Vivo",
      desc: "Sigue la transmisión en directo y programas especiales de noticias.",
      href: "/en-vivo",
      icon: Radio,
      badge: "En Vivo",
    },
  ];

  if (isCompact) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-8 sm:p-12 text-center shadow-sm my-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#BF1B23] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#BF1B23] animate-ping" />
          Mesa de Redacción
        </div>
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 mb-3 font-[family-name:var(--font-outfit)]">
          {categoryName ? `Actualizando sección: ${categoryName}` : 'Sincronizando flujo de noticias'}
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed mb-6 font-normal">
          {message || 'Estamos restableciendo el enlace con el servidor de contenidos. Por favor, reintenta en breve.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#BF1B23] hover:bg-[#8A1017] text-white font-black text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Sincronizando...' : 'Reintentar ahora'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-[70vh] py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ── Banner Principal de Estado Editorial ────────────────────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-sm p-8 sm:p-14 shadow-sm relative overflow-hidden mb-12">
          {/* Top red accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#042564] via-[#BF1B23] to-[#8A1017]" />

          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BF1B23] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#BF1B23]">
                Mesa de Redacción · Actualización en Tiempo Real
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.05] mb-5 font-[family-name:var(--font-serif)]">
              {categoryName 
                ? `Actualizando las noticias de ${categoryName}` 
                : 'Estamos sincronizando el servidor de artículos'}
            </h1>

            {/* Lead text */}
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed mb-8 max-w-2xl">
              {message || (
                <>
                  La plataforma está renovando la conexión con la base de datos de publicaciones. 
                  En unos segundos se restablecerá la portada de <strong>{siteConfig.name}</strong> con los últimos sucesos de la República Dominicana.
                </>
              )}
            </p>

            {/* Action buttons & status */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#BF1B23] hover:bg-[#8A1017] text-white font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-md active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Reconectando...' : 'Reconectar ahora'}
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100/80 px-4 py-3 rounded-sm border border-gray-200">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Reintento automático en <strong className="text-gray-900 font-bold">{countdown}s</strong>
                </span>
                <button
                  onClick={() => setAutoRetry(!autoRetry)}
                  className="ml-2 text-[10px] uppercase font-black text-[#BF1B23] hover:underline cursor-pointer"
                >
                  {autoRetry ? 'Pausar' : 'Activar'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Secciones Disponibles del Periódico ─────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2.5 h-7 bg-[#BF1B23] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 font-[family-name:var(--font-outfit)]">
              Secciones del periódico disponibles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorialSections.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white border border-gray-200/90 rounded-sm p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23]">
                        {item.eyebrow}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#042564] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        {item.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-sm bg-gray-100 text-gray-800 flex items-center justify-center group-hover:bg-[#BF1B23] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-[#BF1B23] transition-colors leading-tight">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#042564] group-hover:text-[#BF1B23] transition-colors">
                    <span>Acceder</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Bloque Informativo de Redacción y Contacto ─────────────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-[#BF1B23]/10 text-[#BF1B23] flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23] block mb-1">
                Línea Directa de Información
              </span>
              <h3 className="text-base font-bold text-gray-900">
                ¿Deseas enviar una nota de prensa, denuncia o pauta comercial?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Nuestro equipo de redacción se encuentra disponible para atención inmediata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#042564] hover:bg-[#031934] text-white font-black text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm w-full md:w-auto"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp Directo
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs uppercase tracking-wider rounded-sm transition-colors w-full md:w-auto"
            >
              Contacto
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
