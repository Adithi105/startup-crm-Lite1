import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Plus, ListFilter, Download } from "lucide-react";

/**
 * QuickActions Component
 * Renders key actionable buttons for adding a new lead, navigating to directory views, and exporting lead metrics.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onAddLeadClick - Callback function triggered when "Add New Lead" is clicked.
 * @param {Array<Object>} props.leads - Current list of leads to compile for export downloading.
 * @returns {React.JSX.Element}
 */
export default function QuickActions({ onAddLeadClick, leads }) {
  
  /**
   * Compiles leads list into CSV format and initiates browser download
   */
  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Lead ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Role",
      "Deal Value ($)",
      "Stage",
      "Priority",
      "Source",
      "Owner",
      "Date Created"
    ];

    const rows = leads.map(lead => [
      lead.id,
      `"${(lead.name || "").replace(/"/g, '""')}"`,
      lead.email || "",
      lead.phone || "",
      `"${(lead.company || "").replace(/"/g, '""')}"`,
      `"${(lead.role || "").replace(/"/g, '""')}"`,
      lead.value || 0,
      lead.status,
      lead.priority,
      lead.source,
      `"${(lead.owner || "").replace(/"/g, '""')}"`,
      lead.dateCreated
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `salesflow_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
      
      {/* Title */}
      <div className="mb-4 select-none">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Execute common CRM operations instantly
        </p>
      </div>

      {/* Button deck */}
      <div className="flex flex-col gap-2.5">
        
        {/* Add Lead */}
        <button
          onClick={onAddLeadClick}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer active:scale-[0.99] transition-all"
        >
          <span className="flex items-center gap-2">
            <Plus size={14} /> Add New Lead
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] bg-blue-700 text-blue-200 rounded border border-blue-500/35">
            Alt + N
          </kbd>
        </button>

        {/* View Directory */}
        <Link
          to="/leads"
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
        >
          <ListFilter size={14} className="text-gray-500 dark:text-gray-400" />
          View All Leads
        </Link>

        {/* Export Data */}
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
        >
          <Download size={14} className="text-gray-500 dark:text-gray-400" />
          Export Data (CSV)
        </button>

      </div>

    </div>
  );
}

QuickActions.propTypes = {
  onAddLeadClick: PropTypes.func.isRequired,
  leads: PropTypes.arrayOf(PropTypes.object).isRequired
};
