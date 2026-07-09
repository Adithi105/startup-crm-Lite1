/**
 * dateHelpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised date formatting utilities for the CRM frontend.
 *
 * All functions gracefully handle null / undefined / invalid inputs and return
 * a safe fallback ("—") so callers never need their own guards.
 *
 * Why a separate file?
 *   • Keeps formatting logic in one place — change the locale/style once and it
 *     propagates everywhere.
 *   • Avoids duplicating `new Date()` + `toLocaleDateString()` boilerplate across
 *     every component that displays a lead date.
 */

// ─── Locale & format options ──────────────────────────────────────────────────

/** The locale used for all date formatting across the CRM. */
const LOCALE = "en-US";

/** Short date format: "Jul 8, 2026" */
const SHORT_DATE_OPTIONS = {
  year:  "numeric",
  month: "short",
  day:   "numeric",
};

/** Long date format: "July 8, 2026" */
const LONG_DATE_OPTIONS = {
  year:  "numeric",
  month: "long",
  day:   "numeric",
};

/** Date + time format: "Jul 8, 2026, 2:31 PM" */
const DATETIME_OPTIONS = {
  year:   "numeric",
  month:  "short",
  day:    "numeric",
  hour:   "numeric",
  minute: "2-digit",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true only for Date objects that are actually valid (i.e. not
 * `Invalid Date` which is the result of `new Date(undefined)`).
 * @param {Date} d
 * @returns {boolean}
 */
const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

/**
 * Parses any reasonable date input (ISO string, Date object, timestamp number)
 * into a Date object, or returns null if the input is falsy / unparseable.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
const parseDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isValidDate(d) ? d : null;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Formats a createdAt (or any date) value into a short, human-readable string.
 * Falls back to "—" when the value is absent or cannot be parsed.
 *
 * Usage:
 *   formatDate(lead.createdAt)  →  "Jul 8, 2026"
 *   formatDate(null)            →  "—"
 *   formatDate(undefined)       →  "—"
 *   formatDate("bad string")    →  "—"
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export const formatDate = (value, fallback = "—") => {
  const d = parseDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, SHORT_DATE_OPTIONS);
};

/**
 * Formats a date value using the long month name.
 * Falls back to "—" when absent / unparseable.
 *
 * Usage:
 *   formatDateLong(lead.createdAt)  →  "July 8, 2026"
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export const formatDateLong = (value, fallback = "—") => {
  const d = parseDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString(LOCALE, LONG_DATE_OPTIONS);
};

/**
 * Formats a date value with both date and local time.
 * Falls back to "—" when absent / unparseable.
 *
 * Usage:
 *   formatDateTime(lead.createdAt)  →  "Jul 8, 2026, 2:31 PM"
 *
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export const formatDateTime = (value, fallback = "—") => {
  const d = parseDate(value);
  if (!d) return fallback;
  return d.toLocaleString(LOCALE, DATETIME_OPTIONS);
};

/**
 * Returns a YYYY-MM-DD ISO date string from a createdAt value.
 * Used internally by analytics helpers for lexicographic date comparisons.
 * Falls back to null when absent / unparseable.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {string|null}
 */
export const toISODateString = (value) => {
  const d = parseDate(value);
  if (!d) return null;
  // Build from local date components to avoid UTC-midnight shift
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
