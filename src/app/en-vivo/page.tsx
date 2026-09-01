import { Metadata } from 'next';
import { CustomAd } from "@/components/CustomAd";
import { LiveStreamPlayer } from "@/components/LiveStreamPlayer";

export const metadata: Metadata = {
   title: "Transmisión En Vivo | Montecristi.net",
   description: "Sigue nuestra señal en vivo 24/7 con las noticias más importantes de Montecristi, República Dominicana y el mundo.",
   alternates: { canonical: '/en-vivo' },
};

export default function LivePage() {
   return (
      <div className="bg-[#042564] min-h-screen text-white pt-8 pb-16">
         <div className="container mx-auto px-4 max-w-7xl">

            {/* 1. TÍTULO Y DESCRIPCIÓN ARRIBA */}
            <div className="text-center mb-8 max-w-3xl mx-auto">
               <div className="inline-flex items-center gap-2.5 bg-[#BF1B23] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-lg mb-4 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  SEÑAL EN VIVO 24/7
               </div>
               <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                  Montecristi <span className="text-[#BF1B23]">TV</span> Digital
               </h1>
               <p className="text-xs md:text-sm text-gray-300 font-medium mt-2 max-w-xl mx-auto leading-relaxed">
                  Transmisión continua de noticias, boletines de última hora y cobertura especial desde Montecristi para la República Dominicana y el mundo.
               </p>
            </div>

            {/* 2. SECCIÓN PRINCIPAL: LATERAL IZQ | REPRODUCTOR + BANNER INTEGRADO | LATERAL DER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

               {/* LATERAL IZQUIERDO: Anuncio 300x250 */}
               <aside className="hidden lg:flex lg:col-span-3 justify-center">
                  <div className="sticky top-28 w-full flex flex-col items-center">
                     <CustomAd size="rectangle" position="homeSidebarHero1" />
                  </div>
               </aside>

               {/* CENTRO: REPRODUCTOR DE VIDEO REAL HLS + BANNER INFERIOR */}
               <main className="col-span-1 lg:col-span-6 flex flex-col items-center gap-6">
                  {/* Reproductor con Stream Real */}
                  <LiveStreamPlayer
                     streamUrl="https://soportedvb.click:3620/live/deultimominutomedialive.m3u8"
                     poster="/morroMontecristi.jpg"
                  />

                  {/* Banner de 970x90 colocado en el reproductor */}
                  <div className="w-full flex justify-center">
                     <CustomAd size="horizontal" position="homeTopLeaderboard" />
                  </div>

                  {/* Anuncios en móviles */}
                  <div className="flex lg:hidden flex-wrap justify-center gap-4 mt-2 w-full">
                     <CustomAd size="rectangle" position="homeSidebarHero1" />
                     <CustomAd size="rectangle" position="homeSidebarHero2" />
                  </div>
               </main>

               {/* LATERAL DERECHO: Anuncio 300x250 */}
               <aside className="hidden lg:flex lg:col-span-3 justify-center">
                  <div className="sticky top-28 w-full flex flex-col items-center">
                     <CustomAd size="rectangle" position="homeSidebarHero2" />
                  </div>
               </aside>

            </div>

         </div>
      </div>
   );
}
