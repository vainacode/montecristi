import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: 'Términos y Condiciones de Uso del Portal.',
  alternates: { canonical: '/terminos' },
};

export default function TerminosPage() {
  return (
    <div className="bg-white min-h-screen py-20 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-dark mb-4">Términos y <span className="text-brand-light">Condiciones</span></h1>
          <p className="text-gray-500 font-inter text-sm">Última actualización: {new Date().toLocaleDateString('es-DO')}</p>
        </div>

        <div className="prose prose-zinc max-w-none font-inter text-gray-700 leading-relaxed
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-brand-dark
                         prose-a:text-brand-light hover:prose-a:text-brand-dark transition-colors">
          <h2>1. Aceptación de los Términos</h2>
          <p>El acceso y uso de <strong>{siteConfig.url}</strong> (en adelante "El Portal") atribuye la condición de usuario, e implica la aceptación total y sin reservas de las presentes Condiciones de Uso. Si el usuario no está de acuerdo con estas condiciones, deberá abstenerse de utilizar el sitio.</p>

          <h2>2. Uso Correcto del Portal</h2>
          <p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que <strong>{siteConfig.name}</strong> ofrece. Queda estrictamente prohibido utilizar el portal para incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</p>

          <h2>3. Comentarios y Participación</h2>
          <p>{siteConfig.name} promueve la libertad de expresión, sin embargo, nos reservamos el derecho de retirar todos aquellos comentarios y aportaciones que vulneren el respeto a la dignidad de la persona, que sean discriminatorios, xenófobos, racistas o pornográficos.</p>

          <h2>4. Publicidad y AdSense</h2>
          <p>Parte del sitio web alberga contenidos publicitarios. Los anunciantes son los únicos responsables de asegurar que el material remitido para su inclusión cumpla con la normativa de la República Dominicana. Este sitio utiliza Google AdSense, por lo cual los usuarios quedan supeditados a los términos y condiciones del proveedor de publicidad (Google).</p>

          <h2>5. Modificaciones</h2>
          <p>{siteConfig.name} se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios sin justificación y de manera unilateral.</p>

          <h2>6. Exclusión de Garantías</h2>
          <p>La redacción no garantiza la total ausencia de errores en el acceso al portal o en su contenido, ni que este se encuentre siempre actualizado, aunque pondrá sus mejores esfuerzos operativos y técnicos para, en su caso, evitarlos o solventarlos lo más pronto posible.</p>
        </div>
      </div>
    </div>
  );
}
