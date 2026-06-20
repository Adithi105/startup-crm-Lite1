import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { useUser } from "../context/UserContext";
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
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const leadIdParam = searchParams.get("id");

  // ── View & Filter State ─────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // ── Modal State ─────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // ── Derived State from URL lead ID parameter ────────────────────────────
  const leadFromParam = useMemo(() => {
    return leadIdParam ? leads.find((l) => l.id === leadIdParam) : null;
  }, [leadIdParam, leads]);

  const displayLead = selectedLead || leadFromParam;
  const showModal = isModalOpen || Boolean(leadFromParam);

  // ── Effect: Scroll and highlight lead on parameter match ────────────────
  useEffect(() => {
    if (leadIdParam) {
      setTimeout(() => {
        const cardEl = document.getElementById(`lead-card-${leadIdParam}`);
        const rowEl = document.getElementById(`lead-row-${leadIdParam}`);
        [cardEl, rowEl].forEach((targetEl) => {
          if (targetEl && targetEl.offsetParent !== null) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
            targetEl.classList.add("ring-2", "ring-blue-500", "ring-offset-2", "dark:ring-offset-gray-900");
            setTimeout(() => {
              targetEl.classList.remove("ring-2", "ring-blue-500", "ring-offset-2", "dark:ring-offset-gray-900");
            }, 3000);
          }
        });
      }, 100);
    }
  }, [leadIdParam]);

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
    if (searchParams.has("id")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("id");
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // ── Keyboard shortcut: Escape closes modal ──────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && showModal) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal, closeModal]);

  // ── CRUD Handlers ───────────────────────────────────────────────────────

  /**
   * Handles form submission for both create and edit.
   * Determines mode via `selectedLead` presence.
   */
  const handleFormSubmit = useCallback(
    (formData) => {
      const isDark = document.documentElement.classList.contains("dark");
      const toastStyle = {
        borderRadius: "10px",
        background: isDark ? "#1f2937" : "#fff",
        color: isDark ? "#fff" : "#111827",
        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        fontSize: "13px",
      };

      if (displayLead) {
        // ── UPDATE existing lead ──────────────────────────────────────────
        updateLead(displayLead.id, {
          name:    formData.name,
          company: formData.company,
          email:   formData.email,
          phone:   formData.phone,
          status:  formData.status,
          source:  formData.source,
        });
        toast.success(`${formData.name} updated successfully`, {
          duration: 3000,
          style: toastStyle,
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
          owner:       user?.name || "C Adithi",
          description: "",
        });
        toast.success(`${formData.name} added to pipeline`, {
          duration: 3000,
          style: toastStyle,
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        });
      }
      closeModal();
    },
    [displayLead, addLead, updateLead, closeModal, user]
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
        const isDark = document.documentElement.classList.contains("dark");
        deleteLead(leadId);
        toast.error(`${lead.name} removed from pipeline`, {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: isDark ? "#1f2937" : "#fff",
            color: isDark ? "#fff" : "#111827",
            border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Lead Pipeline
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        {/* Row 1: Search & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* View mode segmented control */}
          {/* View mode segmented control (Tablet only - hybrid layout toggle) */}
          <div className="hidden md:flex lg:hidden bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700 self-start sm:self-auto shrink-0 select-none">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-pressed={viewMode === "table"}
            >
              <List size={13} />
              Table
            </button>
          </div>
        </div>

        {/* Row 2: Status Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-gray-200 dark:border-gray-700">
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
            <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
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
      ) : (
        <>
          {/* ── Card Grid View (Visible on mobile, on tablet if viewMode === "cards", hidden on desktop) ── */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden ${viewMode === "cards" ? "block" : "block md:hidden"}`}>
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={openEditModal}
                onDelete={handleDeleteLead}
              />
            ))}
          </div>

          {/* ── Table View (Hidden on mobile, on tablet if viewMode === "table", always visible on desktop) ── */}
          <div className={viewMode === "table" ? "hidden md:block" : "hidden lg:block"}>
            <LeadTable
              leads={filteredLeads}
              onEdit={openEditModal}
              onDelete={handleDeleteLead}
            />
          </div>
        </>
      )}

      {/* ── Modal Overlay for Create / Edit Lead - Full screen on mobile, centered modal max-w-lg on tablet+ ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={displayLead ? `Edit ${displayLead.name}` : "Add new lead"}
          onClick={(e) => {
            // Close on backdrop click (not on modal content click)
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white dark:bg-gray-800 border-none md:border md:border-gray-200 md:dark:border-gray-700 rounded-none md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* ── Modal Header ──────────────────────────────────────────── */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 h-16">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {displayLead ? "Edit Lead" : "Create New Lead"}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {displayLead
                    ? `Editing ${displayLead.name}'s record`
                    : "Add a new prospect to your pipeline."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Modal Body: LeadForm ──────────────────────────────────── */}
            <div className="p-6 flex-1 overflow-y-auto pb-24 md:pb-6">
              <LeadForm
                initialData={displayLead}
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
