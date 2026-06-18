import PropTypes from "prop-types";
import { Users, Search, RotateCcw } from "lucide-react";

/**
 * EmptyState - Displays a fallback layout when there are no leads.
 * Shows different visuals/messages based on whether the pipeline itself is empty or search/filter returned no results.
 *
 * Props:
 *   isFilterActive   (Boolean)  - True if filters or search are currently active.
 *   onClearFilters   (Function) - Action to clear active search and filters.
 *   totalLeadsCount  (Number)   - Total count of leads in the database.
 */
export default function EmptyState({ isFilterActive, onClearFilters, totalLeadsCount }) {
  const isPipelineEmpty = totalLeadsCount === 0;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 premium-card bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl py-16 animate-in fade-in duration-200">
      {isPipelineEmpty ? (
        <>
          {/* Visual indicator for empty pipeline */}
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <Users size={28} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">
            Your pipeline is empty
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-normal">
            Get started by adding your first prospect. Track your sales lifecycle from lead to won!
          </p>
        </>
      ) : (
        <>
          {/* Visual indicator for empty search/filter results */}
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
            <Search size={24} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">
            No leads found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mb-4 leading-normal">
            No leads match your current search or filter criteria. Try adjusting your settings.
          </p>
          {isFilterActive && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all duration-150 cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <RotateCcw size={13} />
              Clear Filters
            </button>
          )}
        </>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  isFilterActive: PropTypes.bool.isRequired,
  onClearFilters: PropTypes.func,
  totalLeadsCount: PropTypes.number.isRequired,
};
