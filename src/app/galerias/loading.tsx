export default function GalleriesLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 h-10 w-40 bg-gray-300 rounded animate-pulse" />
        <div className="mb-12 h-6 w-80 bg-gray-200 rounded animate-pulse" />

        <div className="mb-12 h-20 bg-gray-200 rounded-xl animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden shadow-lg bg-white"
            >
              <div className="h-64 bg-gray-300 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="flex justify-between pt-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-10 bg-gray-200 rounded animate-pulse w-40 mx-auto" />
      </div>
    </div>
  );
}
