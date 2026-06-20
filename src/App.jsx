import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Menu, 
  X, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Command
} from "lucide-react";
import { useLeads } from "./context/LeadContext";
import { useUser } from "./context/UserContext";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Docs from "./pages/Docs";
import ThemeToggle from "./components/common/ThemeToggle";
import ProfileDropdown from "./components/common/ProfileDropdown";



// Navigation items with labels, sub-labels, and icons for responsive layout
const navItems = [
  { to: "/", label: "Dashboard", subLabel: "Metrics & Overview", icon: <LayoutDashboard size={18} /> },
  { to: "/leads", label: "Leads Pipeline", subLabel: "Deal Management", icon: <Users size={18} /> },
  { to: "/analytics", label: "Analytics", subLabel: "Performance Data", icon: <BarChart3 size={18} /> }
];

// Wrapper to get router context inside the App UI
function AppShell() {
  const { leads, addLead } = useLeads();
  const { user, isAuthenticated } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Global Modals and Search
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const handleSearchKeyDown = (e) => {
    if (!isSearchFocused || filteredSearchLeads.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredSearchLeads.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredSearchLeads.length) % filteredSearchLeads.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filteredSearchLeads.length) {
        e.preventDefault();
        const selectedLead = filteredSearchLeads[activeIndex];
        navigate(`/leads?id=${selectedLead.id}`);
        setSearchQuery("");
        setIsSearchFocused(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSearchFocused(false);
      document.getElementById("global-search")?.blur();
    }
  };
  
  // Add Lead Form State (dynamic based on current user details)
  const [newLeadForm, setNewLeadForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    value: "",
    status: "New",
    priority: "Medium",
    source: "Inbound",
    owner: user?.name || "C Adithi",
    description: ""
  }));

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
    
    addLead({
      ...newLeadForm,
      owner: user?.name || "C Adithi"
    });
    
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
      owner: user?.name || "C Adithi",
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
      case "/profile":
        return "User Profile";
      case "/settings":
        return "Workspace Settings";
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

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative overflow-hidden pb-16 md:pb-0">
      
      {/* 1. Mobile Sidebar Slide-Over Drawer */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* Backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer slide-out */}
        <aside 
          className={`absolute top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Brand Area */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 select-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight leading-none">SalesFlow</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">crm.v1.0</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
  
          {/* Drawer Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-150 min-h-[44px]
                  ${isActive 
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                <div className="shrink-0">{item.icon}</div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span className="text-[9px] text-gray-450 dark:text-gray-500 font-normal leading-none mt-0.5 truncate">{item.subLabel}</span>
                </div>
              </NavLink>
            ))}
          </nav>
  
          {/* User profile section in Drawer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <ProfileDropdown isCollapsed={false} />
          </div>
        </aside>
      </div>

      {/* 2. Sidebar Navigation (Tablet & Desktop Only) */}
      <aside 
        className={`hidden md:flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "md:w-16" : "md:w-52 lg:w-64"}
        `}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-blue-500/20">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col select-none">
                <span className="font-semibold text-sm tracking-tight leading-none">SalesFlow</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">crm.v1.0</span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle (Desktop) */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            style={{ minWidth: "32px", minHeight: "32px" }}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive 
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                }
              `}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span className="hidden lg:block text-[10px] text-gray-450 dark:text-gray-550 font-normal leading-none mt-0.5 truncate">{item.subLabel}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Org profile bottom info */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
          <ProfileDropdown isCollapsed={isSidebarCollapsed} />
        </div>
      </aside>

      {/* 3. Mobile Bottom Navigation Bar (icons only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-40 px-4 pb-safe shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center justify-center p-3 rounded-xl transition-all duration-150 min-w-[44px] min-h-[44px]
              ${isActive 
                ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }
            `}
            title={item.label}
          >
            <div className="scale-110 shrink-0">{item.icon}</div>
          </NavLink>
        ))}
      </nav>

      {/* 4. Main Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen">
        
        {/* Topbar Header */}
        <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30 transition-colors duration-200">
          <div className="fluid-container h-full flex items-center justify-between">
            {/* Mobile menu and Title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
                aria-label="Open navigation menu"
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
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <Search size={14} />
                </div>
                <input
                  id="global-search"
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-medium rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm">
                    <Command size={8} /> /
                  </kbd>
                </div>

                {/* Instant Search Dropdown results */}
                {isSearchFocused && searchQuery && (
                  <div 
                    className="absolute top-full right-0 left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 p-1 flex flex-col gap-0.5 min-w-[240px]"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold px-2 py-1 select-none">
                      Matching Leads ({filteredSearchLeads.length})
                    </div>
                    {filteredSearchLeads.length > 0 ? (
                      filteredSearchLeads.map((lead, index) => {
                        const isActive = index === activeIndex;
                        return (
                          <NavLink
                            key={lead.id}
                            to={`/leads?id=${lead.id}`}
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-colors ${
                              isActive
                                ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{lead.name}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{lead.company}</p>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2">
                              ${lead.value.toLocaleString()}
                            </span>
                          </NavLink>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-3 text-center">
                         No results for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark Mode toggle */}
              <ThemeToggle />

              {/* Quick Add Lead Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm shadow-blue-500/10 cursor-pointer active:scale-95 transition-all min-h-[44px] min-w-[44px]"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Lead</span>
              </button>
            </div>
          </div>
        </header>

        {/* 5. Page Routing Content Area */}
        <div className="flex-1 fluid-container py-4 pb-24 md:py-6 space-y-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Global Slide Modal for creating lead - Full screen on mobile, centered modal max-w-lg on tablet+ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-gray-800 border-none md:border md:border-gray-200 md:dark:border-gray-700 rounded-none md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 h-16">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Lead</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Input lead contact and deal parameters.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4 flex-1 overflow-y-auto pb-24 md:pb-6">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Lead Name */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Company */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Company *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Role */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Job Title</label>
                  <input
                    type="text"
                    value={newLeadForm.role}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Product Manager"
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                  />
                </div>

                {/* Deal Value */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Deal Value ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                      $
                    </div>
                    <input
                      type="number"
                      value={newLeadForm.value}
                      onChange={(e) => setNewLeadForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="5000"
                      className="w-full pl-7 pr-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0"
                    />
                  </div>
                </div>

                {/* Lead Source */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0 text-xs"
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Referral">Referral</option>
                    <option value="SEO">SEO</option>
                  </select>
                </div>

                {/* Status / Stage */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Stage</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0 text-xs"
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
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200 min-h-[44px] md:min-h-0 text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Notes/Description */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Description / Notes</label>
                  <textarea
                    rows="3"
                    value={newLeadForm.description}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter preliminary details or comments..."
                    className="w-full px-3 py-3 md:py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                  ></textarea>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 pb-12 md:pb-0 border-t border-gray-200 dark:border-gray-700 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* Global Toast Notifications — mounted once here so toasts work from any component */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "shadow-lg text-xs font-semibold",
          duration: 4000,
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
