"use client";

import { Send, Loader2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useState, useRef } from 'react';
import { submitContactForm } from '@/actions/contact';

export function ContactForm() {
  const [captchaVal, setCaptchaVal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Dummy para evitar errores si no está configurada

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Capturamos el formulario antes de cualquier await
    setStatus(null);

    if (!captchaVal) {
      setStatus({ type: 'error', msg: "Por favor, completa la verificación de seguridad para continuar." });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Obtener datos del formulario
      const formData = new FormData(form);

      const data = {
        nombre: formData.get('nombre') as string,
        email: formData.get('email') as string,
        asunto: formData.get('asunto') as string,
        mensaje: formData.get('mensaje') as string,
        captchaToken: captchaVal
      };

      // 2. Ejecutar acción del servidor (Validación + Envío Real via Brevo)
      const result = await submitContactForm(data);

      if (!result.success) {
        setStatus({ type: 'error', msg: result.message || "No se pudo enviar el mensaje. Inténtalo de nuevo." });
        setCaptchaVal(null);
        setIsSubmitting(false);
        return;
      }

      // 3. Éxito Real
      setStatus({ type: 'success', msg: result.message });
      form.reset(); // Limpiar el formulario
      setCaptchaVal(null); // Limpiar el captcha
      setIsSubmitting(false);

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: "Ocurrió un error inesperado. Por favor, inténtalo más tarde." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-gray-100">
      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand-dark mb-8">Envíanos un <span className="text-brand-light">Mensaje</span></h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre Completo</label>
            <input type="text" id="nombre" name="nombre" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white transition-all" placeholder="Ej. Juan Pérez" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
            <input type="email" id="email" name="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white transition-all" placeholder="tu@correo.com" required />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="asunto" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Motivo del Contacto</label>
          <select id="asunto" name="asunto" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white transition-all" required>
            <option value="">Selecciona una opción...</option>
            <option value="publicidad">Pautar Publicidad / Anuncios</option>
            <option value="prensa">Enviar Nota de Prensa</option>
            <option value="denuncia">Reportar una Denuncia / Noticia</option>
            <option value="otro">Otro Motivo</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="mensaje" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tu Mensaje</label>
          <textarea id="mensaje" name="mensaje" rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-light focus:bg-white transition-all resize-none" placeholder="¿En qué podemos ayudarte?" required></textarea>
        </div>

        {status && (
          <div className={`p-4 rounded-lg text-sm font-bold flex items-center gap-3 animate-fade-in-up ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
            <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            {status.msg}
          </div>
        )}

        <div className="flex justify-center md:justify-start pb-4">
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => setCaptchaVal(token)}
            onError={() => setCaptchaVal(null)}
            onExpire={() => setCaptchaVal(null)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all group ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-dark hover:bg-black text-white'
            }`}
        >
          {isSubmitting ? (
            <>
              Cargando...
              <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              Enviar Mensaje
              <Send size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-400 font-inter text-center mt-4">Tus datos están protegidos por nuestra <a href="/politica-de-privacidad" className="underline hover:text-gray-600">Política de Privacidad</a> y protegidos por Cloudflare Turnstile.</p>
      </form>
    </div>
  );
}
