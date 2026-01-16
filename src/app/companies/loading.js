export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading companies...</p>
      </div>
    </div>
  );
}
