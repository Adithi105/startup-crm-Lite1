import { useState, useMemo } from "react";
import { useLeads } from "../context/LeadContext";
import { useUser } from "../context/UserContext";
import StatsCard from "../components/dashboard/StatsCard";
import PipelineOverview from "../components/dashboard/PipelineOverview";
import RecentLeads from "../components/dashboard/RecentLeads";
import QuickActions from "../components/dashboard/QuickActions";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
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
  const { user } = useUser();
  
  // Local state for dashboard lead modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    name: "",
    company: "",
    email: "",
    value: "",
    status: "New",
    priority: "Medium",
    source: "Inbound",
    owner: user?.name || "C Adithi"
  }));

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
      value: Number(form.value) || 0,
      owner: user?.name || "C Adithi"
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
      owner: user?.name || "C Adithi"
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Workspace Dashboard
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            High-level metrics and active workflows for your sales pipelines
          </p>
        </div>
      </div>

      {/* 4-Column Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Self-contained Add Lead Modal (for dashboard Quick Actions trigger) - Full screen on mobile, centered modal max-w-md on tablet+ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-gray-800 border-none md:border md:border-gray-200 md:dark:border-gray-700 rounded-none md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 h-16">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Quick Add Lead</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Log a new prospect directly to pipeline</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-gray-900 dark:text-white flex-1 overflow-y-auto pb-24 md:pb-6">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Liam Watson"
                    className="w-full px-3 py-3 md:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Company */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. Stripe Inc."
                    className="w-full px-3 py-3 md:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400">Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="liam@stripe.com"
                    className="w-full px-3 py-3 md:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Value */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400">Deal Value ($)</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder="25000"
                    className="w-full px-3 py-3 md:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400">Pipeline Stage</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-3 md:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0 text-xs"
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
              <div className="flex justify-end gap-2.5 pt-4 pb-12 md:pb-0 border-t border-gray-200 dark:border-gray-700 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 md:py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 md:py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm shadow-blue-500/10 cursor-pointer min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
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
