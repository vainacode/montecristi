// loading.tsx — Esqueleto de carga hiperrealista para páginas de artículos.
// Replica con precisión quirúrgica el diseño editorial del periódico Montecristi.

function Shimmer({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`sk-shimmer rounded-md ${className}`} style={style} />;
}

export default function ArticleLoading() {
  return (
    <article className="bg-white min-h-screen text-zinc-900 selection:bg-brand-light/30 pb-20 animate-fade-in-up">
      {/* 1. Header del Artículo */}
      <div className="bg-zinc-50 border-b border-gray-100 py-10 md:py-16 mb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Columna Izquierda: Categoría, Título, Anuncio, Autor */}
            <div className="lg:col-span-7 space-y-6">
              {/* Categoría & Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <Shimmer className="h-6 w-28 !bg-[#BF1B23]/20 rounded-full" />
                <Shimmer className="h-5 w-20 opacity-60 rounded-full" />
                <Shimmer className="h-5 w-24 opacity-60 rounded-full" />
              </div>

              {/* Título Principal Editorial */}
              <div className="space-y-3 pt-2">
                <Shimmer className="h-10 md:h-12 w-full" />
                <Shimmer className="h-10 md:h-12 w-[92%]" />
                <Shimmer className="h-10 md:h-12 w-[65%]" />
              </div>

              {/* Anuncio Top */}
              <div className="pt-2">
                <Shimmer className="h-16 w-full opacity-40 border border-dashed border-gray-200" />
              </div>

              {/* Barra de Autor y Fecha */}
              <div className="flex items-center gap-6 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full sk-shimmer shrink-0" />
                  <Shimmer className="h-4 w-36" />
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <Shimmer className="h-4 w-28 opacity-60" />
              </div>
            </div>

            {/* Columna Derecha: Imagen Destacada 4:3 */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 sk-shimmer" />
            </div>

          </div>
        </div>
      </div>

      {/* 2. Cuerpo del Artículo y Barra Lateral */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Columna de Contenido Principal (8 Cols) */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Botones de Compartir */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pb-6 border-b border-gray-100">
              <Shimmer className="h-3 w-16 opacity-50 shrink-0" />
              <Shimmer className="h-8 w-24 rounded-lg shrink-0" />
              <Shimmer className="h-8 w-24 rounded-lg shrink-0" />
              <Shimmer className="h-8 w-24 rounded-lg shrink-0" />
            </div>

            {/* Banner Anuncio In-Content */}
            <Shimmer className="h-24 w-full opacity-50 border border-gray-200/60" />

            {/* Párrafos Editoriales */}
            <div className="space-y-6 pt-4">
              {/* Párrafo 1 */}
              <div className="space-y-3">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-[98%]" />
                <Shimmer className="h-4 w-[94%]" />
                <Shimmer className="h-4 w-[60%]" />
              </div>

              {/* Párrafo 2 */}
              <div className="space-y-3">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-[96%]" />
                <Shimmer className="h-4 w-[90%]" />
                <Shimmer className="h-4 w-[75%]" />
              </div>

              {/* Cita Destacada (Blockquote) */}
              <div className="border-l-4 border-[#BF1B23] bg-zinc-50 p-6 rounded-r-xl space-y-3 my-8">
                <Shimmer className="h-5 w-[90%]" />
                <Shimmer className="h-5 w-[70%]" />
              </div>

              {/* Párrafo 3 */}
              <div className="space-y-3">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-[95%]" />
                <Shimmer className="h-4 w-[91%]" />
                <Shimmer className="h-4 w-[50%]" />
              </div>

              {/* Imagen secundaria en artículo */}
              <Shimmer className="h-72 w-full rounded-2xl my-10 shadow-sm" />

              {/* Párrafo 4 */}
              <div className="space-y-3">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-[97%]" />
                <Shimmer className="h-4 w-[85%]" />
              </div>
            </div>

            {/* Noticias Relacionadas */}
            <div className="mt-16 pt-10 border-t border-gray-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-[#BF1B23] rounded-full" />
                <Shimmer className="h-6 w-48" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden space-y-4 p-4">
                    <Shimmer className="aspect-video w-full rounded-lg" />
                    <Shimmer className="h-3 w-20 !bg-[#BF1B23]/20" />
                    <Shimmer className="h-5 w-full" />
                    <Shimmer className="h-5 w-3/4" />
                  </div>
                ))}
              </div>
            </div>

          </main>

          {/* Barra Lateral (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              
              {/* Más Leídas Widget Skeleton */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#042564]" />
                    <Shimmer className="h-4 w-28" />
                  </div>
                  <Shimmer className="h-3 w-16 opacity-40" />
                </div>

                <div className="space-y-5">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex gap-4 items-start py-2 border-b border-gray-50 last:border-0">
                      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400 shrink-0">
                        {rank}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Shimmer className="h-3.5 w-full" />
                        <Shimmer className="h-3.5 w-4/5" />
                        <Shimmer className="h-2.5 w-16 opacity-40 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anuncio 300x250 Skeleton */}
              <div className="border border-gray-200/70 rounded-xl p-4 flex flex-col items-center bg-gray-50/50">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">PUBLICIDAD</span>
                <Shimmer className="w-[300px] h-[250px] max-w-full rounded-md" />
              </div>

            </div>
          </aside>

        </div>
      </div>
    </article>
  );
}
