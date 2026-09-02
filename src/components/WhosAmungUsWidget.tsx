'use client';

import React, { useEffect, useRef } from 'react';

interface WhosAmungUsWidgetProps {
  siteKey?: string;
  widgetId?: string;
  type?: 'small' | 'classic' | 'micro';
  className?: string;
}

export function WhosAmungUsWidget({
  siteKey = 'uwed10c87e',
  widgetId = 'h2h',
  type = 'small',
  className = '',
}: WhosAmungUsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Configurar objeto global _wau
    (window as any)._wau = (window as any)._wau || [];
    (window as any)._wau.push([type, siteKey, widgetId]);

    // Inyectar script de waust.at si aún no existe
    const scriptId = `wau-script-${siteKey}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://waust.at/s.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [siteKey, widgetId, type]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Contenedor oficial donde whos.amung.us inyecta el widget */}
      <div ref={containerRef} id={`_wau${widgetId}`} className="min-h-[20px] flex items-center justify-center">
        {/* Enlace e Imagen Fallback para renderizado instantáneo */}
        <a
          href={`https://whos.amung.us/stats/${siteKey}/`}
          target="_blank"
          rel="noopener noreferrer"
          title="Usuarios en línea - whos.amung.us"
          className="opacity-90 hover:opacity-100 transition-opacity flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://whos.amung.us/cwidget/${siteKey}/000000ffffff.png`}
            alt="Contador de visitas en línea"
            width={81}
            height={20}
            className="h-5 w-auto object-contain"
          />
        </a>
      </div>
    </div>
  );
}
