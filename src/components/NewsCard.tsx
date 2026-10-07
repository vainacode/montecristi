import { WPPost, getFeaturedImage, getCategoryNames, getCategorySlug, toPlainText } from "@/lib/wp-helpers";
import Link from "next/link";
import { ProtectedImage } from "./ProtectedImage";

interface NewsCardProps {
  post: WPPost;
  variant?: "hero" | "grid" | "secondary";
  showImage?: boolean;
  hideAuthor?: boolean;
  forcedNoImage?: boolean;
  priority?: boolean;
}

export function NewsCard({
  post,
  variant = "grid",
  showImage = true,
  forcedNoImage = false,
  priority = false,
}: NewsCardProps) {
  const imageUrl = forcedNoImage ? "" : getFeaturedImage(post);
  const categories = getCategoryNames(post);
  const categorySlug = getCategorySlug(post);
  const category = categories[0] || "NOTICIAS";

  return (
    <Link href={`/${categorySlug}/${post.slug}`} prefetch={false} className="block h-full">
      <div className={`group flex flex-col h-full bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${variant === "hero" ? "md:flex-row-reverse md:items-stretch" : ""
        }`}>

        {showImage && (
          <div className={`relative overflow-hidden bg-gray-50 shrink-0 ${variant === "hero" ? "md:w-1/2 h-[300px] md:h-auto" : "aspect-video"
            }`}>
            <ProtectedImage
              src={imageUrl}
              alt={toPlainText(post.title.rendered)}
              title={toPlainText(post.title.rendered)}
              fill
              priority={priority}
              sizes={variant === "hero" ? "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        <div className={`p-6 flex flex-col justify-center ${variant === "hero" ? "md:w-1/2 md:p-12" : "flex-1"
          } ${!showImage ? "min-h-[180px]" : ""}`}>

          <span className="text-[10px] font-black text-red-600 mb-4 block tracking-widest uppercase">
            {category}
          </span>

          {variant === "hero" ? (
            <h2 className="font-bold text-gray-900 leading-[1.2] tracking-tight group-hover:text-brand-dark transition-colors text-2xl md:text-3xl">
              {toPlainText(post.title.rendered)}
            </h2>
          ) : (
            <h3 className="font-bold text-gray-900 leading-[1.2] tracking-tight group-hover:text-brand-dark transition-colors text-lg">
              {toPlainText(post.title.rendered)}
            </h3>
          )}

        </div>
      </div>
    </Link>
  );
}
