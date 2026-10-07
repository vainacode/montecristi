import { Metadata } from 'next';
import { getPosts, getMontecristiPosts, SITE_TIME_ZONE } from '@/lib/wp';
import { PrintEditionReader } from '@/components/PrintEditionReader';
import { siteConfig } from '@/config/site';

// Se regenera cada 10 minutos: la edición del día cambia poco y así carga al instante.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Edición Impresa Digital',
  description: 'Lee la edición impresa digital de Montecristi.net. Formato periódico tradicional con las noticias más destacadas de Montecristi, la Línea Noroeste y el país.',
  alternates: { canonical: '/edicion-impresa' },
  openGraph: {
    title: 'Edición Impresa Digital',
    description: 'Kiosko digital: Formato de periódico impreso tradicional con las noticias de hoy en Montecristi y República Dominicana.',
    images: [siteConfig.seo.defaultImage],
  },
};

export default async function EdicionImpresaPage() {
  const [generalPosts, montecristiPosts] = await Promise.all([
    getPosts({ per_page: 40, includeContent: true }).catch(() => []),
    getMontecristiPosts({ per_page: 20 }).catch(() => []),
  ]);

  const today = new Date();
  // En hora de RD: en el servidor (UTC) después de las 8 p. m. ya sería "mañana".
  const dateFormatted = today.toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: SITE_TIME_ZONE,
  });

  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // Número de edición calculado desde fundación (2019)
  const foundingDate = new Date('2019-01-01').getTime();
  const daysSinceFounding = Math.floor((today.getTime() - foundingDate) / (1000 * 60 * 60 * 24));
  const editionNumber = 2400 + (daysSinceFounding % 5000);

  return (
    <main className="min-h-screen bg-[#e9e6df]">
      <PrintEditionReader
        generalPosts={generalPosts || []}
        montecristiPosts={montecristiPosts || []}
        dateStr={dateStr}
        editionNumber={editionNumber}
      />
    </main>
  );
}
