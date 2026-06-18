import React from "react";
import PropTypes from "prop-types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * StatsCard Component
 * Displays a metric with an icon, a large numeric value, and a percentage change status badge.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.title - The label/title of the metric.
 * @param {string|number} props.value - The current value of the metric.
 * @param {React.ComponentType} props.icon - The Lucide React icon component to render.
 * @param {string|number} props.change - The percentage change (e.g., "+12%" or "-5.4%").
 * @param {'primary'|'success'|'warning'|'danger'} props.color - Theme color variant mapping to UI tokens.
 * @returns {React.JSX.Element}
 */
export default function StatsCard({ title, value, icon: Icon, change, color }) {
  // Map color variant to specific Tailwind CSS classes
  const colorMap = {
    primary: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900/30"
    },
    success: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/30"
    },
    warning: {
      text: "text-amber-600 dark:text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-100 dark:border-amber-900/30"
    },
    danger: {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-100 dark:border-red-900/30"
    }
  };

  const activeTheme = colorMap[color] || colorMap.primary;
  
  // Determine if trend is positive, negative or neutral
  const changeStr = String(change);
  const isNegative = changeStr.startsWith("-");
  const isZero = changeStr.startsWith("0") || changeStr === "";

  return (
    <div className="flex flex-col justify-between p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200">
      
      {/* Top section: Title and Icon */}
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-tight select-none">
          {title}
        </span>
        <span className={`p-2 rounded-lg ${activeTheme.bg} ${activeTheme.text} border ${activeTheme.border} shrink-0`}>
          <Icon size={16} />
        </span>
      </div>

      {/* Bottom section: Value and Trend Change */}
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-1 select-none">
          {!isZero && (
            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isNegative 
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            }`}>
              {isNegative ? (
                <ArrowDownRight size={10} className="mr-0.5" />
              ) : (
                <ArrowUpRight size={10} className="mr-0.5" />
              )}
              {changeStr.replace(/^[+-]/, "")}
            </span>
          )}
          
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            vs last month
          </span>
        </div>
      </div>

    </div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(["primary", "success", "warning", "danger"]).isRequired
};
