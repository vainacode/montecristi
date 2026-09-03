import Link from 'next/link';
import Image from 'next/image';
import { WPPost, getFeaturedImage, getCategorySlug } from '@/lib/wp';
import { ProtectedImage } from './ProtectedImage';
import { ArrowRight, Clock, Radio } from 'lucide-react';

interface MontecristiSpotlightProps {
  posts: WPPost[];
}

function decodeEntities(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function formatPostDate(dateStr: string): string {
  try {
    const postDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours >= 0 && diffHours < 1) {
      return "Hace unos momentos";
    }
    if (diffHours >= 1 && diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
    if (diffDays === 1) {
      return "Ayer";
    }
    if (diffDays > 1 && diffDays < 7) {
      return `Hace ${diffDays} días`;
    }

    return postDate.toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function MontecristiSpotlight({ posts }: MontecristiSpotlightProps) {
  if (!posts || posts.length === 0) return null;

  const topPosts = posts.slice(0, 4);

  return (
    <section className="container mx-auto px-4 my-14">
      {/* ── 1. BANNER PRINCIPAL CON EL LOGO OFICIAL DEL RELOJ EN GRANDE ── */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-r from-[#042564] via-[#021437] to-[#8A1017] border border-gray-200/20 shadow-[0_20px_50px_rgba(4,37,100,0.18)] mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center px-6 py-8 md:px-12 md:py-10">
          
          {/* Columna Izquierda: Información y Botón */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 border border-[#BF1B23]/40 text-[#ff4d55] text-[10px] font-black uppercase tracking-[0.25em] shadow-inner">
              <Radio size={12} className="text-[#ff4d55] animate-pulse" />
              <span>COBERTURA EXCLUSIVA · LÍNEA NOROESTE</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif text-white tracking-tight uppercase leading-[1.05]">
                NOTICIAS DE <span className="text-[#ff4d55]">MONTECRISTI</span>
              </h2>
              <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-blue-200/70">
                SAN FERNANDO · GUAYUBÍN · VILLA VÁSQUEZ · CASTAÑUELAS · MANZANILLO
              </p>
            </div>

            <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-xl font-sans pt-1">
              Cobertura directa, veraz y al minuto de los principales acontecimientos, sucesos, turismo, cultura y desarrollo de la provincia Montecristi en tiempo real.
            </p>

            <div className="pt-2">
              <Link
                href="/montecristi"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#BF1B23] to-[#8A1017] hover:from-[#d92b34] hover:to-[#a3131b] text-white font-black px-8 py-4 rounded-xl shadow-[0_10px_25px_rgba(191,27,35,0.4)] hover:shadow-[0_15px_35px_rgba(191,27,35,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
              >
                <span>VER MÁS NOTICIAS</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: El Logo Oficial del Reloj de Montecristi en Grande */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative mt-6 lg:mt-0">
            <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] lg:-mt-12 lg:-mb-8 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] filter transition-transform duration-700 hover:scale-105 flex items-center justify-center p-4">
              <Image
                src="/logo.svg"
                alt="Montecristi.net"
                fill
                className="object-contain select-none pointer-events-none"
                priority
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. CUADRÍCULA DE ARTÍCULOS DE MONTECRISTI (FONDO LIMPIO) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topPosts.map((post) => {
          const imageUrl = getFeaturedImage(post);
          const catSlug = getCategorySlug(post) || 'montecristi';
          const cleanTitle = decodeEntities(post.title.rendered);
          const displayDate = formatPostDate(post.date);

          return (
            <Link
              key={post.id}
              href={`/${catSlug}/${post.slug}`}
              prefetch={false}
              className="group flex flex-col bg-white hover:bg-gray-50/80 border border-gray-200/80 hover:border-[#BF1B23]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen del post con cintillo informativo de televisión estilo Noticias SIN */}
              <div className="relative aspect-video w-full bg-gray-100 overflow-hidden shrink-0">
                <ProtectedImage
                  src={imageUrl || '/morroMontecristi.jpg'}
                  alt={cleanTitle}
                  title={cleanTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BF1B23] block mb-2">
                    MONTECRISTI
                  </span>
                  <h3 className="text-gray-900 text-sm md:text-[15px] font-bold leading-snug line-clamp-3 group-hover:text-[#BF1B23] transition-colors">
                    {cleanTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider pt-2 border-t border-gray-100">
                  <Clock size={12} className="text-[#BF1B23]" />
                  <span>{displayDate}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
