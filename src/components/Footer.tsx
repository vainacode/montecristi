import Link from "next/link";
import Image from "next/image";
import { WhosAmungUsWidget } from "@/components/WhosAmungUsWidget";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-[#181818] text-white pt-20 pb-10 border-t-4 border-[#BF1B23]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16">

          {/* 1. Brand Info */}
          <div className="space-y-6 lg:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" prefetch={false} className="flex items-center gap-3 py-2 group" aria-label="Ir a la página de inicio">
              <Image
                src="/logo.svg"
                alt="Logo Montecristi"
                width={42}
                height={42}
                className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-[family-name:var(--font-source-sans)] font-black tracking-tight text-white uppercase text-2xl sm:text-3xl leading-none">
                MONTECRISTI<span className="font-bold text-white/90">.NET</span>
              </span>
            </Link>
            <p className="text-xs text-gray-300 font-inter leading-relaxed max-w-xs">
              {siteConfig.seo.description}
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <Link href={siteConfig.social.facebook.url} target="_blank" rel="noopener" aria-label="Síguenos en Facebook" className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#BF1B23] hover:text-white transition-all"><IconFacebook size={14} /></Link>
              <Link href={siteConfig.social.twitter.url} target="_blank" rel="noopener" aria-label="Síguenos en Twitter/X" className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#BF1B23] hover:text-white transition-all"><IconTwitter size={14} /></Link>
              <Link href={siteConfig.social.instagram.url} target="_blank" rel="noopener" aria-label="Síguenos en Instagram" className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#BF1B23] hover:text-white transition-all"><IconInstagram size={14} /></Link>
              <Link href={siteConfig.social.youtube.url} target="_blank" rel="noopener" aria-label="Síguenos en YouTube" className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#BF1B23] hover:text-white transition-all"><IconYoutube size={14} /></Link>
            </div>
          </div>

          {/* 2. Categorías / Noticias */}
          <div className="lg:col-span-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-6">SECCIONES PRINCIPALES</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-gray-200 font-bold uppercase tracking-widest">
              {siteConfig.nav.slice(0, 8).map((item) => (
                <li key={item.name}>
                  <Link href={item.href} prefetch={false} className="inline-block py-1.5 hover:text-red-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Directorio SEO & Pauta */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-6">PUBLICIDAD & EMPRESAS</h4>
            <div className="text-[11px] text-gray-300 font-inter leading-relaxed space-y-2">
              <p>Pauta con <strong>Montecristi.net</strong>, el periódico de Montecristi líder en noticias de Montecristi y la Línea Noroeste.</p>
              <div className="flex flex-col gap-1 text-[11px] text-gray-300 pt-1">
                <Link href="/montecristi" className="inline-block py-1.5 hover:text-white transition-colors">· Noticias de Montecristi Hoy</Link>
                <Link href="/montecristi" className="inline-block py-1.5 hover:text-white transition-colors">· Montecristi Noticias de Última Hora</Link>
                <Link href="/conoce-montecristi" className="inline-block py-1.5 hover:text-white transition-colors">· Periódico de Montecristi y Guía</Link>
              </div>
            </div>
            <Link href="/contacto" prefetch={false} className="inline-block bg-[#BF1B23] text-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#181818] transition-all shadow-xl hover:shadow-[#BF1B23]/20">
              Anunciar mi Empresa
            </Link>
          </div>

        </div>

        {/* 5. Legal Links Horizontal Section */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 py-8 border-t border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
          <Link href="/conocenos" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Conócenos</Link>
          <Link href="/aviso-legal" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Aviso Legal</Link>
          <Link href="/politica-de-privacidad" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Privacidad</Link>
          <Link href="/politica-de-cookies" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Cookies</Link>
          <Link href="/terminos" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Términos</Link>
          <Link href="/mapa-del-sitio" prefetch={false} className="inline-block py-1.5 hover:text-white transition-colors">Mapa del Sitio</Link>
        </div>

        {/* 6. Clean Bottom copyright & Whos.amung.us Counter */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <p>© {new Date().getFullYear()} MONTECRISTI. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="my-1 flex items-center justify-center min-h-[22px]">
            <WhosAmungUsWidget siteKey="uwed10c87e" widgetId="h2h" />
          </div>
          <p>DESARROLLADO POR <span className="text-gray-300">BELLOTA HOSTING</span></p>
        </div>
      </div>
    </footer>
  );
}

function IconFacebook({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}

function IconTwitter({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 4-2 2c1 1 2 2.7 2 4.4 0 6.6-5.4 12-12 12-3.1 0-6.1-1.2-8.4-3.4 2.1.2 4.2-.4 5.9-1.8-1.5-.1-2.9-1-3.6-2.4.2 0 .4.1.7.1.3 0 .6 0 .9-.1-1.6-.3-2.8-1.7-2.8-3.4 0 0 .5.3 1.1.3-.9-.6-1.5-1.7-1.5-2.9 0-.6.2-1.2.5-1.7 1.7 2.1 4.2 3.5 7.1 3.6 0-.3-.1-.6-.1-.9 0-1.9 1.5-3.5 3.5-3.5 1 0 1.9.4 2.6 1.1.8-.1 1.6-.4 2.3-.8-.3.8-.8 1.4-1.5 1.8.7-.1 1.4-.3 2.1-.6z" /></svg>;
}

function IconInstagram({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
}

function IconYoutube({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>;
}
