import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Compass, Camera, ArrowRight, Play, Sun, Navigation } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getCategories, getPosts, getFeaturedImage, getCategorySlug, WPPost } from '@/lib/wp';

export const metadata: Metadata = {
  title: 'Conoce a Montecristi | Guía Turística y Videos',
  description: 'Descubre los encantos de Montecristi. Guías turísticas, videos, atracciones, el Morro, las playas y la rica historia de la ciudad del noroeste dominicano.',
  openGraph: {
    title: 'Conoce a Montecristi | Guía Turística',
    description: 'Descubre los encantos de Montecristi con nuestras guías y videos exclusivos.',
    url: `${siteConfig.url}/conoce-montecristi`,
  },
  alternates: { canonical: '/conoce-montecristi' },
};

export default async function ConoceMontecristiPage() {
  
  // Dynamic API Connection
  const categories = await getCategories().catch(() => []);
  const targetCategory = categories.find(c => 
    c.slug === 'conoce-montecristi' || 
    c.name.toLowerCase().includes('conoce a montecristi') ||
    c.slug.includes('montecristi')
  );

  let guides: WPPost[] = [];
  if (targetCategory) {
    guides = await getPosts({ category: targetCategory.id, per_page: 7 }).catch(() => []);
  }

  return (
    <div className="bg-[#f8fafc] font-inter min-h-screen">
      
      {/* 1. IMMERSIVE HERO */}
      <div className="relative h-[80vh] min-h-[600px] max-h-[900px] w-full flex items-center justify-center overflow-hidden">
        {/* Cinematic Parallax Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-slow-pan transform scale-110" 
          style={{ backgroundImage: `url('/zapaticoMontecristi.jpg')` }}
        />
        {/* Refined Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-brand-dark/60 to-[#f8fafc]" />
        
        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center -translate-y-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
             <Navigation size={14} className="animate-pulse text-brand-light" />
             <span>Explora la Joya del Noroeste</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl mb-6">
            Descubre <br/> 
            <span className="inline-block pr-6 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-white to-brand-light animate-[shine_3s_ease-in-out_infinite]">Montecristi</span>
          </h1>
          <p className="text-lg md:text-2xl font-medium text-white/90 max-w-3xl leading-relaxed drop-shadow-md">
            Un paisaje donde el desierto se encuentra con el mar. Tu guía experta para navegar por El Morro, los Cayos, y la rica historia dominicana.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shine {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}} />
      </div>

      <div className="container mx-auto px-4 relative z-30 -mt-24 mb-32">
        {/* PREMIUM BENTO BOX INFO STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col justify-center transform hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-14 h-14 bg-brand-light/10 text-brand-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                 <Compass size={28} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter text-brand-dark mb-2">Parque Nacional</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Senderos inexplorados y la majestuosidad de la montaña del Morro esperando por ti.</p>
           </div>
           
           <div className="bg-brand-dark rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,40,77,0.2)] border border-[#00386b] flex flex-col justify-center transform scale-105 md:-translate-y-8 z-10 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="w-14 h-14 bg-white/10 text-brand-light rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500 relative z-10">
                 <Sun size={28} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter mb-2 relative z-10">Playas Vírgenes</h4>
              <p className="text-sm text-gray-300 leading-relaxed relative z-10">Conéctate con la naturaleza en los espectaculares Cayos Siete Hermanos y sus aguas cristalinas.</p>
           </div>
           
           <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col justify-center transform hover:-translate-y-2 transition-transform duration-500 group">
              <div className="w-14 h-14 bg-brand-light/10 text-brand-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                 <Camera size={28} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter text-brand-dark mb-2">Cultura e Historia</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Camina por calles victorianas, visita el emblemático Reloj Público y los museos históricos.</p>
           </div>
        </div>
      </div>

      {/* 2. THEATER VIDEOS SECTION */}
      <section className="bg-brand-dark text-white py-32 relative overflow-hidden">
         {/* Subtle background glow */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-light/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
         
         <div className="container mx-auto px-4 relative z-10">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="max-w-2xl">
                    <span className="text-brand-light text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Experiencia Visual</span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                       El Morro como <br/>Nunca lo has Visto
                    </h2>
                </div>
                <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed">
                   Prepárate para tu viaje con estos recorridos inmersivos por los atractivos más espectaculares de Montecristi.
                </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Main Feature Theater */}
                <div className="md:col-span-2 group relative rounded-3xl overflow-hidden bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 aspect-video">
                   <iframe 
                     width="100%" 
                     height="100%" 
                     src="https://www.youtube.com/embed/UcxN7Ugg5RQ?autoplay=0&rel=0&modestbranding=1" 
                     className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                     allowFullScreen
                   ></iframe>
                </div>

                {/* Secondary Videos */}
                <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 aspect-video">
                   <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/vWA5Fi0mpYM?rel=0&showinfo=0" 
                      className="absolute inset-0 w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-300"
                      allowFullScreen
                    ></iframe>
                </div>
                <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 aspect-video">
                   <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/O-6oSDICdYQ?rel=0&showinfo=0" 
                      className="absolute inset-0 w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-300"
                      allowFullScreen
                    ></iframe>
                </div>
             </div>
         </div>
      </section>

      {/* 3. EDITORIAL GUIDES (MASONRY/EDITORIAL STYLE) */}
      <section className="container mx-auto px-4 py-32">
         <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-brand-light text-[10px] font-black uppercase tracking-[0.4em] mb-4 block text-center">Bitácora de Viajero</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-brand-dark mb-6">
               Guías y Recomendaciones
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-inter">
               Toda la información que necesitas para planificar tu viaje, dónde comer, qué empacar y cómo sacarle el máximo provecho a la ciudad del reloj.
            </p>
         </div>

         {guides.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((article, idx) => {
                 // Make the first article large (featured) on desktop
                 const isFeatured = idx === 0;
                 return (
                 <Link 
                    key={article.id} 
                    href={`/${getCategorySlug(article)}/${article.slug}`} 
                    className={`group flex flex-col bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-500 ${isFeatured ? 'md:col-span-2 lg:col-span-2 md:flex-row' : ''}`}
                 >
                    <div className={`relative overflow-hidden ${isFeatured ? 'md:w-3/5' : 'w-full aspect-[4/3]'}`}>
                       <Image 
                         src={getFeaturedImage(article)} 
                         alt={article.title.rendered} 
                         fill
                         sizes="(max-width: 768px) 100vw, 50vw"
                         className="object-contain group-hover:scale-105 transition-transform duration-1000 ease-out" 
                       />
                       {isFeatured && (
                          <div className="absolute top-6 left-6 bg-brand-light text-brand-dark px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                             IMPRESCINDIBLE
                          </div>
                       )}
                    </div>
                    <div className={`flex flex-col justify-center ${isFeatured ? 'md:w-2/5 p-10 md:p-12' : 'p-8 flex-1'}`}>
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                          {isFeatured ? 'Guía Principal' : 'Lectura Sugerida'}
                       </span>
                       <h3 
                         className={`font-black italic uppercase tracking-tighter text-brand-dark leading-tight mb-4 group-hover:text-brand-light transition-colors ${isFeatured ? 'text-3xl lg:text-4xl' : 'text-xl md:text-2xl'}`}
                         dangerouslySetInnerHTML={{ __html: article.title.rendered }}
                       />
                       <p 
                         className="text-sm text-gray-500 font-inter leading-relaxed line-clamp-3 mb-8" 
                         dangerouslySetInnerHTML={{ __html: article.excerpt.rendered || '' }} 
                       />
                       
                       <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark group-hover:text-brand-light transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-light/10 transition-colors">
                             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                          <span>Leer Artículo</span>
                       </div>
                    </div>
                 </Link>
                 );
              })}
           </div>
         ) : (
           <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6">
                 <Compass size={32} />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Próximamente más guías de la ciudad.</p>
           </div>
         )}
      </section>

      {/* 4. HIGH-END CTA BOOKING/NEWSLETTER STRIP */}
      <div className="container mx-auto px-4 pb-32">
        <div className="bg-gradient-to-r from-brand-dark to-[#002f5c] rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 group">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[url('https://www.transparenttextures.com/patterns/topography.png')] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000" />
           <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-light/20 rounded-full blur-[80px]" />
           
           <div className="relative z-10 max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                 No te quedes con las ganas. <br/> <span className="text-brand-light">Ven a Morro.</span>
              </h2>
              <p className="text-lg text-white/70 font-inter font-light">
                 Suscríbete a nuestra lista exclusiva de viajeros. Enviamos ofertas en hoteles, excursiones en bote y descuentos de restaurantes locales 1 vez al mes.
              </p>
           </div>

           <div className="relative z-10 w-full lg:w-auto min-w-[320px]">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl">
                 <input 
                    type="email" 
                    placeholder="Tu correo de viajero..." 
                    className="flex-1 px-6 py-4 bg-transparent text-white font-bold text-sm tracking-wide focus:outline-none placeholder:text-white/40"
                 />
                 <button className="bg-brand-light text-brand-dark px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-brand-dark transition-all rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Quiero Viajar
                 </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}

