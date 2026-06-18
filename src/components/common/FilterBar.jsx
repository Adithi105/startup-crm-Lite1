import PropTypes from "prop-types";

/**
 * FilterBar - A row of status filter buttons displaying lead counts.
 *
 * Props:
 *   activeFilter   (String)   - Currently selected status filter.
 *   onFilterChange (Function) - Callback fired when a status button is clicked.
 *   leads          (Array)    - Full array of lead objects to calculate status counts.
 */
const STATUSES = [
  "All",
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Proposal Sent",
  "Won",
  "Lost",
];

export default function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  /** Calculate total leads matching specific status */
  const getCountForFilter = (status) => {
    if (status === "All") return leads.length;
    return leads.filter((lead) => lead.status === status).length;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {STATUSES.map((status) => {
        const isActive = activeFilter === status;
        const count = getCountForFilter(status);

        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ease-in-out cursor-pointer ${
              isActive
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--text-main)]"
            }`}
          >
            {status}
            <span
              className={`ml-1.5 text-[10px] tabular-nums transition-colors duration-200 ${
                isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}

FilterBar.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  leads: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
    })
  ),
};
