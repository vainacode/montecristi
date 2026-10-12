import type { Metadata } from "next";
import { getPosts } from "@/lib/wp";
import { NewsCard } from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "Buscar noticias",
  description: "Busca noticias de Montecristi, la Línea Noroeste y República Dominicana.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/buscar" },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim().slice(0, 100) ?? "";
  const posts = query ? await getPosts({ search: query, per_page: 24 }) : [];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-serif text-4xl font-bold text-slate-950 md:text-5xl">
          Buscar noticias
        </h1>
        <form action="/buscar" method="get" className="mt-6 flex max-w-2xl gap-3">
          <label className="sr-only" htmlFor="news-search">Término de búsqueda</label>
          <input
            id="news-search"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={100}
            placeholder="Ej.: noticias de Montecristi"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
          />
          <button type="submit" className="rounded-lg bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-blue-900">
            Buscar
          </button>
        </form>

        {query && (
          <section className="mt-10" aria-live="polite">
            <h2 className="mb-6 text-xl font-semibold text-slate-800">
              {posts.length ? `${posts.length} resultados para “${query}”` : `No encontramos resultados para “${query}”`}
            </h2>
            {posts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => <NewsCard key={post.id} post={post} variant="grid" />)}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
