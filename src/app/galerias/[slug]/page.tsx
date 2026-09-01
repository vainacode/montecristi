import { getGalleryBySlug } from "@/lib/wp";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CustomAd } from "@/components/CustomAd";
import { ArrowLeft } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return {
      title: "Galería no encontrada",
    };
  }

  return {
    title: `${gallery.title} - Galerías - Montecristi`,
    description: gallery.description,
    alternates: {
      canonical: `/galerias/${params.slug}`,
    },
    openGraph: {
      title: gallery.title,
      description: gallery.description,
      url: `/galerias/${params.slug}`,
      type: "website",
      images: gallery.featured_image
        ? [
            {
              url: gallery.featured_image.source_url,
              width: 1200,
              height: 630,
              alt: gallery.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-brand-dark mb-4">
            Galería no encontrada
          </h1>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la galería que buscas no existe.
          </p>
          <Link
            href="/galerias"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-light transition-colors"
          >
            <ArrowLeft size={18} />
            Volver a galerías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-24">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link
          href="/galerias"
          className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-light transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Volver a galerías
        </Link>

        {/* Hero image */}
        {gallery.featured_image?.source_url && (
          <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl mb-12">
            <Image
              src={gallery.featured_image.source_url}
              alt={gallery.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-brand-dark mb-4 leading-tight">
            {gallery.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">{gallery.author.name}</span>
              <span>•</span>
              <span>
                {new Date(gallery.date).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <span className="text-sm font-bold">
              {gallery.photos_count} foto{gallery.photos_count !== 1 ? "s" : ""}
            </span>
          </div>

          {gallery.description && (
            <p className="text-lg text-gray-700 mb-4">{gallery.description}</p>
          )}
        </div>

        {/* Ad */}
        <div className="mb-12 flex justify-center">
          <CustomAd size="horizontal" position="homeTopLeaderboard" />
        </div>

        {/* Description content */}
        {gallery.content && (
          <div
            className="prose prose-sm max-w-none mb-12 text-gray-700"
            dangerouslySetInnerHTML={{ __html: gallery.content }}
          />
        )}

        {/* Photos grid */}
        {gallery.photos && gallery.photos.length > 0 ? (
          <div>
            <h2 className="text-2xl font-black text-brand-dark mb-8">
              Fotos ({gallery.photos.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {gallery.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-200"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={photo.url}
                      alt={photo.alt || "Foto de la galería"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  {photo.caption && (
                    <div className="p-4 bg-white">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Ad */}
            <div className="mb-12 flex justify-center">
              <CustomAd size="horizontal" position="homeAfterHero" />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>No hay fotos disponibles en esta galería.</p>
          </div>
        )}

        {/* Related galleries */}
        <div className="mt-16 pt-8 border-t border-gray-300">
          <h2 className="text-2xl font-black text-brand-dark mb-8">
            Más galerías
          </h2>
          <Link
            href="/galerias"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-light transition-colors"
          >
            Ver todas las galerías
          </Link>
        </div>
      </div>
    </div>
  );
}
