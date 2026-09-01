import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ExternalLink, MapPin, Play, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { montecristiGuides, montecristiGuideDetails } from "@/data/montecristiPorDentro";

export const revalidate = 3600;

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return montecristiGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = montecristiGuides.find((item) => item.slug === slug);
  if (!guide) return { robots: { index: false, follow: false } };
  const details = montecristiGuideDetails[guide.slug];

  const url = `${siteConfig.url}/montecristi-por-dentro/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.excerpt,
    keywords: guide.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.excerpt,
      url,
      siteName: siteConfig.name,
      locale: "es_DO",
      images: [{ url: details.image, width: 1200, height: 630, alt: guide.title }],
    },
  };
}

export default async function MontecristiGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = montecristiGuides.find((item) => item.slug === slug);
  if (!guide) notFound();
  const details = montecristiGuideDetails[guide.slug];

  const guideJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    mainEntityOfPage: `${siteConfig.url}/montecristi-por-dentro/${guide.slug}`,
    image: details.image,
    author: { "@type": "Organization", name: "Montecristi.net", url: siteConfig.url },
    publisher: { "@type": "Organization", name: "Montecristi.net", url: siteConfig.url },
    keywords: guide.keywords.join(", "),
    inLanguage: "es-DO",
    mainEntity: details.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <article className="min-h-screen bg-[#f7f6f3]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <div className="bg-[#031934] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 md:grid-cols-[1.15fr_0.85fr] md:items-end md:px-8 md:pt-20">
          <div>
            <Link href="/montecristi-por-dentro" className="mb-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/65 transition hover:text-white">
              <ArrowLeft size={15} /> Montecristi por Dentro
            </Link>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-[#BF1B23]">{guide.eyebrow}</p>
            <h1 className="max-w-3xl font-[family-name:var(--font-serif)] text-4xl leading-[1.05] md:text-6xl">{guide.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/75">{guide.excerpt}</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              <MapPin size={15} className="text-[#BF1B23]" /> Montecristi, República Dominicana
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl">
            <Image src={details.image} alt={details.imageAlt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 42vw" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-14 text-[10px] text-white/75">Foto: <a href={details.imageCredit.url} target="_blank" rel="noreferrer" className="underline hover:text-white">{details.imageCredit.label}</a></div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-3 md:grid-cols-3">
          {details.facts.map((fact) => <div key={fact.label} className="rounded-xl border border-[#e7e0d5] bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a1017]">{fact.label}</p><p className="mt-2 font-bold leading-snug text-[#031934]">{fact.value}</p></div>)}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-[#e7e0d5] bg-white p-6 shadow-sm md:p-10">
            {[...guide.sections, ...details.additionalSections].map((section) => (
              <section key={section.heading} className="mb-10 last:mb-0">
                <h2 className="mb-4 font-[family-name:var(--font-serif)] text-3xl text-[#031934]">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-4 text-[17px] leading-8 text-slate-700 last:mb-0">{paragraph}</p>)}
              </section>
            ))}

            {details.videoId && <section className="mt-12 border-t border-[#e7e0d5] pt-10"><div className="mb-4 flex items-center gap-2"><Play size={18} className="fill-[#8a1017] text-[#8a1017]" /><h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#172b3a]">Míralo en video</h2></div><div className="aspect-video overflow-hidden rounded-xl bg-black shadow-lg"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${details.videoId}?rel=0`} title={details.videoTitle || guide.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><p className="mt-3 text-xs text-slate-500">Video relacionado de YouTube.</p></section>}

            <section className="mt-12 border-t border-[#e7e0d5] pt-10"><div className="mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-[#8a1017]" /><h2 className="font-[family-name:var(--font-serif)] text-3xl text-[#172b3a]">Preguntas frecuentes</h2></div><div className="space-y-4">{details.faq.map((item) => <details key={item.question} className="rounded-xl border border-[#e7e0d5] bg-[#fbfaf8] p-4"><summary className="cursor-pointer font-bold text-[#172b3a]">{item.question}</summary><p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p></details>)}</div></section>
            <div className="mt-10 rounded-xl bg-[#e9dfcf] p-5 text-sm leading-7 text-[#172b3a]"><strong>Nota de Montecristi.net:</strong> horarios, precios, accesos y disponibilidad pueden cambiar. Confirma los datos directamente antes de viajar o contratar un servicio.</div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#e7e0d5] bg-white p-6 shadow-sm"><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#8a1017]">Planifica tu visita</p><p className="mb-4 text-sm leading-6 text-slate-600">Consulta la ubicación aproximada, revisa la ruta y confirma el acceso antes de salir.</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.mapQuery)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#8a1017] px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#172b3a]">Abrir en Google Maps <ExternalLink size={14} /></a></div>
            <div className="rounded-2xl border border-[#e7e0d5] bg-white p-6 shadow-sm"><p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#8a1017]">Fuentes consultadas</p><div className="space-y-3">{details.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm font-semibold leading-5 text-[#172b3a] hover:text-[#8a1017]"><ExternalLink size={14} className="mt-1 shrink-0" />{source.label}</a>)}</div></div>
          </aside>
        </div>

        <div className="border-t border-[#d9d1c5] pt-8">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#8a1017]">También te puede interesar</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {montecristiGuides.filter((item) => item.slug !== guide.slug).slice(0, 4).map((item) => (
              <Link key={item.slug} href={`/montecristi-por-dentro/${item.slug}`} className="rounded-xl border border-[#e7e0d5] bg-white p-4 font-bold text-[#172b3a] transition hover:-translate-y-0.5 hover:border-[#8a1017]">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
