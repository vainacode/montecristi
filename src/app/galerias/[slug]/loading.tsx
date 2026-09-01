export default function GalleryDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 h-6 w-32 bg-gray-300 rounded animate-pulse" />

        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl mb-12 bg-gray-300 animate-pulse" />

        <div className="mb-12">
          <div className="h-12 bg-gray-300 rounded animate-pulse w-3/4 mb-4" />
          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
        </div>

        <div className="mb-12 h-20 bg-gray-200 rounded-xl animate-pulse" />

        <div className="prose prose-sm max-w-none mb-12 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>

        <div className="mb-12">
          <div className="h-8 bg-gray-300 rounded animate-pulse w-1/4 mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden shadow-lg bg-white"
              >
                <div className="relative w-full h-64 bg-gray-300 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-10 bg-gray-200 rounded animate-pulse w-40" />
      </div>
    </div>
  );
}
