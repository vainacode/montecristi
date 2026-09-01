import { Metadata } from 'next';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Target, Users, Landmark, Award, CheckCircle2, Heart, Zap, History, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
    title: "Conócenos | Montecristi",
    description: 'Descubre la esencia de Montecristi: nuestra misión, visión y el compromiso inquebrantable con la verdad en Montecristi, la República Dominicana y el mundo.',
    alternates: { canonical: '/conocenos' },
};

export default function ConocenosPage() {
    return (
        <div className="bg-white min-h-screen font-inter selection:bg-brand-light/30">
            {/* 1. HERO SECTION - ULTRA MODERN */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-brand-dark">
                {/* Background Image with sophisticated overlays */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/morroMontecristi.jpg"
                        alt="El Morro de Montecristi"
                        fill
                        className="object-cover opacity-60 scale-105 animate-subtle-zoom"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in-up">
                        <Zap size={12} className="text-brand-light" />
                        Nuestra Identidad Digital
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter text-white mb-8 leading-[0.8] drop-shadow-2xl">
                        LA VOZ DE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-white">MONTECRISTI</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 font-medium max-w-3xl mx-auto leading-relaxed mb-12 drop-shadow-lg drop-shadow-brand-dark">
                        Periodismo valiente, tecnología de vanguardia y un compromiso absoluto con la verdad en Montecristi y la República Dominicana.
                    </p>

                </div>
                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10"></div>
            </section>

            {/* 1.5. STATS STRIP - High Contrast */}
            <section className="relative z-20 -mt-16 mb-20 px-4">
                <div className="container mx-auto max-w-4xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-10 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-black italic text-brand-dark leading-tight">5+</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-light">Años de Periodismo</span>
                    </div>
                    <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-black italic text-brand-dark leading-tight">50K+</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-light">Lectores Mensuales</span>
                    </div>
                    <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-black italic text-brand-dark leading-tight">24/7</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-light">Información en Vivo</span>
                    </div>
                </div>
            </section>

            {/* 2. OUR STORY / PURPOSE */}
            <section className="py-32 relative">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-brand-light/20 rounded-[40px] blur-2xl group-hover:bg-brand-light/30 transition-all duration-700"></div>
                            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-gray-100">
                                <Image
                                    src="/zapaticoMontecristi.jpg"
                                    alt="Cultura de Montecristi"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 bg-brand-dark text-white p-8 rounded-3xl shadow-2xl hidden md:block max-w-[280px]">
                                <History className="text-brand-light mb-4" size={32} />
                                <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2 text-brand-light">Desde 2019</h4>
                                <p className="text-sm text-gray-300 leading-relaxed font-inter">Nacimos como <strong>Montecristi News</strong>, consolidándonos como el portal de noticias digital de referencia.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 text-brand-light font-black uppercase tracking-widest text-xs">
                                <TrendingUp size={16} />
                                <span>Nuestra Motivación</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-brand-dark leading-[0.9]">
                                MÁS QUE NOTICIAS, ES <span className="text-brand-light">LEGADO</span>
                            </h2>
                            <div className="text-brand-dark font-bold uppercase tracking-widest text-sm border-b-2 border-brand-light pb-2 inline-block">
                                Equipo Editorial: Redacción Montecristi
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed font-inter">
                                Fundado en 2019 por nuestro equipo periodístico, nacimos con la convicción de que Montecristi merecía una voz propia, tecnológicamente avanzada y editorialmente independiente. Hoy en <strong>Montecristi</strong> no solo reportamos lo que sucede; analizamos por qué sucede y cómo impacta en nuestro futuro colectivo.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-4">
                                    <h4 className="font-black uppercase italic text-brand-dark border-l-4 border-brand-light pl-4">Independencia</h4>
                                    <p className="text-sm text-gray-500">Mantenemos nuestra línea editorial fuera de compromisos partidarios.</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black uppercase italic text-brand-dark border-l-4 border-brand-light pl-4">Innovación</h4>
                                    <p className="text-sm text-gray-500">Invertimos constantemente en tecnología para una mejor experiencia de lectura.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MISSION & VISION - MODERN CARDS */}
            <section className="bg-zinc-50 py-32 border-y border-gray-100">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Mission */}
                        <div className="group relative bg-white p-12 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-brand-light/20">
                            <div className="w-16 h-16 bg-brand-light/10 flex items-center justify-center rounded-3xl text-brand-dark mb-8 group-hover:bg-brand-light group-hover:text-white transition-colors duration-500">
                                <Target size={32} />
                            </div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-brand-dark mb-6">Misión</h2>
                            <p className="text-gray-600 font-inter leading-relaxed text-lg">
                                Facilitar el acceso a información veraz, analítica y oportuna, empoderando a nuestra comunidad a través de un periodismo que defiende la transparencia y celebra la identidad de la Línea Noroeste.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="group relative bg-brand-dark p-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-white">
                            <div className="w-16 h-16 bg-brand-light flex items-center justify-center rounded-3xl text-brand-dark mb-8 group-hover:bg-white transition-colors duration-500">
                                <Landmark size={32} />
                            </div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-6">Visión</h2>
                            <p className="text-gray-300 font-inter leading-relaxed text-lg">
                                Consolidarnos como el hub informativo digital referente en la República Dominicana, integrando inteligencia artificial y periodismo de datos para narrar la realidad con precisión quirúrgica.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. VALUES - INTERACTIVE GRID */}
            <section className="py-32 overflow-hidden">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <span className="text-brand-light font-black uppercase tracking-widest text-xs mb-4 block">Nuestros Pilares</span>
                        <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-brand-dark mb-6">VALORES QUE NOS <span className="text-brand-light">DEFINEN</span></h2>
                        <p className="text-gray-500 text-lg">No son solo palabras, sino el código de ética que guía cada publicación de nuestro equipo.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { title: "Veracidad", desc: "El rigor en los datos antes que el click fácil.", icon: CheckCircle2 },
                            { title: "Pasión", desc: "Amamos informar y servir a nuestra provincia.", icon: Heart },
                            { title: "Excelencia", desc: "Buscamos la perfección en cada palabra e imagen.", icon: Award },
                            { title: "Integridad", desc: "Honestidad total con nuestra audiencia.", icon: Users }
                        ].map((v, i) => (
                            <div key={i} className="group p-8 rounded-3xl border border-gray-100 bg-white hover:bg-brand-light transition-all duration-500 hover:-rotate-1">
                                <v.icon className="text-brand-light group-hover:text-brand-dark mb-6 transition-colors" size={40} />
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-dark mb-4 transition-colors">{v.title}</h3>
                                <p className="text-gray-500 group-hover:text-brand-dark/80 font-inter text-sm leading-relaxed transition-colors">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. TEAM CALLOUT */}
            <section className="pb-32 container mx-auto px-4 max-w-6xl">
                <div className="bg-brand-light p-8 md:p-20 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-brand-dark text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
                            ¿TIENES ALGO IMPORTANTE <br /> QUE CONTAR?
                        </h3>
                        <p className="text-brand-dark/80 text-xl font-medium font-inter">
                            Nuestra redacción está siempre abierta a la comunidad. Juntos construimos la historia diaria de Montecristi.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <a href="/contacto" className="inline-block bg-brand-dark text-white px-10 py-6 rounded-2xl font-black uppercase italic tracking-widest hover:bg-white hover:text-brand-dark transition-all duration-500 shadow-2xl hover:shadow-brand-dark/20">
                            Contáctanos Ahora
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
