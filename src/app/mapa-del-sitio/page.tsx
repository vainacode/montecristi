import { getCategories, getPosts } from "@/lib/wp";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Map, Layers, FileText, Shield, Info, ExternalLink, Calendar, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Mapa del Sitio",
  description: "Explora todas las secciones, categorías y noticias de Montecristi de forma organizada.",
  alternates: { canonical: '/mapa-del-sitio' },
};

export default async function SitemapPage() {
  const [categories, recentPosts] = await Promise.all([
    getCategories().catch(() => []),
    getPosts({ per_page: 20 }).catch(() => [])
  ]);

  const sections = [
    {
      title: "Explora",
      icon: <Layers className="text-brand-light" size={32} />,
      items: siteConfig.nav.map(item => ({ label: item.name, href: item.href }))
    },
    {
      title: "Legal & Privacidad",
      icon: <Shield className="text-zinc-400" size={32} />,
      items: [
        { label: "Aviso Legal", href: "/aviso-legal" },
        { label: "Política de Privacidad", href: "/politica-de-privacidad" },
        { label: "Política de Cookies", href: "/politica-de-cookies" },
        { label: "Términos y Condiciones", href: "/terminos" }
      ]
    },
    {
      title: "Asistencia",
      icon: <Info className="text-emerald-500" size={32} />,
      items: [
        { label: "Contacto y Pauta Comercial", href: "/contacto" },
        { label: "Conoce Montecristi", href: "/conoce-montecristi" },
        { label: "Suscríbete al Boletín", href: "/#newsletter" }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Header */}
      <section className="bg-brand-dark pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-light/5 -skew-x-12 opacity-50 transform translate-x-1/2" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="bg-brand-light p-4 rounded-2xl shadow-2xl">
              <Map className="text-brand-dark" size={40} />
            </div>
            <div>
              <h1 className="text-white text-5xl md:text-7xl font-black italic uppercase italic tracking-tighter leading-none">
                Mapa del <span className="text-brand-light italic">Sitio</span>
              </h1>
              <p className="text-gray-400 mt-4 text-xs font-black uppercase tracking-[0.4em]">Guía completa de nuestro portal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="container mx-auto px-4 max-w-6xl -mt-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-start transition-all hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]">
              <div className="mb-8">{section.icon}</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8 text-brand-dark flex items-center gap-2">
                {section.title}
              </h2>
              <ul className="space-y-4 w-full">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <Link 
                      href={item.href}
                      className="text-gray-500 hover:text-brand-light text-xs font-black uppercase tracking-[0.2em] flex items-center justify-between group py-2 border-b border-gray-50"
                    >
                      {item.label}
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mt-20 bg-zinc-950 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(75,185,255,0.15),transparent)] pointer-events-none" />
          
          <h2 className="text-white text-3xl font-black italic uppercase italic tracking-tighter mb-12 flex items-center gap-4">
            <Tag className="text-brand-light" /> Categorías de Noticias
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length > 0 ? categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/${cat.slug}`}
                className="group bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-brand-light transition-all flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="text-white group-hover:text-brand-dark transition-colors font-black text-xs uppercase tracking-widest">{cat.name}</div>
                <div className="text-white/40 group-hover:text-brand-dark/50 text-[10px] uppercase font-bold tracking-widest leading-none">{cat.count} artículos</div>
              </Link>
            )) : (
              <div className="col-span-full border border-dashed border-white/20 p-10 text-center rounded-2xl">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Conectando con el servidor de noticias...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-brand-dark text-3xl font-black italic uppercase italic tracking-tighter flex items-center gap-4">
              <FileText className="text-brand-light" /> Últimas Actualizaciones
            </h2>
            <Link 
              href="/"
              className="hidden md:flex items-center gap-2 text-xs font-black text-brand-light uppercase tracking-widest border-b-2 border-brand-light/30 hover:border-brand-light transition-all"
            >
              Ver Portada <ExternalLink size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPosts.length > 0 ? recentPosts.map((post: any) => (
              <Link 
                key={post.id}
                href={`/${post.categories[0] || 'noticias'}/${post.slug}`}
                className="bg-gray-50 border border-transparent hover:border-brand-light/30 hover:bg-white p-6 rounded-2xl transition-all group flex items-start gap-4"
              >
                <Calendar size={16} className="text-brand-light mt-1 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-brand-dark group-hover:text-brand-light transition-colors line-clamp-1 leading-tight mb-1" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest italic">{new Date(post.date).toLocaleDateString()}</p>
                </div>
              </Link>
            )) : (
              <div className="col-span-full border border-dashed border-gray-200 p-10 text-center rounded-2xl">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No hay noticias recientes disponibles</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
