export default function Loading() {
  return (
    <div className="page-wrapper flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 glass-spinner mb-4"></div>
        <p className="text-secondary text-lg">Loading events…</p>
      </div>
    </div>
  );
}
