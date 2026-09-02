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
    <div className={`inline-flex items-center justify-center min-h-[22px] ${className}`}>
      {/* Script oficial que inyecta un único widget de whos.amung.us */}
      <Script id={`_wau${widgetId}`} strategy="afterInteractive">
        {`var _wau = _wau || []; _wau.push(["small", "${siteKey}", "${widgetId}"]);`}
      </Script>
      <Script
        id={`wau-script-${siteKey}`}
        src="https://waust.at/s.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
