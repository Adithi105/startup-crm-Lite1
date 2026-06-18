import PropTypes from "prop-types";
import { BarChart3, Plus } from "lucide-react";

export default function EmptyAnalyticsState({ onAddLead }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm animate-in fade-in duration-200">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full mb-4 shrink-0 shadow-sm">
        <BarChart3 size={32} />
      </div>
      
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        No analytics available yet
      </h3>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">
        Add your first lead to start tracking business performance, pipelines, conversions, and revenue forecasts.
      </p>

      {onAddLead && (
        <button
          onClick={onAddLead}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-500/10 transition-all duration-150 cursor-pointer"
        >
          <Plus size={14} />
          Add Lead
        </button>
      )}
    </div>
  );
}

EmptyAnalyticsState.propTypes = {
  onAddLead: PropTypes.func,
};
