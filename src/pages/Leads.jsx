import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  X,
  Users,
  RotateCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useLeads } from "../context/LeadContext";
import LeadForm from "../components/leads/LeadForm";
import LeadCard from "../components/leads/LeadCard";
import LeadTable from "../components/leads/LeadTable";
import SearchBar from "../components/common/SearchBar";
import FilterBar from "../components/common/FilterBar";
import EmptyState from "../components/common/EmptyState";

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
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // ── View & Filter State ─────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // ── Modal State ─────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // ── Filter leads ────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => activeFilter === "All" || lead.status === activeFilter)
      .filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lead.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [leads, searchQuery, activeFilter]);

  // ── Quick Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total:   leads.length,
      active:  leads.filter((l) => !["Won", "Lost"].includes(l.status)).length,
      won:     leads.filter((l) => l.status === "Won").length,
      showing: filteredLeads.length,
    };
  }, [leads, filteredLeads]);

  const hasActiveFilters = searchQuery !== "" || activeFilter !== "All";

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

  // ── Keyboard shortcut: Escape closes modal ──────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen, closeModal]);

  // ── CRUD Handlers ───────────────────────────────────────────────────────

  /**
   * Handles form submission for both create and edit.
   * Determines mode via `selectedLead` presence.
   */
  const handleFormSubmit = useCallback(
    (formData) => {
      if (selectedLead) {
        // ── UPDATE existing lead ──────────────────────────────────────────
        updateLead(selectedLead.id, {
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
    [selectedLead, addLead, updateLead, closeModal]
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
    setSearchQuery("");
    setActiveFilter("All");
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
      <div className="flex flex-col gap-4 bg-[var(--bg-surface)] p-4 border border-[var(--border-main)] rounded-xl shadow-sm">
        {/* Row 1: Search & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

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

        {/* Row 2: Status Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-[var(--border-main)]/60">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            leads={leads}
          />

          <div className="flex items-center justify-between lg:justify-end gap-4 text-xs shrink-0">
            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw size={11} />
                Clear filters
              </button>
            )}

            {/* Result count */}
            <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
              Showing {stats.showing} of {stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content: Cards Grid or Table ──────────────────────────── */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          isFilterActive={hasActiveFilters}
          onClearFilters={clearFilters}
          totalLeadsCount={leads.length}
        />
      ) : viewMode === "cards" ? (
        /* ── Card Grid View ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={openEditModal}
              onDelete={handleDeleteLead}
            />
          ))}
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
