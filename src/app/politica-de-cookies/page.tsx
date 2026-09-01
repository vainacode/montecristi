import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: 'Uso de cookies y tecnologías similares.',
  alternates: { canonical: '/politica-de-cookies' },
};

export default function PoliticaCookiesPage() {
  return (
    <div className="bg-white min-h-screen py-20 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-dark mb-4">Política de <span className="text-brand-light">Cookies</span></h1>
          <p className="text-gray-500 font-inter text-sm">Última actualización: {new Date().toLocaleDateString('es-DO')}</p>
        </div>

        <div className="prose prose-zinc max-w-none font-inter text-gray-700 leading-relaxed
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-brand-dark
                         prose-a:text-brand-light hover:prose-a:text-brand-dark transition-colors">
          <h2>1. ¿Qué son las cookies?</h2>
          <p>Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su principal utilidad es permitir a la web recordar su visita cuando vuelva a navegar por esa página, mejorando así su experiencia de uso.</p>

          <h2>2. ¿Qué cookies utiliza esta web?</h2>
          <p>En <strong>{siteConfig.name}</strong> utilizamos principalmente las siguientes cookies:</p>
          <ul>
            <li><strong>Cookies técnicas:</strong> Son aquellas necesarias para la navegación y el buen funcionamiento de la página web (ej. control del tráfico de datos o compartir contenidos en redes sociales).</li>
            <li><strong>Cookies de análisis:</strong> Tratadas por nosotros o por terceros (como Google Analytics), nos permiten cuantificar el número de usuarios para realizar medición y análisis estadístico.</li>
            <li><strong>Cookies publicitarias:</strong> Al integrar Google AdSense, estas cookies permiten la gestión eficaz de los espacios publicitarios, personalizando los anuncios para que sean relevantes para el usuario.</li>
          </ul>

          <h2>3. Desactivación o eliminación de cookies</h2>
          <p>En cualquier momento, usted podrá ejercer su derecho de desactivación o eliminación de cookies de este sitio web. Las acciones dependen principalmente del navegador web que esté utilizando. En las opciones de su navegador (Chrome, Firefox, Safari, Edge) puede configurar la privacidad y el manejo de estos ficheros.</p>

          <h2>4. Notas adicionales</h2>
          <p>Ni este portal web ni sus representantes legales se hacen responsables del contenido ni de la veracidad de las políticas de privacidad que puedan tener los terceros (como Google) mencionados en esta política de cookies.</p>
        </div>
      </div>
    </div>
  );
}
