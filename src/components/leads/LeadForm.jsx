import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { User, Building2, Mail, Phone, Tag, Zap, AlertCircle, X } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────
// Exported so other components (e.g. LeadTable filters) can reuse them.

/** All valid lead pipeline stages */
export const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Proposal Sent",
  "Won",
  "Lost",
];

/** All valid lead acquisition sources */
export const SOURCE_OPTIONS = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Call",
  "Email Campaign",
  "Other",
];

/** Empty form state – used for both initializing and resetting */
const EMPTY_FORM = {
  name:    "",
  company: "",
  email:   "",
  phone:   "",
  status:  "New",
  source:  "Website",
};

// ─── Sub-component: FormField ───────────────────────────────────────────────

/**
 * FormField – Accessible labeled input wrapper with icon and validation error.
 * Keeps the main form markup DRY and consistent.
 */
function FormField({ id, label, required, error, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
      >
        {Icon && <Icon size={12} className="shrink-0" />}
        {label}
        {required && (
          <span className="text-red-500 font-bold" aria-hidden="true">*</span>
        )}
      </label>

      {/* Input slot (rendered via children) */}
      {children}

      {/* Inline validation error */}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1 text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  id:       PropTypes.string.isRequired,
  label:    PropTypes.string.isRequired,
  required: PropTypes.bool,
  error:    PropTypes.string,
  icon:     PropTypes.elementType,
  children: PropTypes.node.isRequired,
};

// ─── Input class builder ────────────────────────────────────────────────────

/**
 * Returns a merged Tailwind class string for text inputs and selects.
 * Toggles between blue focus ring (normal) and red ring (error state).
 */
const inputCls = (hasError = false) =>
  [
    "w-full px-3 py-3 md:py-2 min-h-[44px] md:min-h-0 text-xs rounded-lg border transition-all duration-150",
    "bg-gray-50 dark:bg-gray-900",
    "focus:outline-none focus:ring-2 focus:border-transparent",
    "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
    hasError
      ? "border-red-400 focus:ring-red-400/40"
      : "border-gray-200 dark:border-gray-700 focus:ring-blue-500/40 focus:border-blue-500",
  ].join(" ");

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * LeadForm Component
 *
 * Validated form for creating or editing a CRM lead.
 *
 * Modes:
 *  - CREATE: `initialData` is null/undefined → empty form, "Add Lead" button.
 *  - EDIT:   `initialData` is a lead object → pre-filled fields, "Save Changes" button.
 *
 * @param {Object}   [props.initialData]  Pre-fill data for edit mode.
 * @param {Function} props.onSubmit       Receives the validated, trimmed form data.
 * @param {Function} props.onCancel       Called when the user cancels.
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  const isEditMode = Boolean(initialData);

  // ── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);

  /**
   * Sync form state with initialData whenever the prop changes.
   * Normalises legacy status/source values that might not match the new options.
   */
  useEffect(() => {
    if (initialData) {
      setForm({
        name:    initialData.name    || "",
        company: initialData.company || "",
        email:   initialData.email   || "",
        phone:   initialData.phone   || "",
        status:  STATUS_OPTIONS.includes(initialData.status)
                   ? initialData.status
                   : "New",
        source:  SOURCE_OPTIONS.includes(initialData.source)
                   ? initialData.source
                   : "Other",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  // ── Validation ──────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  /** Generic field change handler – updates value and clears its error */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** Validates required fields. Returns error map (empty = valid). */
  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = "Full name is required.";
    if (!form.company.trim()) errs.company = "Company name is required.";
    if (!form.email.trim())   errs.email   = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    return errs;
  };

  /** Submit handler – validates, then passes clean data upstream */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Focus the first invalid field for keyboard accessibility
      const firstErrField = Object.keys(errs)[0];
      document.getElementById(`lead-form-${firstErrField}`)?.focus();
      return;
    }
    onSubmit({
      ...form,
      name:    form.name.trim(),
      company: form.company.trim(),
      email:   form.email.trim(),
      phone:   form.phone.trim(),
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={isEditMode ? "Edit lead form" : "Create new lead form"}
      className="flex flex-col gap-5"
    >
      {/* ── Row 1: Name + Company ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <FormField
          id="lead-form-name"
          label="Full Name"
          required
          error={errors.name}
          icon={User}
        >
          <input
            id="lead-form-name"
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="e.g. Sarah Jenkins"
            autoComplete="name"
            autoFocus
            aria-required="true"
            aria-describedby={errors.name ? "lead-form-name-error" : undefined}
            className={inputCls(Boolean(errors.name))}
          />
        </FormField>

        {/* Company */}
        <FormField
          id="lead-form-company"
          label="Company"
          required
          error={errors.company}
          icon={Building2}
        >
          <input
            id="lead-form-company"
            type="text"
            value={form.company}
            onChange={handleChange("company")}
            placeholder="e.g. Acme Corp"
            autoComplete="organization"
            aria-required="true"
            className={inputCls(Boolean(errors.company))}
          />
        </FormField>
      </div>

      {/* ── Row 2: Email + Phone ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <FormField
          id="lead-form-email"
          label="Email Address"
          required
          error={errors.email}
          icon={Mail}
        >
          <input
            id="lead-form-email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="john@company.com"
            autoComplete="email"
            aria-required="true"
            className={inputCls(Boolean(errors.email))}
          />
        </FormField>

        {/* Phone (optional) */}
        <FormField
          id="lead-form-phone"
          label="Phone Number"
          icon={Phone}
        >
          <input
            id="lead-form-phone"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            className={inputCls()}
          />
        </FormField>
      </div>

      {/* ── Row 3: Status + Source ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status Dropdown */}
        <FormField
          id="lead-form-status"
          label="Pipeline Status"
          required
          icon={Tag}
        >
          <select
            id="lead-form-status"
            value={form.status}
            onChange={handleChange("status")}
            aria-required="true"
            className={inputCls()}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormField>

        {/* Source Dropdown */}
        <FormField
          id="lead-form-source"
          label="Lead Source"
          required
          icon={Zap}
        >
          <select
            id="lead-form-source"
            value={form.source}
            onChange={handleChange("source")}
            aria-required="true"
            className={inputCls()}
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* ── Required fields notice ──────────────────────────────────────── */}
      <p className="text-[10px] text-gray-500 dark:text-gray-400">
        Fields marked with <span className="text-red-500 font-bold">*</span> are required.
      </p>

      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <div className="flex justify-end items-center gap-2.5 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-4 h-11 md:h-9 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-150 cursor-pointer"
        >
          <X size={13} />
          Cancel
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-5 h-11 md:h-9 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-500/20 transition-all duration-150 cursor-pointer"
        >
          {isEditMode ? "Save Changes" : "Add Lead"}
        </button>
      </div>
    </form>
  );
}

LeadForm.propTypes = {
  /** Pre-fill data when editing. Omit (or pass null) for create mode. */
  initialData: PropTypes.shape({
    name:    PropTypes.string,
    company: PropTypes.string,
    email:   PropTypes.string,
    phone:   PropTypes.string,
    status:  PropTypes.string,
    source:  PropTypes.string,
  }),
  /** Receives the validated & cleaned form data on submit. */
  onSubmit: PropTypes.func.isRequired,
  /** Called when user clicks Cancel or closes the modal. */
  onCancel: PropTypes.func.isRequired,
};
