import { Metadata } from 'next';
import { getPosts } from '@/lib/wp';
import { PrintEditionReader } from '@/components/PrintEditionReader';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Edición Impresa Digital | Montecristi.net',
  description: 'Lee la edición impresa digital de Montecristi.net. Formato periódico tradicional con las noticias más destacadas de Montecristi, la Línea Noroeste y el país.',
  alternates: { canonical: '/edicion-impresa' },
  openGraph: {
    title: 'Edición Impresa Digital | Montecristi.net',
    description: 'Kiosko digital: Formato de periódico impreso tradicional con las noticias de hoy en Montecristi y República Dominicana.',
    images: [siteConfig.seo.defaultImage],
  },
};

export default async function EdicionImpresaPage() {
  const posts = await getPosts({ per_page: 50, includeContent: true });

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Número de edición calculado desde fundación (2019)
  const foundingDate = new Date('2019-01-01').getTime();
  const daysSinceFounding = Math.floor((today.getTime() - foundingDate) / (1000 * 60 * 60 * 24));
  const editionNumber = 2400 + (daysSinceFounding % 5000);

  return (
    <main className="min-h-screen bg-[#e9e6df]">
      <PrintEditionReader
        posts={posts || []}
        dateStr={dateStr}
        editionNumber={editionNumber}
      />
    </main>
  );
}
