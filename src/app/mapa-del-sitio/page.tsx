import { getCategories, getPosts, getCategorySlug, WPPost } from "@/lib/wp";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  FileText,
  Shield,
  Phone,
  Newspaper,
  Flame,
  Radio,
  MapPin,
  Calendar,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const revalidate = 1800; // Regenera cada 30 minutos

export const metadata = {
  title: "Mapa del Sitio | Montecristi.net",
  description: "Directorio completo y organizado de todas las secciones, categorías, guías turísticas y noticias de Montecristi.net.",
  alternates: { canonical: '/mapa-del-sitio' },
};

export default async function SitemapPage() {
  const [categories, recentPosts] = await Promise.all([
    getCategories().catch(() => []),
    getPosts({ per_page: 16 }).catch(() => [])
  ]);

  const mainSections = [
    { name: "Portada Principal", href: "/", icon: Newspaper, desc: "Noticias de última hora y actualidad nacional" },
    { name: "Montecristi Noticias", href: "/montecristi", icon: MapPin, desc: "Sucesos y actualidad de la provincia de Montecristi" },
    { name: "Edición Impresa Digital", href: "/edicion-impresa", icon: BookOpen, desc: "Periódico broadsheet interactivo de 8 páginas" },
    { name: "Precios de Combustibles", href: "/combustibles", icon: Flame, desc: "Tabla semanal de precios oficiales en RD$" },
    { name: "Transmisión En Vivo", href: "/en-vivo", icon: Radio, desc: "Señal y coberturas especiales en streaming" },
    { name: "Conoce Montecristi", href: "/conoce-montecristi", icon: Compass, desc: "Historia, turismo y guía regional completa" },
  ];

  const tourismGuides = [
    { title: "Playas de Montecristi", href: "/montecristi-por-dentro/playas-en-montecristi-republica-dominicana" },
    { title: "Villa Doña Emilia", href: "/montecristi-por-dentro/villa-dona-emilia-montecristi" },
    { title: "Hoteles en Montecristi", href: "/montecristi-por-dentro/hoteles-en-montecristi" },
    { title: "El Morro de Montecristi", href: "/montecristi-por-dentro/el-morro-de-montecristi" },
    { title: "Cayo Siete Hermanos", href: "/montecristi-por-dentro/cayo-siete-hermanos" },
    { title: "Gastronomía Montecristeña", href: "/montecristi-por-dentro/gastronomia-montecristena" },
    { title: "Historia y Reloj Público", href: "/montecristi-por-dentro/reloj-publico-montecristi" },
    { title: "Salinas de Montecristi", href: "/montecristi-por-dentro/salinas-marinas-montecristi" },
  ];

  const institutionalPages = [
    { title: "Quiénes Somos / Conócenos", href: "/conocenos", icon: Sparkles },
    { title: "Contacto y Publicidad", href: "/contacto", icon: Phone },
    { title: "Aviso Legal y Editorial", href: "/aviso-legal", icon: Shield },
    { title: "Política de Privacidad", href: "/politica-de-privacidad", icon: Shield },
    { title: "Política de Cookies", href: "/politica-de-cookies", icon: Shield },
    { title: "Términos y Condiciones", href: "/terminos", icon: Shield },
  ];

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      
      {/* ── ENCABEZADO EDITORIAL ── */}
      <section className="bg-gradient-to-b from-[#042564] via-[#031c4d] to-[#021437] text-white border-b-4 border-[#BF1B23]">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">INICIO</Link>
            <span className="text-gray-500">/</span>
            <span className="text-red-400">MAPA DEL SITIO</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#BF1B23] text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
                <Compass size={13} />
                <span>DIRECTORIO OFICIAL</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white leading-tight">
                Mapa del Sitio Web
              </h1>
              <p className="text-gray-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                Estructura general organizada de todas las secciones, coberturas, categorías temáticas, guías turísticas y noticias de <strong className="text-white">Montecristi.net</strong>.
              </p>
            </div>

            <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-3 shadow-inner">
              <Image
                src="/logo.svg"
                alt="Logo Montecristi"
                width={64}
                height={64}
                className="w-full h-full object-contain brightness-0 invert opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">

        {/* 1. SECCIONES PRINCIPALES Y SERVICIOS */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
            <div className="w-2.5 h-6 bg-[#BF1B23]" />
            <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900">
              Secciones Principales y Servicios
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainSections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={idx}
                  href={sec.href}
                  className="bg-white border border-gray-200/80 hover:border-[#042564] p-5 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#042564]/5 group-hover:bg-[#042564] text-[#042564] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#042564] flex items-center justify-between">
                      <span>{sec.name}</span>
                      <ChevronRight size={15} className="text-gray-400 group-hover:text-[#BF1B23] group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {sec.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 2. CATEGORÍAS TEMÁTICAS EDITORIALES */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
            <div className="w-2.5 h-6 bg-[#042564]" />
            <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900">
              Categorías de Noticias
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {siteConfig.nav.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="bg-white border border-gray-200 hover:border-[#BF1B23] p-4 rounded-xl shadow-xs hover:shadow-sm transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#BF1B23]" />
                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#BF1B23] transition-colors truncate">
                    {item.name}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#BF1B23] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* 3. GUÍAS LOCALES: MONTECRISTI POR DENTRO & TURISMO */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-[#BF1B23]" />
              <div>
                <h2 className="text-xl font-bold font-serif text-gray-900">
                  Guías Turísticas · Montecristi por Dentro
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Playas, gastronomía, historia, hoteles y atractivos naturales de la provincia
                </p>
              </div>
            </div>
            <Link
              href="/montecristi-por-dentro"
              className="text-xs font-black uppercase tracking-wider text-[#042564] hover:text-[#BF1B23] transition-colors hidden sm:flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tourismGuides.map((guide, idx) => (
              <Link
                key={idx}
                href={guide.href}
                className="bg-gray-50 hover:bg-white border border-gray-200/80 hover:border-[#042564] p-3.5 rounded-lg text-xs font-bold text-gray-800 hover:text-[#042564] transition-all flex items-center justify-between group"
              >
                <span className="truncate">{guide.title}</span>
                <ChevronRight size={13} className="text-gray-400 group-hover:text-[#BF1B23] transition-colors shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </section>

        {/* 4. ÚLTIMAS NOTICIAS PUBLICADAS */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-[#042564]" />
              <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900">
                Últimas Noticias Publicadas
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-wider text-[#BF1B23] hover:underline flex items-center gap-1"
            >
              <span>Ir a la Portada</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentPosts.length > 0 ? (
              recentPosts.map((post: WPPost) => {
                const catSlug = getCategorySlug(post);
                return (
                  <Link
                    key={post.id}
                    href={`/${catSlug}/${post.slug}`}
                    className="bg-white border border-gray-200/90 hover:border-[#042564] p-4 rounded-xl shadow-xs hover:shadow-md transition-all group flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-[#042564] group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xs sm:text-[13px] font-bold text-gray-900 group-hover:text-[#042564] transition-colors line-clamp-2 leading-snug"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-gray-400">
                        <span className="uppercase font-bold text-[#BF1B23]">{catSlug}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{new Date(post.date).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full bg-white border border-dashed border-gray-200 p-8 text-center rounded-xl text-xs text-gray-400">
                Cargando últimas publicaciones...
              </div>
            )}
          </div>
        </section>

        {/* 5. INFORMACIÓN INSTITUCIONAL, LEGAL Y CONTACTO */}
        <section className="bg-[#021437] text-white rounded-2xl p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Shield size={20} className="text-[#BF1B23]" />
            <h2 className="text-lg md:text-xl font-bold font-serif text-white">
              Información Institucional, Legal y Transparencia
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {institutionalPages.map((page, idx) => {
              const Icon = page.icon;
              return (
                <Link
                  key={idx}
                  href={page.href}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-xl transition-all flex items-center gap-3 group"
                >
                  <Icon size={16} className="text-red-400 group-hover:text-white transition-colors shrink-0" />
                  <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                    {page.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
