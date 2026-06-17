import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Command, 
  Building,
  DollarSign,
  TrendingUp,
  User,
  Settings,
  HelpCircle,
  FolderLock
} from "lucide-react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LeadsProvider, useLeads } from "./context/LeadsContext";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Analytics from "./pages/Analytics";

// Wrapper to get router context inside the App UI
function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { leads, addLead } = useLeads();
  const location = useLocation();
  
  // Navigation layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Global Modals and Search
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Add Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    value: "",
    status: "New",
    priority: "Medium",
    source: "Inbound",
    owner: "Alex Rivera",
    description: ""
  });

  // Hotkey listener for Search (/) and New Lead (Alt + N)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const searchInput = document.getElementById("global-search");
        if (searchInput) searchInput.focus();
      }
      if (e.key === "n" && e.altKey) {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.company) return;
    
    addLead(newLeadForm);
    
    // Reset form & close
    setNewLeadForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      value: "",
      status: "New",
      priority: "Medium",
      source: "Inbound",
      owner: "Alex Rivera",
      description: ""
    });
    setIsAddModalOpen(false);
  };

  // Dynamically resolve page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/leads":
        return "Leads Directory";
      case "/analytics":
        return "Performance Analytics";
      default:
        return "CRM Dashboard";
    }
  };

  // Filter leads for search overlay dropdown
  const filteredSearchLeads = searchQuery.trim() !== "" 
    ? leads.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen flex text-[var(--text-main)] bg-[var(--bg-canvas)] theme-transition relative overflow-hidden">
      
      {/* 1. Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[var(--border-main)] bg-[var(--bg-sidebar)] theme-transition 
          md:sticky md:z-10
          ${isSidebarCollapsed ? "w-16" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-main)]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-blue-500/20">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col select-none">
                <span className="font-semibold text-sm tracking-tight leading-none">SalesFlow</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">crm.v1.0</span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle (Desktop) */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-1 rounded-md text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close Menu (Mobile) */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden flex items-center justify-center p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { to: "/leads", label: "Leads Pipeline", icon: <Users size={18} /> },
            { to: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive 
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" 
                  : "text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-[var(--text-main)]"
                }
              `}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Org profile bottom info */}
        <div className="p-3 border-t border-[var(--border-main)] bg-slate-100/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold uppercase shrink-0 text-slate-800 dark:text-slate-200">
              AR
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Alex Rivera</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">Acme Inc. (Admin)</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 3. Main Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen">
        
        {/* Topbar Header */}
        <header className="h-16 shrink-0 border-b border-[var(--border-main)] bg-[var(--bg-surface)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 theme-transition">
          
          {/* Mobile menu and Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base md:text-lg font-bold tracking-tight select-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search, Action, Settings */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Global Search Inputs (Notion Style) */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                <Search size={14} />
              </div>
              <input
                id="global-search"
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 theme-transition"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-medium rounded border border-[var(--border-main)] bg-white dark:bg-slate-800 text-[var(--text-secondary)] shadow-sm">
                  <Command size={8} /> /
                </kbd>
              </div>

              {/* Instant Search Dropdown results */}
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 p-1 flex flex-col gap-0.5 min-w-[240px]">
                  <div className="text-[10px] text-[var(--text-secondary)] font-semibold px-2 py-1 select-none">
                    Matching Leads ({filteredSearchLeads.length})
                  </div>
                  {filteredSearchLeads.length > 0 ? (
                    filteredSearchLeads.map(lead => (
                      <NavLink
                        key={lead.id}
                        to={`/leads?id=${lead.id}`}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{lead.name}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] truncate">{lead.company}</p>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2">
                          ${lead.value.toLocaleString()}
                        </span>
                      </NavLink>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--text-secondary)] px-2 py-3 text-center">
                      No results for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Toggle theme mode"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Quick Add Lead Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm shadow-blue-500/10 cursor-pointer active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </header>

        {/* 4. Page Routing Content Area */}
        <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-full w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </main>

      {/* Global Slide Modal for creating lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create New Lead</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Input lead contact and deal parameters.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-150 text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Lead Name */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Company */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Company *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Role */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Job Title</label>
                  <input
                    type="text"
                    value={newLeadForm.role}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Product Manager"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Deal Value */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Deal Value ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                      $
                    </div>
                    <input
                      type="number"
                      value={newLeadForm.value}
                      onChange={(e) => setNewLeadForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="5000"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Lead Source */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-[var(--text-main)]"
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Referral">Referral</option>
                    <option value="SEO">SEO</option>
                  </select>
                </div>

                {/* Status / Stage */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Stage</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-[var(--text-main)]"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-[var(--text-main)]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Notes/Description */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Description / Notes</label>
                  <textarea
                    rows="3"
                    value={newLeadForm.description}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter preliminary details or comments..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-main)] bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  ></textarea>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-[var(--border-main)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm shadow-blue-500/10 cursor-pointer"
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

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LeadsProvider>
          <AppShell />
        </LeadsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
