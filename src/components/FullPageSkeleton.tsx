// src/components/FullPageSkeleton.tsx
import React from 'react';

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`sk-shimmer rounded-md ${className}`} />;
}

function SkeletonHeroCard() {
  return (
    <div className="flex flex-col md:flex-row-reverse bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm w-full">
      <div className="md:w-1/2 aspect-video md:aspect-auto sk-shimmer" />
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-4">
        <Shimmer className="h-3.5 w-24 !bg-[#BF1B23]/20" />
        <div className="space-y-2.5">
          <Shimmer className="h-8 w-full" />
          <Shimmer className="h-8 w-4/5" />
        </div>
        <div className="space-y-2 pt-2">
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-5/6" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGridCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col w-full p-4 space-y-4">
      <div className={`sk-shimmer rounded-lg ${tall ? "h-52" : "aspect-video"}`} />
      <Shimmer className="h-3 w-20 !bg-[#BF1B23]/20" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-5 w-full" />
        <Shimmer className="h-5 w-4/5" />
      </div>
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-[#042564] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col items-center gap-3 pb-2">
          <Shimmer className="h-4 w-24 !bg-[#BF1B23]/40 rounded-full" />
          <Shimmer className="h-3 w-36 !bg-white/20" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-xl bg-white/5 sk-shimmer-dark" />
        ))}
      </div>
      <div className="border border-gray-200/70 rounded-xl p-4 flex flex-col items-center bg-gray-50/50">
        <Shimmer className="w-[300px] h-[250px] max-w-full rounded-md" />
      </div>
    </div>
  );
}

function SkeletonFeedSidebar() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#042564]" />
          <Shimmer className="h-4 w-32" />
        </div>
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
        <Shimmer className="w-[300px] h-[250px] max-w-full rounded-md" />
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="bg-zinc-50 min-h-screen w-full animate-fade-in-up pb-16">
      {/* Top Leaderboard Ad */}
      <div className="container mx-auto px-4 pt-4 mb-8 flex justify-center">
        <div className="w-full max-w-[970px] h-[90px] sk-shimmer rounded-md opacity-40 border border-gray-200" />
      </div>

      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 space-y-10">
            <SkeletonHeroCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <SkeletonGridCard tall />
              <SkeletonGridCard tall />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <SkeletonGridCard />
              <SkeletonGridCard />
              <SkeletonGridCard />
            </div>
          </div>
          <aside className="lg:col-span-3">
            <div className="sticky top-32">
              <SkeletonSidebar />
            </div>
          </aside>
        </div>
      </section>

      {/* Mid Leaderboard Ad */}
      <div className="container mx-auto px-4 mb-16 flex justify-center">
        <div className="w-full max-w-[970px] h-[90px] sk-shimmer rounded-md opacity-40 border border-gray-200" />
      </div>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-3 h-10 bg-[#031934] rounded-full" />
              <Shimmer className="h-7 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonGridCard key={i} />
              ))}
            </div>
          </div>
          <aside className="lg:col-span-3">
            <div className="sticky top-32">
              <SkeletonFeedSidebar />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
