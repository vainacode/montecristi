import { getGalleries } from "@/lib/wp";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { CustomAd } from "@/components/CustomAd";

export const metadata: Metadata = {
  title: "Galerías - Montecristi",
  description: "Galerías fotográficas de eventos, noticias y momentos especiales de Montecristi y la República Dominicana.",
  alternates: {
    canonical: "/galerias",
  },
};

export const revalidate = 60;

export default async function GalleriesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const { galleries, totalPages } = await getGalleries({
    page,
    per_page: 12,
    orderby: "date",
    order: "DESC",
  });

  if (!galleries || galleries.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-12 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-black uppercase tracking-tight text-brand-dark mb-2">
            Galerías
          </h1>
          <p className="text-gray-600 mb-12">
            Fotos y momentos especiales de Montecristi
          </p>

          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-400 font-black uppercase tracking-widest italic">
              No hay galerías disponibles por el momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-12 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-brand-dark mb-2">
            Galerías
          </h1>
          <p className="text-gray-600">
            Fotos y momentos especiales de Montecristi
          </p>
        </div>

        {/* Ad */}
        <div className="mb-12 flex justify-center">
          <CustomAd size="horizontal" position="homeTopLeaderboard" />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galerias/${gallery.slug}`}
              className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
            >
              <div className="relative overflow-hidden h-64 bg-gray-200">
                {gallery.featured_image?.source_url ? (
                  <Image
                    src={gallery.featured_image.source_url}
                    alt={gallery.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <Camera size={36} className="text-white/70" />
                  </div>
                )}

                {/* Photo count badge */}
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Camera size={13} className="text-white" />
                  <span>{gallery.photos_count}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-light transition-colors mb-2 line-clamp-2">
                  {gallery.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {gallery.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{gallery.author.name}</span>
                  <span>
                    {new Date(gallery.date).toLocaleDateString("es-DO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-12">
            {page > 1 && (
              <Link
                href={`/galerias?page=${page - 1}`}
                className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-light transition-colors"
              >
                ← Anterior
              </Link>
            )}

            <span className="px-4 py-2 text-gray-600 font-bold">
              Página {page} de {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={`/galerias?page=${page + 1}`}
                className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-light transition-colors"
              >
                Siguiente →
              </Link>
            )}
          </div>
        )}

        {/* Ad */}
        <div className="flex justify-center">
          <CustomAd size="horizontal" position="homeAfterHero" />
        </div>
      </div>
    </div>
  );
}
