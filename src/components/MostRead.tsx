import type { WPPost } from '@/lib/wp';
import { getFeaturedImage, getCategorySlug, getCategoryNames } from '@/lib/wp';
import Image from 'next/image';
import Link from 'next/link';

interface MostReadProps {
  posts: WPPost[];
}

const rankColors = [
  'bg-[#BF1B23]',         // #1
  'bg-[#042564]',         // #2
  'bg-[#042564]',         // #3
  'bg-zinc-600',          // #4
  'bg-zinc-600',          // #5
];

export function MostRead({ posts }: MostReadProps) {
  if (!posts.length) return null;

  return (
    <div className="w-full min-w-0 bg-white border border-gray-100 shadow-xl overflow-hidden rounded-sm">
      {/* Header with #042564 */}
      <div className="bg-[#042564] px-4 sm:px-6 py-4 flex items-center gap-2 sm:gap-3 min-w-0">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-[#BF1B23] shrink-0">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
            fill="currentColor" />
        </svg>
        <h3 className="min-w-0 truncate text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] sm:tracking-[0.3em] text-white">
          Las Más Leídas
        </h3>
        <span className="ml-auto shrink-0 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.08em] sm:tracking-widest text-white/80 border border-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
          7 días
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {posts.map((post, index) => {
          const categorySlug = getCategorySlug(post);
          const categoryNames = getCategoryNames(post);
          const imgUrl = getFeaturedImage(post) || "/logo.svg";
          const isTop = index === 0;

          return (
            <Link
              key={post.id}
              href={`/${categorySlug}/${post.slug}`}
              prefetch={false}
              className={`group flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 min-w-0 hover:bg-zinc-50 transition-colors duration-200 ${isTop ? 'bg-zinc-50/60' : ''}`}
            >
              {/* Rank badge */}
              <div className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[11px] font-black ${rankColors[index]} mt-0.5 shadow-sm`}>
                {index + 1}
              </div>

              {/* Thumbnail */}
              <div className={`relative shrink-0 overflow-hidden bg-gray-100 rounded-sm ${isTop ? 'w-16 h-12 sm:w-20 sm:h-14' : 'w-14 h-10 sm:w-16 sm:h-11'}`}>
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {isTop && (
                  <div className="absolute top-0.5 left-0.5 bg-[#BF1B23] text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 leading-none">
                    #1
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {categoryNames[0] && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#BF1B23] block mb-1">
                    {categoryNames[0]}
                  </span>
                )}
                <h4
                  className={`font-bold leading-snug text-gray-900 group-hover:text-[#BF1B23] transition-colors line-clamp-3 sm:line-clamp-2 ${isTop ? 'text-[12px] sm:text-[13px]' : 'text-[11px] sm:text-[12px]'}`}
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 sm:px-6 py-3 bg-zinc-50">
        <Link
          href="/"
          className="text-[10px] font-black uppercase tracking-widest text-[#031934] hover:text-[#BF1B23] transition-colors flex items-center gap-1.5"
        >
          Ver todas las noticias
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
