import Script from 'next/script';

interface WhosAmungUsWidgetProps {
  siteKey?: string;
  widgetId?: string;
  className?: string;
}

/**
 * Contador de whos.amung.us dentro del footer.
 *
 * El script de amung (s.js) dibuja el contador junto a la etiqueta
 * <script id="_wau{widgetId}">. Antes esa etiqueta la insertaba next/script al final
 * del <body>, así que salía un segundo contador abajo de todo además de la imagen
 * del footer. Ahora la etiqueta se renderiza aquí, en su lugar, y es el único contador.
 */
export function WhosAmungUsWidget({
  siteKey = 'uwed10c87e',
  widgetId = 'h2h',
  className = '',
}: WhosAmungUsWidgetProps) {
  return (
    <div className={`inline-flex min-h-[15px] items-center justify-center ${className}`}>
      <script
        id={`_wau${widgetId}`}
        dangerouslySetInnerHTML={{
          __html: `var _wau = _wau || []; _wau.push(["small", "${siteKey}", "${widgetId}"]);`,
        }}
      />
      <Script id={`wau-script-${siteKey}`} src="https://waust.at/s.js" strategy="lazyOnload" />
    </div>
  );
}
