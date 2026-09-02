import { getPosts, getMontecristiPosts, getFeaturedImage, getCategorySlug } from "@/lib/wp";
import { getMostReadPosts } from "@/lib/analytics";
import { NewsCard } from "@/components/NewsCard";
import { CustomAd } from "@/components/CustomAd";
import { LoadMoreFeed } from "@/components/LoadMoreFeed";
import { MostRead } from "@/components/MostRead";
import { FuelWidget } from "@/components/FuelWidget";
import { MontecristiSpotlight } from "@/components/MontecristiSpotlight";
import { MontecristiVideoSection } from "@/components/MontecristiVideoSection";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from 'react';
import HomeLoading from './loading';
import { ApiFallbackScreen } from "@/components/ApiFallbackScreen";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      "es-DO": "/",
    },
  },
};

export const revalidate = 30;

const IconFacebook = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>;
const IconInstagram = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" /></svg>;
const IconYouTube = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;

export default async function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // Peticiones en paralelo: artículos generales + artículos dedicados de Montecristi
  const [allPosts, montecristiPosts] = await Promise.all([
    getPosts({ per_page: 24 }),
    getMontecristiPosts({ per_page: 4 })
  ]).catch(() => [[], []]);

  if (!allPosts || allPosts.length === 0) {
    return <ApiFallbackScreen />;
  }

  const heroPost = allPosts[0];
  const heroMiddle = allPosts.slice(1, 3);
  const heroBottom = allPosts.slice(3, 6);
  // Feed: posts 6-23 (18 posts), offset for "cargar más" starts at 24
  const feedPosts = allPosts.slice(6, 24);

  const mostRead = await getMostReadPosts(
    allPosts,
    allPosts.slice(0, siteConfig.content.topPostsCount)
  );

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="pt-0 pb-12">
        <h1 className="sr-only">Montecristi Noticias — El Periódico de Montecristi Digital | Noticias de Montecristi Hoy y República Dominicana</h1>

        {/* Ad: Top Leaderboard */}
        <div className="container mx-auto px-4 mb-8 flex justify-center">
          <CustomAd size="horizontal" position="homeTopLeaderboard" />
        </div>

        {/* --- HERO SECTION --------------------------------------------------------- */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Main hero articles */}
            <div className="lg:col-span-9">
              <div className="mb-12">
                <NewsCard post={heroPost} variant="hero" priority={true} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {heroMiddle.map((post) => (
                  <NewsCard key={post.id} post={post} variant="grid" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {heroBottom.map((post) => (
                  <NewsCard key={post.id} post={post} variant="grid" />
                ))}
              </div>
            </div>

            {/* --- Hero sidebar — STICKY --------------------------------------- */}
            <aside className="lg:col-span-3 h-full relative">
              <div className="sticky top-32 flex flex-col gap-6">
                {/* Social follow widget with #042564 */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-[#042564] border border-white/10 group flex flex-col gap-5 p-7">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#BF1B23]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#BF1B23]/30 transition-colors duration-700 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#021437]/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#BF1B23] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-md mb-3">
                      SÍGUENOS
                    </span>
                    <p className="text-[12px] font-inter text-gray-300 leading-relaxed max-w-[180px]">
                      Únete a la comunidad de <span className="text-white font-bold">Montecristi</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 relative z-10 w-full">
                    {[
                      { href: siteConfig.social.facebook.url, label: "Facebook", hover: "hover:bg-[#1877f2] hover:border-[#1877f2]", icon: <IconFacebook /> },
                      { href: siteConfig.social.instagram.url, label: "Instagram", hover: "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:border-transparent", icon: <IconInstagram /> },
                      { href: siteConfig.social.youtube.url, label: "YouTube", hover: "hover:bg-[#BF1B23] hover:border-[#BF1B23]", icon: <IconYouTube /> },
                    ].map(({ href, label, hover, icon }) => (
                      <Link key={label} href={href} target="_blank" rel="noopener" aria-label={`Seguir en ${label}`} prefetch={false}
                        className={`flex items-center justify-between p-3.5 bg-white/[0.05] border border-white/10 ${hover} transition-all duration-300 rounded-xl group/link`}>
                        <div className="flex items-center gap-3">
                          <div className="text-white bg-white/10 rounded-lg w-7 h-7 flex items-center justify-center group-hover/link:bg-white/20 transition-colors">{icon}</div>
                          <div className="flex flex-col items-start">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none group-hover/link:text-white/80 transition-colors">Seguir en</span>
                            <span className="text-[11px] text-white font-black uppercase tracking-wide leading-none">{label}</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white/40 group-hover/link:text-white group-hover/link:-rotate-45 transition-all duration-300" />
                      </Link>
                    ))}
                  </div>
                </div>

                <CustomAd size="rectangle" position="homeSidebarHero1" />
                <CustomAd size="rectangle" position="homeSidebarHero2" />
              </div>
            </aside>
          </div>
        </section>

        {/* --- SECCIÓN DEDICADA: NOTICIAS DE MONTECRISTI (ESTILO EL INFORME CON EL RELOJ GIGANTE) --- */}
        {montecristiPosts && montecristiPosts.length > 0 && (
          <MontecristiSpotlight posts={montecristiPosts} />
        )}

        {/* Ad: 970x90 después del Hero / Spotlight */}
        <div className="container mx-auto px-4 mb-16 flex justify-center">
          <CustomAd size="horizontal" position="homeAfterHero" />
        </div>

        {/* --- MAIN FEED --------------------------------------------------------------- */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Feed column */}
            <div className="lg:col-span-9">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-3 h-10 bg-brand-dark rounded-full shadow-lg" />
                <h2 className="text-3xl font-black uppercase tracking-tight text-brand-dark">Últimas Noticias</h2>
              </div>

              {/* LoadMoreFeed handles pagination; initialOffset=24 (6 hero + 18 feed) */}
              <LoadMoreFeed
                initialPosts={feedPosts}
                initialOffset={24}
                perPage={18}
              />
            </div>

            {/* --- Feed sidebar — STICKY --------------------------------------- */}
            <aside className="lg:col-span-3 h-full relative">
              <div className="sticky top-32 flex flex-col gap-6">
                <MostRead posts={mostRead} />
                <FuelWidget />
                <CustomAd size="rectangle" position="homeSidebarFeedRect" />
                <CustomAd size="vertical" position="homeSidebarFeedVert" />
              </div>
            </aside>
          </div>
        </section>

        {/* --- SECCIÓN MULTIMEDIA AL FINAL: ENTREVISTAS, VLOGS Y REPORTAJES EN VIDEO --- */}
        <MontecristiVideoSection />

      </div>
    </div>
  );
}
