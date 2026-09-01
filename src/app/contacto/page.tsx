import { Metadata } from 'next';
import { Mail, Briefcase, FileText, Send, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: "Contacto y Pauta Comercial",
  description: 'Contáctanos para pautas comerciales, notas de prensa y reportes de noticias.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Premium Hero */}
      <div className="bg-brand-dark text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-light/20 text-brand-light text-xs font-black uppercase tracking-widest mb-6 border border-brand-light/30">
            Hablemos
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-[0.9]">
            Contacto & <br /><span className="text-brand-light">Pauta</span>
          </h1>
          <p className="text-gray-300 font-inter text-lg md:text-xl max-w-2xl leading-relaxed">
            Conecta con tu audiencia ideal a través del portal de noticias de mayor crecimiento en el noroeste, o envíanos tus notas de prensa.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-12 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulario */}
          <ContactForm />

          {/* Sidebar de Publicidad */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-dark mb-6">¿Por qué pautar con nosotros?</h3>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center shrink-0">
                    <Briefcase size={18} className="text-brand-dark" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Alcance Regional</h4>
                    <p className="font-inter text-sm text-gray-600 mt-1">Llega a miles de lectores diarios enfocados en Montecristi y el noroeste.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-brand-dark" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Formatos Premium</h4>
                    <p className="font-inter text-sm text-gray-600 mt-1">Desde banners horizontales integrados hasta notas patrocinadas en nuestra portada.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-2">Redacción Digital</h4>
              <p className="font-inter text-sm text-gray-500">Montecristi, República Dominicana.</p>
              <p className="font-inter text-xs text-gray-400 mt-4 italic">No publicamos números telefónicos para evitar el spam, todas las solicitudes son evaluadas vía nuestro formulario.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
