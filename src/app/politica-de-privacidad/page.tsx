import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: 'Política de Privacidad y manejo de datos personales.',
  alternates: { canonical: '/politica-de-privacidad' },
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="bg-white min-h-screen py-20 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-dark mb-4">Política de <span className="text-brand-light">Privacidad</span></h1>
          <p className="text-gray-500 font-inter text-sm">Última actualización: {new Date().toLocaleDateString('es-DO')}</p>
        </div>

        <div className="prose prose-zinc max-w-none font-inter text-gray-700 leading-relaxed
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-brand-dark
                         prose-a:text-brand-light hover:prose-a:text-brand-dark transition-colors">
          <h2>1. Información que recopilamos</h2>
          <p>En <strong>{siteConfig.name}</strong>, valoramos su privacidad. Recopilamos información personal que nos proporciona voluntariamente al suscribirse a nuestro boletín, contactarnos, o interactuar en nuestro sitio web.</p>

          <h2>2. Uso de la Información</h2>
          <p>Utilizamos la información recopilada para proporcionarle las noticias más relevantes de la región, responder a sus solicitudes, y enviarle comunicaciones de marketing si ha optado por recibirlas. También analizamos el tráfico de nuestro sitio para mejorar la experiencia del usuario.</p>

          <h2>3. Compartir Información</h2>
          <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir información con proveedores de servicios que nos asisten en las operaciones del sitio web (como Google Analytics o proveedores de publicidad como Google AdSense), siempre bajo estrictos acuerdos de confidencialidad.</p>

          <h2>4. Seguridad de los Datos</h2>
          <p>Implementamos medidas de seguridad para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ninguna transmisión por Internet es completamente segura, por lo que no podemos garantizar seguridad absoluta.</p>

          <h2>5. Vínculos a Terceros</h2>
          <p>Nuestro portal web puede contener enlaces a otros sitios de interés. Una vez que usted dé clic en estos enlaces y abandone nuestra página, ya no tenemos control sobre el sitio al que es redirigido y, por lo tanto, no somos responsables de los términos, privacidad, o la protección de sus datos en esos otros sitios de terceros.</p>

          <h2>6. Sus Derechos</h2>
          <p>Usted tiene derecho a acceder, corregir o eliminar su información personal que tenemos en nuestros registros. Si desea ejercer estos derechos, comuníquese con nuestro equipo editorial a través de los canales de contacto provistos.</p>

          <h2>7. Cambios a esta Política</h2>
          <p>Podemos modificar esta Política de Privacidad en cualquier momento. Le notificaremos cualquier cambio importante publicando la nueva política en el sitio y actualizando la fecha de entrada en vigencia.</p>
        </div>
      </div>
    </div>
  );
}
