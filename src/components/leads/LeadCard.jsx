import React from "react";
import PropTypes from "prop-types";
import { Pencil, Trash2, Mail, Phone, Building2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

// ─── LeadCard Component ─────────────────────────────────────────────────────
// Displays a single lead's summary in a rich card format.
//
// Shows at a glance: avatar with initials, name, company, status badge,
// email, and phone. Provides Edit (pencil) and Delete (trash) action buttons
// that appear on hover for a clean, uncluttered default view.
//
// Props:
//   lead      (Object)    – The lead data object (id, name, company, email, etc.)
//   onEdit    (Function)  – Called with the full lead object when Edit is clicked.
//   onDelete  (Function)  – Called with the lead id when Delete is clicked.

/**
 * Map status → avatar ring color for visual identity at a glance.
 */
const RING_COLORS = {
  New:                 "ring-slate-300   dark:ring-slate-600",
  Contacted:           "ring-amber-300   dark:ring-amber-700",
  "Meeting Scheduled": "ring-violet-300  dark:ring-violet-700",
  "Proposal Sent":     "ring-indigo-300  dark:ring-indigo-700",
  Won:                 "ring-emerald-300 dark:ring-emerald-700",
  Lost:                "ring-red-300     dark:ring-red-700",
};

const BG_COLORS = {
  New:                 "bg-slate-100   text-slate-600   dark:bg-slate-800  dark:text-slate-300",
  Contacted:           "bg-amber-50    text-amber-700   dark:bg-amber-900/30 dark:text-amber-400",
  "Meeting Scheduled": "bg-violet-50   text-violet-700  dark:bg-violet-900/30 dark:text-violet-400",
  "Proposal Sent":     "bg-indigo-50   text-indigo-700  dark:bg-indigo-900/30 dark:text-indigo-400",
  Won:                 "bg-emerald-50  text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Lost:                "bg-red-50      text-red-700     dark:bg-red-900/30 dark:text-red-400",
};

const DEFAULT_RING = "ring-slate-200 dark:ring-slate-700";
const DEFAULT_BG   = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

export default function LeadCard({ lead, onEdit, onDelete }) {
  // Derive initials for the avatar (up to 2 chars)
  const initials = lead.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ringCls = RING_COLORS[lead.status] || DEFAULT_RING;
  const bgCls   = BG_COLORS[lead.status]   || DEFAULT_BG;

  // Decorative accent bar color at the top of the card
  const accentColor =
    lead.status === "Won"
      ? "bg-emerald-400"
      : lead.status === "Lost"
      ? "bg-red-400"
      : lead.status === "New"
      ? "bg-slate-300 dark:bg-slate-600"
      : "bg-blue-400";

  return (
    <article
      className="premium-card premium-card-hover group flex flex-col gap-4 p-4 relative overflow-hidden"
      aria-label={`Lead card for ${lead.name}`}
    >
      {/* ── Decorative top accent bar (status-colored) ──────────────────── */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 opacity-60 ${accentColor}`}
        aria-hidden="true"
      />

      {/* ── Header: Avatar + Name + Actions ────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar circle with status-aware ring */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-2 ${ringCls} ${bgCls}`}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* Name + Company */}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[var(--text-main)] truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {lead.name}
            </h3>
            <p className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
              <Building2 size={10} className="shrink-0" />
              {lead.company}
            </p>
          </div>
        </div>

        {/* Action buttons – visible on hover / focus for clean UI */}
        <div
          className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
          role="group"
          aria-label={`Actions for ${lead.name}`}
        >
          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEdit(lead)}
            aria-label={`Edit ${lead.name}`}
            title="Edit lead"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <Pencil size={13} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            aria-label={`Delete ${lead.name}`}
            title="Delete lead"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Status Badge ───────────────────────────────────────────────── */}
      <div>
        <StatusBadge status={lead.status} />
      </div>

      {/* ── Contact info ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 text-xs text-[var(--text-secondary)] border-t border-[var(--border-main)] pt-3 mt-auto">
        {/* Email link */}
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
          aria-label={`Email ${lead.name} at ${lead.email}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail size={11} className="shrink-0 text-slate-400" />
          <span className="truncate">{lead.email || "—"}</span>
        </a>

        {/* Phone link */}
        <a
          href={lead.phone ? `tel:${lead.phone}` : undefined}
          className={`flex items-center gap-2 truncate ${
            lead.phone
              ? "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              : "opacity-50 cursor-default"
          }`}
          aria-label={lead.phone ? `Call ${lead.name} at ${lead.phone}` : "No phone number"}
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={11} className="shrink-0 text-slate-400" />
          <span className="truncate">{lead.phone || "No phone number"}</span>
        </a>
      </div>

      {/* ── Source tag (bottom-right) ───────────────────────────────────── */}
      {lead.source && (
        <div className="absolute bottom-3 right-3">
          <span className="text-[9px] font-semibold text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-[var(--border-main)]">
            {lead.source}
          </span>
        </div>
      )}
    </article>
  );
}

LeadCard.propTypes = {
  lead: PropTypes.shape({
    id:      PropTypes.string.isRequired,
    name:    PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    email:   PropTypes.string,
    phone:   PropTypes.string,
    status:  PropTypes.string.isRequired,
    source:  PropTypes.string,
  }).isRequired,
  /** Called with the full lead object when the edit button is clicked */
  onEdit:   PropTypes.func.isRequired,
  /** Called with the lead ID when the delete button is clicked */
  onDelete: PropTypes.func.isRequired,
};
