'use client';

import React from 'react';
import Script from 'next/script';

interface WhosAmungUsWidgetProps {
  siteKey?: string;
  widgetId?: string;
  className?: string;
}

export function WhosAmungUsWidget({
  siteKey = 'uwed10c87e',
  widgetId = 'h2h',
  className = '',
}: WhosAmungUsWidgetProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <a
        href={`https://whos.amung.us/stats/${siteKey}/`}
        target="_blank"
        rel="noopener noreferrer"
        title="Usuarios en línea - whos.amung.us"
        className="inline-flex items-center hover:opacity-100 opacity-90 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://whos.amung.us/swidget/${siteKey}.png`}
          alt="Usuarios en línea"
          width={80}
          height={15}
          className="h-[15px] w-auto object-contain"
        />
      </a>

      {/* Script en segundo plano para sincronizar analíticas activas */}
      <Script id={`_wau${widgetId}`} strategy="lazyOnload">
        {`var _wau = _wau || []; _wau.push(["small", "${siteKey}", "${widgetId}"]);`}
      </Script>
      <Script
        id={`wau-script-${siteKey}`}
        src="https://waust.at/s.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
