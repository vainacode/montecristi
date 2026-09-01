// loading.tsx — Esqueleto hiperrealista para páginas de categorías.

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`sk-shimmer rounded-md ${className}`} />;
}

export default function CategoryLoading() {
  return (
    <div className="bg-zinc-50 min-h-screen animate-fade-in-up pb-20">
      
      {/* 1. Category Hero Skeleton */}
      <div className="relative min-h-[420px] flex items-end overflow-hidden bg-[#031934] text-white">
        <div className="absolute inset-0 sk-shimmer-dark opacity-30" />
        <div className="relative z-10 w-full px-6 md:px-12 pb-16 pt-24 space-y-5">
          <Shimmer className="h-4 w-28 !bg-white/20 rounded-full" />
          <div className="space-y-3">
            <Shimmer className="h-14 md:h-20 w-3/4 max-w-xl !bg-white/30 rounded-lg" />
          </div>
          <div className="max-w-lg border-l-2 pl-6 border-[#BF1B23]">
            <Shimmer className="h-4 w-full !bg-white/20" />
            <Shimmer className="h-4 w-4/5 mt-2 !bg-white/20" />
          </div>
        </div>
      </div>

      {/* 2. Top Leaderboard Ad */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="w-full max-w-[970px] h-[90px] sk-shimmer rounded-md opacity-40 border border-gray-200" />
        </div>
      </div>

      {/* 3. Grid y Barra Lateral */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <main className="lg:col-span-9 space-y-10">
            {/* Hero Card Skeleton */}
            <div className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="md:w-1/2 aspect-video md:aspect-auto sk-shimmer" />
              <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center space-y-4">
                <Shimmer className="h-3.5 w-24 !bg-[#BF1B23]/20" />
                <Shimmer className="h-7 w-full" />
                <Shimmer className="h-7 w-4/5" />
                <div className="space-y-2 pt-2">
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-5/6" />
                </div>
              </div>
            </div>

            {/* Header de sección */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-2 h-7 bg-[#042564] rounded-full" />
              <Shimmer className="h-6 w-56" />
            </div>

            {/* Grid de Noticias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col space-y-4 p-4">
                  <Shimmer className="aspect-video w-full rounded-lg" />
                  <Shimmer className="h-3 w-20 !bg-[#BF1B23]/20" />
                  <div className="space-y-2 flex-1">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                <Shimmer className="h-4 w-32 mb-4" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-6 h-6 rounded bg-gray-100 font-bold text-xs text-gray-400 flex items-center justify-center shrink-0">
                      {i}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Shimmer className="h-3 w-full" />
                      <Shimmer className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200/70 rounded-xl p-4 flex flex-col items-center bg-gray-50/50">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">PUBLICIDAD</span>
                <Shimmer className="w-[300px] h-[250px] max-w-full rounded-md" />
              </div>
            </div>
          </aside>

        </div>
      </div>

    </div>
  );
}
