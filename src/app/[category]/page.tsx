import { getPosts, getMontecristiPosts, getCategories, getCategorySlug } from "@/lib/wp";
import { getMostReadPosts } from "@/lib/analytics";
import { NewsCard } from "@/components/NewsCard";
import { CustomAd } from "@/components/CustomAd";
import { LoadMoreFeed } from "@/components/LoadMoreFeed";
import { MostRead } from "@/components/MostRead";
import { siteConfig } from "@/config/site";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, MapPin, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import type { WPPost } from "@/lib/wp";
import { montecristiGuides, montecristiGuideKeywords } from "@/data/montecristiPorDentro";
import { ApiFallbackScreen } from "@/components/ApiFallbackScreen";

export const revalidate = 30;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const defaultConfig = {
  description: "Las noticias más recientes.",
  gradient: "from-brand-dark to-[#140405]",
  accent: "#BF1B23",
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;

  if (slug === "montecristi-por-dentro") {
    const title = "Montecristi por Dentro | Guías, lugares y experiencias";
    const description = "Guías para conocer Montecristi: playas, hoteles, excursiones, historia, cultura, gastronomía y lugares de interés de la provincia.";
    return {
      title,
      description,
      keywords: montecristiGuideKeywords,
      alternates: { canonical: `${siteConfig.url}/montecristi-por-dentro` },
      openGraph: {
        type: "website",
        title,
        description,
        url: `${siteConfig.url}/montecristi-por-dentro`,
        siteName: siteConfig.name,
        locale: "es_DO",
        images: [{ url: `${siteConfig.url}/morroMontecristi.jpg`, width: 1200, height: 630, alt: title }],
      },
    };
  }

  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.slug === slug);
  const cfg = siteConfig.categoryConfig[slug as keyof typeof siteConfig.categoryConfig] || defaultConfig;

  const catName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  const seoTitle = `▷ Noticias de ${catName} hoy | Último Minuto | Montecristi`;
  const seoDesc = `Últimas noticias de ${catName} en Montecristi y la República Dominicana. ${cfg.description} Información actualizada al instante.`;

  // og:image siempre con URL absoluta para que Google y Facebook puedan crawlearla
  const rawImage = (cfg as any).image ?? siteConfig.seo.defaultImage;
  const ogImage = rawImage.startsWith('http') ? rawImage : `${siteConfig.url}${rawImage}`;

  return {
    title: seoTitle,
    description: seoDesc,
    robots: { index: true, follow: true },
    alternates: { canonical: `${siteConfig.url}/${slug}` },
    openGraph: {
      type: "website",
      locale: "es_DO",
      title: seoTitle,
      description: seoDesc,
      url: `${siteConfig.url}/${slug}`,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: seoTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [ogImage],
    },
  };
}

// ── Hero components per category ──────────────────────────────────────────────

