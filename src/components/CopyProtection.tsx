'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

/**
 * Sistema de Protección Editorial y Anti-Extracción de Datos:
 * 1. Atribución forzada de derechos de autor y enlace canónico al copiar.
 * 2. Protección contra clickjacking y embebido no autorizado en iframes.
 * 3. Detección y disuasión de scraping automatizado y atajos de inspección.
 */
export function CopyProtection() {
  useEffect(() => {
    // 1. Anti-Clickjacking: evita que terceros embeban el sitio en iframes ocultos
    if (window.top && window.top !== window.self) {
      try {
        window.top.location.href = window.self.location.href;
      } catch {
        // Cross-origin restriction will block iframe execution
      }
    }

    // 2. Atribución de Derechos de Autor en Portapapeles (Anti-Plagio)
    const MIN_CHARS = 35;
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length < MIN_CHARS) return;

      const pageUrl = window.location.href;
      const siteName = siteConfig.name;

      const plain = `${selectedText}\n\n— Contenido protegido. Leer completo en: ${siteName} (${pageUrl})\n© Todos los derechos reservados.`;
      const html = `${selectedText}<br><br><small>— Contenido protegido. Leer completo en: <a href="${pageUrl}" rel="noopener">${siteName}</a> · <a href="${siteConfig.url}">${siteConfig.url}</a><br>© Todos los derechos reservados.</small>`;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plain);
        e.clipboardData.setData('text/html', html);
        e.preventDefault();
      }
    };

    // 3. Disuasión de atajos de descarga de código fuente
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+U (Ver código fuente)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
      // Bloquear Ctrl+S (Guardar página completa)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
