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
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {status}
            <span
              className={`ml-1.5 text-[10px] tabular-nums transition-colors duration-200 ${
                isActive ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
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
