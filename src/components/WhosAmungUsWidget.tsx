'use client';

import React from 'react';
import Script from 'next/script';

interface WhosAmungUsWidgetProps {
  siteKey?: string;
  widgetId?: string;
  type?: string;
  className?: string;
}

export function WhosAmungUsWidget({
  siteKey = 'uwed10c87e',
  widgetId = 'h2h',
  type = 'small',
  className = '',
}: WhosAmungUsWidgetProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2.5 bg-black/60 border border-white/15 px-3 py-1.5 rounded-lg hover:border-[#BF1B23]/60 transition-colors shadow-sm">
        <a
          href={`https://whos.amung.us/stats/${siteKey}/`}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver visitantes en línea en Montecristi.net"
          className="flex items-center gap-2 group cursor-pointer"
        >
          {/* Indicador pulsante en vivo */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
          </span>

          {/* Contador en Vivo de whos.amung.us */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://whos.amung.us/swidget/${siteKey}.png`}
            alt="Usuarios en línea - whos.amung.us"
            width={80}
            height={15}
            className="h-4 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </a>

        {/* Script oficial de registro de whos.amung.us */}
        <Script id={`_wau${widgetId}`} strategy="afterInteractive">
          {`var _wau = _wau || []; _wau.push(["small", "${siteKey}", "${widgetId}"]);`}
        </Script>
        <Script
          id={`wau-script-${siteKey}`}
          src="https://waust.at/s.js"
          strategy="afterInteractive"
        />
      </div>
    </div>
  );
}