function GenericHero({ name, cfg }: { name: string; cfg: any }) {
  return (
    <div className={`relative min-h-[450px] flex items-end overflow-hidden`}>
      {cfg.image && (
        <Image
          src={cfg.image}
          alt={name}
          fill
          className="object-cover object-center"
          priority
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t ${cfg.gradient} opacity-80 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 w-full px-6 md:px-12 pb-16 pt-24">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span style={{ color: cfg.accent }}>{name}</span>
        </nav>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
          {name.split(' ').map((word, i) => (
            <span key={i} className={i % 2 !== 0 ? "block translate-x-4" : "block"}>
              {word}
            </span>
          ))}
        </h1>
        <p className="text-gray-200 mt-8 text-sm font-inter max-w-lg leading-relaxed border-l-2 pl-6" style={{ borderColor: cfg.accent }}>
          {cfg.description}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  if (slug === "montecristi-por-dentro") return <MontecristiPorDentroPage />;
  return <CategoryContent slug={slug} />;
}

function MontecristiPorDentroPage() {
  const pageUrl = `${siteConfig.url}/montecristi-por-dentro`;
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Montecristi por Dentro",
    description: "Guías para conocer Montecristi, República Dominicana.",
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: montecristiGuides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: `${pageUrl}/${guide.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <section className="relative overflow-hidden bg-[#031934] text-white">
        <div className="absolute inset-0 bg-[url('/morroMontecristi.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
          <div className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#BF1B23]"><MapPin size={16} /> La guía local de Montecristi</div>
          <h1 className="max-w-4xl font-[family-name:var(--font-serif)] text-5xl leading-[0.95] md:text-8xl">Montecristi <em className="text-[#BF1B23]">por Dentro</em></h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">Lugares, historias y recomendaciones para descubrir la provincia desde una mirada local.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-10 flex items-end justify-between gap-5">
          <div><p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#8a1017]">Contenido útil para planificar</p><h2 className="font-[family-name:var(--font-serif)] text-4xl text-[#031934] md:text-5xl">Explora Montecristi</h2></div>
          <BookOpen className="hidden h-12 w-12 text-[#BF1B23] md:block" />
        </div>
        <div id="guias" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {montecristiGuides.map((guide, index) => (
            <Link key={guide.slug} href={`/montecristi-por-dentro/${guide.slug}`} className="group flex min-h-[270px] flex-col rounded-2xl border border-[#e7e0d5] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8a1017] hover:shadow-lg">
              <div className="mb-6 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.2em] text-[#8a1017]">{guide.eyebrow}</span><span className="font-[family-name:var(--font-serif)] text-3xl text-gray-300">{String(index + 1).padStart(2, "0")}</span></div>
              <h3 className="font-[family-name:var(--font-serif)] text-2xl leading-tight text-[#031934]">{guide.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{guide.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8a1017]">Leer guía <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-zinc-100 p-6 text-[#031934] md:p-8"><p className="max-w-3xl text-sm leading-7"><strong>Montecristi por Dentro</strong> es una sección editorial de Montecristi.net. Actualizaremos estas guías con fuentes locales, datos de contacto y recomendaciones verificadas para que residentes y visitantes encuentren información confiable.</p></div>
      </div>
    </div>
  );
}

async function CategoryContent({ slug }: { slug: string }) {

  const [categories, allPosts] = await Promise.all([
    getCategories().catch(() => []),
    getPosts({ per_page: 24 }).catch(() => []),
  ]);

  const cfg = siteConfig.categoryConfig[slug as keyof typeof siteConfig.categoryConfig] || defaultConfig;
  const category = categories.find((c) => c.slug === slug);
  const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

  // Solo traemos artículos de esa categoría. Si es Montecristi, usamos la fuente dedicada.
  let categoryPosts: WPPost[] = [];
  if (slug === 'montecristi') {
    categoryPosts = await getMontecristiPosts({ per_page: 19 }).catch(() => []);
  } else if (category) {
    categoryPosts = await getPosts({ category: category.id, per_page: 19 }).catch(() => []);
  }

  const heroPost = categoryPosts[0];
  const feedPosts = categoryPosts.slice(1);

  const mostRead = await getMostReadPosts(
    allPosts,
    allPosts.slice(0, siteConfig.content.topPostsCount)
  );

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/${slug}#webpage`,
        "url": `${siteConfig.url}/${slug}`,
        "name": `Noticias de ${categoryName} | Montecristi.net`,
        "description": cfg.description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${siteConfig.url}/#website`
        },
        "inLanguage": "es-DO"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/${slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": siteConfig.url
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `${siteConfig.url}/${slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-zinc-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <GenericHero name={categoryName} cfg={cfg} />

      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <CustomAd size="horizontal" position="categoryAfterHero" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <main className="lg:col-span-9">

            {categoryPosts.length > 0 ? (
              <>
                {heroPost && (
                  <div className="mb-10">
                    <NewsCard post={heroPost} variant="hero" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cfg.accent }} />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-brand-dark">
                    Todas las noticias · {categoryName}
                  </h2>
                </div>

                <LoadMoreFeed
                  initialPosts={feedPosts}
                  initialOffset={19}
                  categoryId={category?.id || 0}
                  perPage={18}
                />
              </>
            ) : (
              <ApiFallbackScreen 
                categoryName={categoryName}
                isCompact={true}
                message={`No hemos podido sincronizar los artículos de ${categoryName} en este momento. Por favor, reintenta en unos instantes.`}
              />
            )}

          </main>

          <aside className="lg:col-span-3">
            <div className="sticky top-[160px] space-y-8">
              <MostRead posts={mostRead} />
              <CustomAd size="rectangle" position="categorySidebarRect" />
              <CustomAd size="vertical"  position="categorySidebarVert" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
