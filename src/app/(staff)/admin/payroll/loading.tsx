export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-80 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  );
}
