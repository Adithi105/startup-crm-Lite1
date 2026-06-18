import PropTypes from "prop-types";
import { CalendarRange, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { key: "7days",   label: "Last 7 Days",  short: "7D" },
  { key: "30days",  label: "Last 30 Days", short: "30D" },
  { key: "90days",  label: "Last 90 Days", short: "90D" },
  { key: "thisYear",label: "This Year",    short: "YTD" },
  { key: "custom",  label: "Custom Range", short: "Custom" },
];

export default function AnalyticsFilters({
  timePeriod,
  setTimePeriod,
  customRange,
  setCustomRange,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDateChange = (field, value) => {
    setCustomRange((prev) => ({ ...prev, [field]: value }));
  };

  const activeOption = OPTIONS.find((o) => o.key === timePeriod) || OPTIONS[1];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">

      {/* ── Desktop pill strip ─────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60">
        {OPTIONS.map((opt) => {
          const isActive = timePeriod === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setTimePeriod(opt.key)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/80 dark:border-gray-600/50"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── Mobile dropdown ────────────────────────────────────── */}
      <div className="relative sm:hidden" ref={dropdownRef}>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm w-full justify-between"
        >
          <span className="flex items-center gap-1.5">
            <CalendarRange size={13} className="text-blue-500 shrink-0" />
            {activeOption.label}
          </span>
          <ChevronDown size={13} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setTimePeriod(opt.key); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  timePeriod === opt.key
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Custom Date Range Inputs ──────────────────────────── */}
      {timePeriod === "custom" && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-[10px] text-gray-400 font-semibold shrink-0">From</span>
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-semibold text-gray-700 dark:text-gray-300 border-none cursor-pointer"
            />
          </div>
          <span className="text-gray-350 dark:text-gray-600 font-bold text-sm">→</span>
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-[10px] text-gray-400 font-semibold shrink-0">To</span>
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-semibold text-gray-700 dark:text-gray-300 border-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

AnalyticsFilters.propTypes = {
  timePeriod: PropTypes.string.isRequired,
  setTimePeriod: PropTypes.func.isRequired,
  customRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  setCustomRange: PropTypes.func.isRequired,
};
