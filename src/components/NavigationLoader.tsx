'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FullPageSkeleton } from './FullPageSkeleton';

function LoaderEvents({ setIsLoading }: { setIsLoading: (val: boolean) => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Cuando la URL cambia (pathname o params), el contenido ya llegó o está llegando vía streaming
        // Cerramos el overlay instantáneo para dejar que actúe el loading.tsx nativo o se vea el contenido.
        setIsLoading(false);
    }, [pathname, searchParams, setIsLoading]);

    return null;
}

export function NavigationLoader() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            // 1. Encontrar el elemento <a> más cercano al clic
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            // 2. Filtrar clics que no sean navegaciones reales o sean externas
            if (
                !anchor ||
                !anchor.href ||
                anchor.target === '_blank' ||
                e.ctrlKey ||
                e.metaKey ||
                e.shiftKey ||
                e.button === 1
            ) {
                return;
            }

            try {
                const url = new URL(anchor.href);
                const isInternal = url.origin === window.location.origin;

                // No mostrar si es el mismo enlace (anclas # o misma URL exacta)
                const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;

                // Si es interno y es una página diferente, mostramos el esqueleto INSTANTÁNEAMENTE
                if (isInternal && !isSamePage) {
                    setIsLoading(true);
                }
            } catch (err) {
                // Enlace inválido, ignorar
            }
        };

        window.addEventListener('click', handleAnchorClick, { capture: true });
        return () => window.removeEventListener('click', handleAnchorClick, { capture: true });
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <LoaderEvents setIsLoading={setIsLoading} />
            </Suspense>

            {isLoading && (
                <div className="fixed inset-0 z-[9999] bg-white/20 backdrop-blur-[2px] pointer-events-none animate-in fade-in duration-300">
                    {/* Barra de progreso superior decorativa */}
                    <div className="absolute top-0 left-0 right-0 h-1 z-[10000] overflow-hidden">
                        <div className="h-full bg-brand-light animate-progress-fast shadow-[0_0_15px_rgba(191,27,35,0.75)]"></div>
                    </div>
                </div>
            )}
        </>
    );
}
