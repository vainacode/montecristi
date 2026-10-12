import Link from 'next/link';
import Image from 'next/image';
import { WPPost, getFeaturedImage, getCategorySlug, toPlainText, formatDate } from '@/lib/wp-helpers';
import { ProtectedImage } from './ProtectedImage';
import { ArrowRight, Clock, Radio } from 'lucide-react';

interface MontecristiSpotlightProps {
  posts: WPPost[];
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

    return formatDate(postDate);
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
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-[#17366f] bg-gradient-to-r from-[#031934] via-[#042564] to-[#071a3c] shadow-[0_12px_32px_rgba(4,37,100,0.2)] mb-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#BF1B23]" />
        <div className="grid grid-cols-[minmax(0,1fr)_76px] sm:grid-cols-[minmax(0,1fr)_120px] lg:grid-cols-[minmax(0,1fr)_156px] gap-3 sm:gap-6 items-center px-4 py-4 sm:px-7 sm:py-5 lg:px-10 lg:py-6">
          
          {/* Columna Izquierda: Información y Botón */}
          <div className="min-w-0 space-y-2 sm:space-y-2.5">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-blue-100 sm:gap-2 sm:px-3 sm:text-[9px] sm:tracking-[0.2em]">
              <Radio size={11} className="shrink-0 text-[#ff6269]" />
              <span>COBERTURA LOCAL · MONTECRISTI</span>
            </div>

            <div>
              <h2 className="text-[1.35rem] font-black font-serif uppercase leading-[1.02] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                NOTICIAS DE <span className="text-[#ff4d55]">MONTECRISTI</span>
              </h2>
              <p className="mt-1 line-clamp-1 text-[8px] font-bold uppercase tracking-[0.08em] text-blue-100/70 sm:text-[10px] sm:tracking-[0.18em]">
                SAN FERNANDO · GUAYUBÍN · VILLA VÁSQUEZ · CASTAÑUELAS · MANZANILLO
              </p>
            </div>

            <p className="line-clamp-2 max-w-3xl font-sans text-[11px] leading-snug text-white/80 sm:text-sm sm:leading-relaxed">
              Noticias, comunidades y actualidad de Montecristi y la Línea Noroeste.
            </p>

            <div className="pt-0.5">
              <Link
                href="/montecristi"
                className="inline-flex items-center gap-2 rounded-md bg-[#BF1B23] px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#d92b34] sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.16em]"
              >
                <span>VER MÁS NOTICIAS</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: El Logo Oficial del Reloj de Montecristi en Grande */}
          <div className="relative flex justify-end">
            <div className="relative h-[72px] w-[48px] sm:h-[112px] sm:w-[74px] lg:h-[148px] lg:w-[98px]">
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
          const cleanTitle = toPlainText(post.title.rendered);
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
