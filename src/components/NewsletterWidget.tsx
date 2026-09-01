'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '¡Suscrito exitosamente!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al procesar la suscripción.');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Intenta de nuevo.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] p-px bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_40px_100px_rgba(0,0,0,0.4)] group border border-white/5">
      {/* Dynamic background with deeper glass effect */}
      <div className="absolute inset-0 bg-[#140405] rounded-[2.5rem] -z-10" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-light/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-light/30 transition-colors duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8A1017]/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-[#8A1017]/60 transition-colors duration-1000 pointer-events-none" />

      <div className="relative z-10 px-8 py-10 flex flex-col items-center text-center backdrop-blur-3xl rounded-[2.5rem]">
        {/* Floating Icon with Ring Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-brand-light/30 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl rotate-6 group-hover:rotate-12 transition-all duration-700">
            <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(191,27,35,0.4)]">
              <Mail size={22} className="text-white -rotate-6 group-hover:-rotate-12 transition-transform duration-700" />
            </div>
          </div>
        </div>

        <div className="space-y-1 mb-8">
          <h4 className="text-3xl font-black uppercase italic tracking-[-0.05em] text-white flex items-center gap-2">
            Boletín <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-red-400">Directo</span>
          </h4>
          <div className="h-1 w-12 bg-brand-light rounded-full mx-auto opacity-50"></div>
        </div>

        <p className="text-[13px] text-gray-400 font-medium mb-10 leading-relaxed max-w-[240px]">
          {siteConfig.newsletter.description}
        </p>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 w-full py-6 bg-green-500/10 border border-green-500/20 rounded-3xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <CheckCircle size={24} />
            </div>
            <p className="text-sm text-green-400 font-black uppercase tracking-widest">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[280px]">
            <div className="relative group/input">
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-light/50 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
              <input
                type="email"
                value={email}
                aria-label="Correo electrónico para suscripción"
                onChange={(e) => setEmail(e.target.value)}
                placeholder={siteConfig.newsletter.placeholder}
                required
                disabled={status === 'loading'}
                className="bg-white/[0.03] border border-white/10 px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-white focus:outline-none focus:bg-white/[0.07] focus:border-brand-light/30 transition-all rounded-[1.25rem] w-full text-center placeholder:text-gray-600 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              aria-label="Suscribirme al boletín"
              disabled={status === 'loading' || !email}
              className="relative overflow-hidden group/btn bg-brand-light text-white px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.25rem] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(191,27,35,0.35)] hover:-translate-y-1 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              {status === 'loading' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin"></div>
                  <span>Enviando</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {siteConfig.newsletter.buttonText}
                  <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </div>
              )}
            </button>

            {status === 'error' && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest mt-2 animate-bounce">
                <AlertCircle size={12} />
                <span>{message}</span>
              </div>
            )}
          </form>
        )}

        <div className="mt-10 flex items-center gap-2 opacity-30">
          <div className="h-px w-8 bg-gray-500"></div>
          <span className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-black">
            Privacidad Garantizada
          </span>
          <div className="h-px w-8 bg-gray-500"></div>
        </div>
      </div>
    </div>
  );
}
