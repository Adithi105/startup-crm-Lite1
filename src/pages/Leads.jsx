import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  X,
  Users,
  Filter,
  RotateCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useLeads } from "../context/LeadsContext";
import LeadForm, { STATUS_OPTIONS, SOURCE_OPTIONS } from "../components/leads/LeadForm";
import LeadCard from "../components/leads/LeadCard";
import LeadTable from "../components/leads/LeadTable";

// ─── Leads Page ─────────────────────────────────────────────────────────────
// Main leads directory page: assembles LeadCard grid, LeadTable, LeadForm
// modal, and all CRUD operations with React Hot Toast notifications.
//
// State:
//   leads[]          – from LeadsContext (persisted in localStorage)
//   isModalOpen      – controls the add/edit modal visibility
//   selectedLead     – null for create mode, a lead object for edit mode
//   viewMode         – "cards" (grid) | "table"
//   searchTerm       – text filter across name, company, email
//   statusFilter     – filter by pipeline status
//   sourceFilter     – filter by acquisition source

export default function Leads() {
  const { leads, addLead, updateLeadDetails, deleteLead } = useLeads();

  // ── View & Filter State ─────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  // ── Modal State ─────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // ── Keyboard shortcut: Escape closes modal ──────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen]);

  // ── Filter leads ────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Text search across name, company, and email
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        lead.name.toLowerCase().includes(term) ||
        lead.company.toLowerCase().includes(term) ||
        (lead.email && lead.email.toLowerCase().includes(term));

      // Status dropdown filter
      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      // Source dropdown filter
      const matchesSource =
        sourceFilter === "All" || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, searchTerm, statusFilter, sourceFilter]);

  // ── Quick Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total:   leads.length,
      active:  leads.filter((l) => !["Won", "Lost"].includes(l.status)).length,
      won:     leads.filter((l) => l.status === "Won").length,
      showing: filteredLeads.length,
    };
  }, [leads, filteredLeads]);

  const hasActiveFilters =
    searchTerm || statusFilter !== "All" || sourceFilter !== "All";

  // ── Modal Controls ──────────────────────────────────────────────────────

  /** Open modal in CREATE mode */
  const openCreateModal = useCallback(() => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }, []);

  /** Open modal in EDIT mode with pre-filled data */
  const openEditModal = useCallback((lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

  /** Close the modal and reset selected lead */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  // ── CRUD Handlers ───────────────────────────────────────────────────────

  /**
   * Handles form submission for both create and edit.
   * Determines mode via `selectedLead` presence.
   */
  const handleFormSubmit = useCallback(
    (formData) => {
      if (selectedLead) {
        // ── UPDATE existing lead ──────────────────────────────────────────
        updateLeadDetails(selectedLead.id, {
          name:    formData.name,
          company: formData.company,
          email:   formData.email,
          phone:   formData.phone,
          status:  formData.status,
          source:  formData.source,
        });
        toast.success(`${formData.name} updated successfully`, {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            border: "1px solid var(--border-main)",
            fontSize: "13px",
          },
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        });
      } else {
        // ── CREATE new lead ───────────────────────────────────────────────
        addLead({
          name:        formData.name,
          company:     formData.company,
          email:       formData.email,
          phone:       formData.phone,
          status:      formData.status,
          source:      formData.source,
          role:        "",
          value:       0,
          priority:    "Medium",
          owner:       "Alex Rivera",
          description: "",
        });
        toast.success(`${formData.name} added to pipeline`, {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            border: "1px solid var(--border-main)",
            fontSize: "13px",
          },
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        });
      }
      closeModal();
    },
    [selectedLead, addLead, updateLeadDetails, closeModal]
  );

  /**
   * Handle lead deletion with a confirmation check.
   * Shows red-themed toast on success.
   */
  const handleDeleteLead = useCallback(
    (leadId) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      if (window.confirm(`Are you sure you want to delete "${lead.name}"?`)) {
        deleteLead(leadId);
        toast.error(`${lead.name} removed from pipeline`, {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            border: "1px solid var(--border-main)",
            fontSize: "13px",
          },
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        });
      }
    },
    [leads, deleteLead]
  );

  /** Clear all active filters */
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSourceFilter("All");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Toast Notification Container ───────────────────────────────── */}
      <Toaster
        position="top-right"
        toastOptions={{ className: "shadow-lg" }}
      />

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Lead Pipeline
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {stats.total} total leads · {stats.active} active · {stats.won} won
          </p>
        </div>

        {/* Add Lead CTA */}
        <button
          id="add-lead-btn"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all duration-150 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Lead
        </button>
      </div>

      {/* ── Toolbar: Search + Filters + View Toggle ────────────────────── */}
      <div className="flex flex-col gap-3 bg-[var(--bg-surface)] p-3 border border-[var(--border-main)] rounded-xl shadow-sm">
        {/* Row 1: Search & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <Search size={14} />
            </div>
            <input
              id="lead-search"
              type="text"
              placeholder="Search by name, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* View mode segmented control */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-[var(--border-main)] self-start sm:self-auto shrink-0 select-none">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              }`}
              aria-pressed={viewMode === "cards"}
            >
              <LayoutGrid size={13} />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              }`}
              aria-pressed={viewMode === "table"}
            >
              <List size={13} />
              Table
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
            <Filter size={12} />
            Filters:
          </span>

          {/* Status Filter */}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] text-xs"
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            id="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] text-xs"
            aria-label="Filter by source"
          >
            <option value="All">All Sources</option>
            {SOURCE_OPTIONS.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-auto cursor-pointer"
            >
              <RotateCcw size={11} />
              Clear filters
            </button>
          )}

          {/* Result count */}
          <span className="text-[10px] text-[var(--text-secondary)] ml-auto tabular-nums">
            Showing {stats.showing} of {stats.total}
          </span>
        </div>
      </div>

      {/* ── Main Content: Cards Grid or Table ──────────────────────────── */}
      {viewMode === "cards" ? (
        /* ── Card Grid View ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={openEditModal}
                onDelete={handleDeleteLead}
              />
            ))
          ) : (
            /* Empty state for cards */
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Users size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold">No leads found</p>
              <p className="text-[10px] mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Click \"Add Lead\" to get started."}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Table View ─────────────────────────────────────────────────── */
        <LeadTable
          leads={filteredLeads}
          onEdit={openEditModal}
          onDelete={handleDeleteLead}
        />
      )}

      {/* ── Modal Overlay for Create / Edit Lead ───────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedLead ? `Edit ${selectedLead.name}` : "Add new lead"}
          onClick={(e) => {
            // Close on backdrop click (not on modal content click)
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* ── Modal Header ──────────────────────────────────────────── */}
            <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  {selectedLead ? "Edit Lead" : "Create New Lead"}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {selectedLead
                    ? `Editing ${selectedLead.name}'s record`
                    : "Add a new prospect to your pipeline."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Modal Body: LeadForm ──────────────────────────────────── */}
            <div className="p-6">
              <LeadForm
                initialData={selectedLead}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
