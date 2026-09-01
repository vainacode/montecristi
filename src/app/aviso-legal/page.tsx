import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: 'Aviso Legal y responsabilidad editorial.',
  alternates: { canonical: '/aviso-legal' },
};

export default function AvisoLegalPage() {
  return (
    <div className="bg-white min-h-screen py-20 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-dark mb-4">Aviso <span className="text-brand-light">Legal</span></h1>
          <p className="text-gray-500 font-inter text-sm">Última actualización: {new Date().toLocaleDateString('es-DO')}</p>
        </div>

        <div className="prose prose-zinc max-w-none font-inter text-gray-700 leading-relaxed
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-brand-dark
                         prose-a:text-brand-light hover:prose-a:text-brand-dark transition-colors">
          <h2>1. Información General del Titular</h2>
          <p>En cumplimiento de las normativas de la República Dominicana, se informa que este sitio web, accesible en <strong>{siteConfig.url}</strong>, es operado bajo el nombre comercial de <strong>{siteConfig.name}</strong>, portal digital de noticias líder en Montecristi y la región noroeste.</p>

          <h2>2. Propiedad Intelectual e Industrial</h2>
          <p>Todos los contenidos presentes en el sitio web (textos, imágenes, fotografías, logotipos, vídeos, software) son propiedad exclusiva de {siteConfig.name} o de los proveedores de contenido correspondientes, y están protegidos por leyes nacionales e internacionales de propiedad intelectual.</p>

          <h2>3. Responsabilidad de los Contenidos</h2>
          <p>La redacción de {siteConfig.name} se esfuerza por ofrecer información veraz y contrastada. Sin embargo, no nos hacemos responsables por los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la falta de exactitud, actualidad o veracidad de las informaciones publicadas por autores externos, artículos de opinión o comentarios de los lectores.</p>

          <h2>4. Enlaces Externos</h2>
          <p>Este sitio puede contener enlaces que redirigen a contenidos de páginas web de terceros. {siteConfig.name} no asume ninguna responsabilidad respecto al contenido, información o servicios que pudieran aparecer en dichos sitios, los cuales tendrán carácter exclusivamente informativo.</p>

          <h2>5. Jurisdicción Aplicable</h2>
          <p>Cualquier disputa legal relacionada con el sitio web o sus contenidos estará sujeta a la jurisdicción de los tribunales correspondientes a la provincia de Montecristi, República Dominicana, renunciando expresamente el usuario a cualquier otro fuero que pudiera corresponderle.</p>
        </div>
      </div>
    </div>
  );
}
