'use client';

import { useEffect } from 'react';

/**
 * ExternalLinkManager
 * Intercepta clics en enlaces globales para asegurar que los enlaces externos
 * (que no pertenecen al dominio de Montecristi) se abran en una nueva pestaña.
 */
export function ExternalLinkManager() {
    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (!anchor || !anchor.href) return;

            // Verificar si el enlace es externo
            const isExternal =
                anchor.href.startsWith('http') &&
                !anchor.href.includes(window.location.hostname);

            if (isExternal) {
                // Aseguramos que se abra en nueva pestaña
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

    return null; // Este componente no renderiza nada visualmente
}
