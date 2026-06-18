import React from "react";
import PropTypes from "prop-types";
import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

// ─── LeadTable Component ────────────────────────────────────────────────────
// Tabular view of all leads with sortable-looking columns.
//
// Columns: Name, Company, Status, Email, Source, Date Added, Actions
//
// Props:
//   leads     (Array)    – Filtered array of lead objects to display.
//   onEdit    (Function) – Called with the full lead object on edit click.
//   onDelete  (Function) – Called with the lead id on delete click.

export default function LeadTable({ leads, onEdit, onDelete }) {
  return (
    <div className="premium-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          {/* ── Table Header ──────────────────────────────────────────────── */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[10px] select-none">
              <th className="p-4">Name</th>
              <th className="p-4">Company</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden md:table-cell">Email</th>
              <th className="p-4 hidden lg:table-cell">Source</th>
              <th className="p-4 hidden lg:table-cell">Date Added</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* ── Table Body ────────────────────────────────────────────────── */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="group hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors"
                >
                  {/* Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      {/* Mini avatar */}
                      <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {lead.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {lead.name}
                      </span>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="p-4 text-gray-500 dark:text-gray-400 font-medium truncate max-w-[150px]">
                    {lead.company}
                  </td>

                  {/* Status badge */}
                  <td className="p-4">
                    <StatusBadge status={lead.status} size="sm" />
                  </td>

                  {/* Email (hidden on small screens) */}
                  <td className="p-4 hidden md:table-cell text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {lead.email || "—"}
                  </td>

                  {/* Source (hidden on small/medium screens) */}
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                      {lead.source || "—"}
                    </span>
                  </td>

                  {/* Date Added (hidden on small/medium screens) */}
                  <td className="p-4 hidden lg:table-cell text-gray-500 dark:text-gray-400 font-medium">
                    {lead.dateCreated || "—"}
                  </td>

                  {/* Action buttons */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity duration-150">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        aria-label={`Edit ${lead.name}`}
                        title="Edit lead"
                        className="p-3 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(lead.id)}
                        aria-label={`Delete ${lead.name}`}
                        title="Delete lead"
                        className="p-3 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/40 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* Empty state */
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-16 text-xs text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </div>
                    <p className="font-medium">No leads found</p>
                    <p className="text-[10px]">
                      Try adjusting your filters or add a new lead.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

LeadTable.propTypes = {
  leads: PropTypes.arrayOf(
    PropTypes.shape({
      id:          PropTypes.string.isRequired,
      name:        PropTypes.string.isRequired,
      company:     PropTypes.string.isRequired,
      email:       PropTypes.string,
      status:      PropTypes.string.isRequired,
      source:      PropTypes.string,
      dateCreated: PropTypes.string,
    })
  ).isRequired,
  /** Called with the full lead object when the edit icon is clicked */
  onEdit:   PropTypes.func.isRequired,
  /** Called with the lead ID when the delete icon is clicked */
  onDelete: PropTypes.func.isRequired,
};
