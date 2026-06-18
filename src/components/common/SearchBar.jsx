import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, X } from "lucide-react";

/**
 * SearchBar - A controlled search input component with debounced filter logic.
 *
 * Props:
 *   value    (String)   - The current search term applied.
 *   onChange (Function) - Callback fired with the new search term after 300ms debounce.
 */
export default function SearchBar({ value, onChange }) {
  const [prevValue, setPrevValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);

  // Sync local input value if prop changes from outside (e.g. cleared filters)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  // Debounce the call to onChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  /** Instantly clear the search and notify the parent */
  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1 max-w-sm w-full">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search size={14} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search by name, company, or email..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        aria-label="Search leads by name, company, or email"
        className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 text-[var(--text-main)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-150"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-150 cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
