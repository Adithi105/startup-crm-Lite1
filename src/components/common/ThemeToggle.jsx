import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeToggle - A premium, animated toggle switch that allows users
 * to transition the application between light and dark themes.
 * Supports keyboard accessibility and screen readers.
 *
 * @component
 * @returns {React.JSX.Element}
 */
export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDarkMode}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer"
      aria-label="Toggle theme mode"
    >
      {/* Switch Track */}
      <div className="relative w-9 h-5.5 bg-gray-100 dark:bg-gray-900/60 rounded-full p-0.5 transition-colors duration-300">
        {/* Sliding Thumb */}
        <div
          className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center transition-all duration-300 transform ${
            isDarkMode ? "translate-x-3.5" : "translate-x-0"
          }`}
        >
          {isDarkMode ? (
            <Moon size={10} className="text-blue-400" />
          ) : (
            <Sun size={10} className="text-amber-500" />
          )}
        </div>
      </div>
      
      {/* Label indicating the active mode */}
      <span className="text-xs font-semibold select-none leading-none tracking-tight">
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
