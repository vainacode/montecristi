'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Script from 'next/script';
import { siteConfig } from '@/config/site';

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Componente interno que rastrea cambios de ruta (SPA navigation)
function GAPageTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined' || !window.gtag) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', measurementId, { page_path: url });
  }, [pathname, searchParams, measurementId]);

  return null;
}

// Componente principal — incluir en layout.tsx dentro de <Suspense>
export function GoogleAnalytics() {
  const { measurementId } = siteConfig.googleAnalytics;

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: false  // GAPageTracker maneja todos los pageviews (evita duplicados)
          });
        `}
      </Script>
      <GAPageTracker measurementId={measurementId} />
    </>
  );
}
