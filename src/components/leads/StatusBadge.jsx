import PropTypes from "prop-types";

// ─── StatusBadge Component ──────────────────────────────────────────────────
// Renders a pill-shaped, colored badge for a lead's current pipeline status.
// Each status has a curated light/dark palette with a leading dot indicator.
//
// Props:
//   status  (string)            – One of the CRM pipeline status values.
//   size    ("sm" | "md")       – Controls padding & font size. Defaults to "md".

/**
 * Color map – keeps the switch/case in one place so both the badge
 * background AND the dot indicator pull from the same source of truth.
 */
const STATUS_STYLES = {
  // ──── Active pipeline stages ──────────────────────────────────────────────
  New: {
    badge: "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700",
    dot:   "bg-gray-400",
  },
  Contacted: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40",
    dot:   "bg-amber-500",
  },
  "Meeting Scheduled": {
    badge: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/40",
    dot:   "bg-violet-500",
  },
  "Proposal Sent": {
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/40",
    dot:   "bg-indigo-500",
  },
  // ──── Terminal stages ─────────────────────────────────────────────────────
  Won: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40",
    dot:   "bg-emerald-500",
  },
  Lost: {
    badge: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40",
    dot:   "bg-red-500",
  },
};

/** Fallback for any unknown / legacy status values */
const DEFAULT_STYLE = {
  badge: "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  dot:   "bg-gray-400",
};

export default function StatusBadge({ status, size = "md" }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;

  // Size-based spacing – "sm" is used in tables, "md" on cards / detail views
  const sizeClasses =
    size === "sm"
      ? "text-[9px] px-1.5 py-0.5 gap-1"
      : "text-[10px] px-2.5 py-1 gap-1.5";

  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full select-none ${sizeClasses} ${style.badge}`}
      aria-label={`Status: ${status}`}
    >
      {/* Colored dot indicator */}
      <span
        className={`rounded-full shrink-0 ${dotSize} ${style.dot}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  /** The pipeline status string to display */
  status: PropTypes.string.isRequired,
  /** Visual density: "sm" for compact (tables), "md" for standard (cards) */
  size: PropTypes.oneOf(["sm", "md"]),
};
