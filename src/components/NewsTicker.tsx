'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WPPost, getCategorySlug } from '@/lib/wp';

interface NewsTickerProps {
  posts?: WPPost[];
}

export function NewsTicker({ posts: initialPosts = [] }: NewsTickerProps) {
  const [posts, setPosts] = useState<WPPost[]>(initialPosts);
  const [isScrolled, setIsScrolled] = useState(false);

  // El ticker no debe bloquear el HTML del layout. Se carga después de pintar
  // la página y aprovecha la respuesta cacheada de la API interna.
  useEffect(() => {
    if (posts.length > 0) return;
    const controller = new AbortController();
    fetch('/api/posts?per_page=8', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data: WPPost[]) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [posts.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <div className={`hidden md:flex w-full fixed z-40 transition-all duration-300 ${isScrolled ? 'top-16' : 'top-24'
      } bg-brand-dark text-white h-12 items-center shadow-lg overflow-hidden border-b-4 border-brand-light`}>
      <div className="bg-[#042564] text-white h-full flex items-center px-6 gap-3 shrink-0 border-r border-white/15">
        <div className="w-2 h-2 bg-[#042564] rounded-full animate-pulse shadow-[0_0_10px_rgba(4,37,100,0.9)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-white">Último Minuto</span>
      </div>

      <div className="flex-grow overflow-hidden relative group">
        <div className="flex whitespace-nowrap animate-marquee-fast group-hover:[animation-play-state:paused]">
          {posts.map((post) => {
            const catSlug = getCategorySlug(post);
            return (
              <Link
                key={post.id}
                href={`/${catSlug}/${post.slug}`}
                prefetch={false}
                className="px-8 text-[10px] font-bold text-white uppercase tracking-widest hover:text-[#042564] transition-colors flex items-center gap-4 border-r border-white/10 h-12"
              >
                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            );
          })}
          {/* Loop Duplicate */}
          {posts.map((post) => {
            const catSlug = getCategorySlug(post);
            return (
              <Link
                key={`dup-${post.id}`}
                href={`/${catSlug}/${post.slug}`}
                prefetch={false}
                className="px-8 text-[10px] font-bold text-white uppercase tracking-widest hover:text-[#042564] transition-colors flex items-center gap-4 border-r border-white/10 h-12"
              >
                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
