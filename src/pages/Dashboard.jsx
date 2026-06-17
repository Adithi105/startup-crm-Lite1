import React, { useState, useMemo } from "react";
import { useLeads } from "../context/LeadsContext";
import StatsCard from "../components/dashboard/StatsCard";
import PipelineOverview from "../components/dashboard/PipelineOverview";
import RecentLeads from "../components/dashboard/RecentLeads";
import QuickActions from "../components/dashboard/QuickActions";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  X 
} from "lucide-react";

/**
 * Dashboard Page Component
 * Assembles the stats metric grid, pipeline overview horizontal charts, recent leads lists,
 * and quick action control panels into a responsive grid canvas.
 * 
 * @component
 * @returns {React.JSX.Element}
 */
export default function Dashboard() {
  const { leads, addLead, getStats } = useLeads();
  
  // Local state for dashboard lead modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    value: "",
    status: "New",
    priority: "Medium",
    source: "Inbound",
    owner: "Alex Rivera"
  });

  const stats = getStats();

  // Calculate dynamic stats
  const winRate = useMemo(() => {
    const closed = leads.filter(l => l.status === "Won" || l.status === "Lost").length;
    const won = leads.filter(l => l.status === "Won").length;
    return closed > 0 ? Math.round((won / closed) * 100) : 0;
  }, [leads]);

  // Handle modal form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.company) return;

    addLead({
      ...form,
      value: Number(form.value) || 0
    });

    // Reset form and close
    setForm({
      name: "",
      company: "",
      email: "",
      value: "",
      status: "New",
      priority: "Medium",
      source: "Inbound",
      owner: "Alex Rivera"
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Workspace Dashboard
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            High-level metrics and active workflows for your sales pipelines
          </p>
        </div>
      </div>

      {/* 4-Column Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalCount}
          icon={Users}
          change="+12.5%"
          color="primary"
        />
        <StatsCard
          title="Active Opportunities"
          value={stats.activeCount}
          icon={Briefcase}
          change="+8.3%"
          color="warning"
        />
        <StatsCard
          title="Won Value"
          value={`$${stats.wonValue.toLocaleString()}`}
          icon={DollarSign}
          change="+18.4%"
          color="success"
        />
        <StatsCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={TrendingUp}
          change="+5.0%"
          color="danger"
        />
      </div>

      {/* Horizontal segmented pipeline tracker */}
      <PipelineOverview leads={leads} />

      {/* Grid: Recent Leads Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent leads table (Spans 2 columns on large viewports) */}
        <div className="lg:col-span-2">
          <RecentLeads leads={leads} />
        </div>

        {/* Quick action buttons (Spans 1 column) */}
        <div>
          <QuickActions 
            leads={leads}
            onAddLeadClick={() => setIsModalOpen(true)} 
          />
        </div>

      </div>

      {/* Self-contained Add Lead Modal (for dashboard Quick Actions trigger) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Quick Add Lead</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Log a new prospect directly to pipeline</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Liam Watson"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Company */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. Stripe Inc."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="liam@stripe.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Value */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Deal Value ($)</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder="25000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Pipeline Stage</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 text-[var(--text-main)]"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs shadow-blue-500/10"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
