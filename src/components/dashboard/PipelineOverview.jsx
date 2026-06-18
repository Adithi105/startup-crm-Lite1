import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * PipelineOverview Component
 * Renders a segmented horizontal bar chart representing the distribution of leads across pipeline stages.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.leads - Array of lead data objects.
 * @returns {React.JSX.Element}
 */
export default function PipelineOverview({ leads }) {
  const stages = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

  // Colors matching the designated palette requirements
  const stageStyles = {
    New: { bg: "bg-blue-600", text: "text-blue-600 dark:text-blue-400" },
    Contacted: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-500" },
    Qualified: { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    Proposal: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    Won: { bg: "bg-green-500", text: "text-green-600 dark:text-green-400" },
    Lost: { bg: "bg-red-550 bg-red-500", text: "text-red-600 dark:text-red-400" }
  };

  // Compile calculations
  const overviewData = useMemo(() => {
    const totalLeads = leads.length;
    if (totalLeads === 0) {
      return stages.map(stage => ({ name: stage, count: 0, percentage: 0 }));
    }

    return stages.map(stage => {
      const count = leads.filter(l => l.status === stage).length;
      const percentage = Math.round((count / totalLeads) * 100);
      return {
        name: stage,
        count,
        percentage
      };
    });
  }, [leads]);

  const totalLeadsCount = leads.length;

  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
      
      {/* Title */}
      <div className="flex justify-between items-center mb-4 select-none">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Pipeline Distribution
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            Stage shares across {totalLeadsCount} recorded leads
          </p>
        </div>
      </div>

      {/* Segmented Horizontal Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-900 h-3 rounded-full overflow-hidden flex mb-5 select-none">
        {totalLeadsCount > 0 ? (
          overviewData.map((seg) => {
            if (seg.count === 0) return null;
            const style = stageStyles[seg.name] || { bg: "bg-gray-400" };
            return (
              <div
                key={seg.name}
                className={`${style.bg} h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${seg.percentage}%` }}
                title={`${seg.name}: ${seg.count} leads (${seg.percentage}%)`}
              />
            );
          })
        ) : (
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-full rounded-full" />
        )}
      </div>

      {/* Grid Legend Breakdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {overviewData.map((seg) => {
          const style = stageStyles[seg.name] || { bg: "bg-gray-400", text: "text-gray-400" };
          return (
            <div 
              key={seg.name}
              className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 select-none">
                <span className={`w-2 h-2 rounded-full ${style.bg}`} />
                <span className="truncate">{seg.name}</span>
              </div>
              
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {seg.count}
                </span>
                <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                  {seg.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

PipelineOverview.propTypes = {
  leads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired
};
