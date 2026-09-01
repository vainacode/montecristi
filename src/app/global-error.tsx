'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center bg-zinc-800 p-8 rounded-2xl border border-zinc-700 shadow-2xl">
          <div className="w-16 h-16 bg-red-900/40 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error del Sistema</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Ha ocurrido un problema inesperado. Nuestro equipo técnico ha sido notificado.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#BF1B23] hover:bg-[#8A1017] text-white font-bold text-sm rounded-xl transition-all shadow-md"
          >
            Reintentar carga
          </button>
        </div>
      </body>
    </html>
  );
}
