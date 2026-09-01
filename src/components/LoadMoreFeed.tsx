'use client';

import { useState } from 'react';
import type { WPPost } from '@/lib/wp';
import { NewsCard } from '@/components/NewsCard';
import { ArrowDown, Loader2, CheckCircle2 } from 'lucide-react';

interface LoadMoreFeedProps {
  initialPosts: WPPost[];
  /** WP offset after initial server-rendered posts */
  initialOffset: number;
  /** Optional: restrict to a category ID */
  categoryId?: number;
  /** Posts per page for each "load more" request */
  perPage?: number;
}

export function LoadMoreFeed({
  initialPosts,
  initialOffset,
  categoryId,
  perPage = 18,
}: LoadMoreFeedProps) {
  const [posts, setPosts] = useState<WPPost[]>(initialPosts);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        offset: String(offset),
        per_page: String(perPage),
      });
      if (categoryId) params.set('category', String(categoryId));

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        setHasMore(false);
        return;
      }
      const json: unknown = await res.json();
      const newPosts: WPPost[] = Array.isArray(json) ? json : [];

      if (!newPosts.length || newPosts.length < perPage) {
        setHasMore(false);
      }

      if (newPosts.length > 0) {
        setPosts((prev) => {
          // Deduplicate by id
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...newPosts.filter((p) => !ids.has(p.id))];
        });
        setOffset((o) => o + newPosts.length);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* News grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} variant="grid" />
        ))}
      </div>

      {/* Load more / end indicator */}
      <div className="flex justify-center mt-12 mb-4">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="group relative flex items-center gap-3 bg-brand-dark text-white font-black text-[11px] uppercase tracking-[0.25em] px-10 py-4 overflow-hidden transition-all duration-300 hover:bg-brand-light hover:text-white disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(138,16,23,0.25)] hover:shadow-[0_4px_24px_rgba(191,27,35,0.4)]"
          >
            {/* Shine sweep on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Cargando noticias...</span>
              </>
            ) : (
              <>
                <span>Cargar más noticias</span>
                <ArrowDown size={15} className="group-hover:translate-y-1 transition-transform duration-300" />
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 text-[11px] font-black uppercase tracking-widest py-4">
            <CheckCircle2 size={16} className="text-brand-light" />
            <span>Has visto todas las noticias disponibles</span>
          </div>
        )}
      </div>
    </div>
  );
}
