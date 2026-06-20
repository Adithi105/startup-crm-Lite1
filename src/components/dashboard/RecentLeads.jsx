import { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * RecentLeads Component
 * Renders a clean list table showing the last 5 leads added to the CRM.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.leads - Array of lead data objects.
 * @returns {React.JSX.Element}
 */
export default function RecentLeads({ leads }) {
  // Sort leads by dateCreated (descending) and take top 5
  const latestLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => b.dateCreated.localeCompare(a.dateCreated) || b.id.localeCompare(a.id))
      .slice(0, 5);
  }, [leads]);

  // Resolves badge classes for lead status stages
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20";
      case "Contacted":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20";
      case "Qualified":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20";
      case "Proposal":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20";
      case "Won":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/20";
      case "Lost":
        return "bg-red-550 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-100 dark:border-gray-800";
    }
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs overflow-hidden flex flex-col">
      
      {/* Title */}
      <div className="mb-4 select-none">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Recently Logged Leads
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Newly added prospects requiring immediate follow-ups
        </p>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto -mx-5 -mb-5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold tracking-tight uppercase text-[9px] select-none">
              <th className="px-5 py-2.5">Lead Name</th>
              <th className="px-5 py-2.5">Company</th>
              <th className="px-5 py-2.5">Stage</th>
              <th className="px-5 py-2.5">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/80">
            {latestLeads.length > 0 ? (
              latestLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">
                    {lead.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {lead.company}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] ${getStatusBadgeStyle(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                    {lead.dateCreated}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No prospects logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

RecentLeads.propTypes = {
  leads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      dateCreated: PropTypes.string.isRequired
    })
  ).isRequired
};
