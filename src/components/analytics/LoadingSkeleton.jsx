export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-4 w-80 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>

      {/* KPI Cards Pulse */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3 shadow-xs"
          >
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-800 rounded-md"></div>
            <div className="h-3.5 w-12 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
          </div>
        ))}
      </div>

      {/* Charts Pulse Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Charts Pulse Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
