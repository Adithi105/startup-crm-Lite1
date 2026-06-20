import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronUp, 
  ChevronRight,
  Mail, 
  MessageSquare,
  Globe,
  CheckCircle,
  X,
  FileText
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import Modal from "./Modal";
import toast from "react-hot-toast";

export default function ProfileDropdown({ isCollapsed }) {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (action) => {
    setIsOpen(false);
    if (typeof action === "string") {
      navigate(action);
    } else if (typeof action === "function") {
      action();
    }
  };

  const menuItems = [
    { 
      label: "My Profile", 
      icon: <User size={15} />, 
      onClick: () => handleItemClick("/profile") 
    },
    { 
      label: "Edit Profile", 
      icon: <FileText size={15} />, 
      onClick: () => handleItemClick("/profile?edit=true") 
    },
    { 
      label: "Settings", 
      icon: <Settings size={15} />, 
      onClick: () => handleItemClick("/settings") 
    },
    { 
      label: "Notifications", 
      icon: <Bell size={15} />, 
      onClick: () => handleItemClick("/settings?tab=notifications") 
    },
    { 
      label: "Help & Support", 
      icon: <HelpCircle size={15} />, 
      onClick: () => setShowHelpModal(true) 
    },
    { 
      label: "About", 
      icon: <Info size={15} />, 
      onClick: () => setShowAboutModal(true) 
    },
    { 
      label: "Logout", 
      icon: <LogOut size={15} className="text-red-500" />, 
      onClick: () => {
        logout();
        navigate("/login");
      },
      className: "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
    }
  ];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Upward opening Dropdown Menu */}
      {isOpen && (
        <div className={`absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1.5 animate-in slide-in-from-bottom-2 duration-200 select-none
          ${isCollapsed ? "left-2" : "left-0"}
        `}>
          {/* Header containing Name and Role */}
          {!isCollapsed && (
            <div className="px-3.5 py-2 border-b border-gray-150 dark:border-gray-700 mb-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.role}</p>
              <p className="text-[9px] text-blue-600 dark:text-blue-400 truncate font-semibold mt-0.5">{user.organization}</p>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-0.5 px-1">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-950 dark:hover:text-white transition-all cursor-pointer ${
                  item.className || ""
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clickable Profile Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-250 text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 active:scale-98"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {user.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-gray-700" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold uppercase shrink-0 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/10">
              {user.avatarInitials}
            </div>
          )}
          
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-none mt-1">{user.role}</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <ChevronUp 
            size={14} 
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          />
        )}
      </button>

      {/* Help & Support Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
        icon={<HelpCircle className="text-blue-600" size={18} />}
        footer={
          <button
            onClick={() => setShowHelpModal(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Support
          </button>
        }
      >
        <div className="p-6 space-y-4 text-xs text-gray-700 dark:text-gray-300">
          <p className="leading-relaxed">
            Welcome to the <span className="font-bold text-gray-900 dark:text-white">SalesFlow CRM Support Center</span>. Need help managing your pipelines or leads? Browse our resources below or contact support.
          </p>
          
          <div className="space-y-3">
            {/* ── 1. Email Support ─────────────────────────────────────── */}
            <a
              href={[
                "mailto:support@salesflow.com",
                "?subject=Help%20Request%20%E2%80%94%20SalesFlow%20CRM",
                "&body=Hi%20SalesFlow%20Support%2C%0A%0AI%20need%20help%20with%20the%20following%3A%0A%0A%5BDescribe%20your%20issue%20here%5D%0A%0AThanks%2C%0A",
              ].join("")}
              role="button"
              aria-label="Contact email support at support@salesflow.com"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-gray-200 dark:border-gray-700 transition-all duration-150 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                <Mail className="text-blue-600" size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Email Support</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">support@salesflow.com</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 shrink-0 transition-colors" />
            </a>

            {/* ── 2. Live Chat Support ─────────────────────────────────── */}
            <button
              type="button"
              role="button"
              aria-label="Open live chat support"
              onClick={() => {
                toast("💬 Live Chat is coming soon — we're working on it!", {
                  icon: "🚀",
                  style: {
                    borderRadius: "10px",
                    background: "#1e293b",
                    color: "#f1f5f9",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "10px 14px",
                  },
                  duration: 4000,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
              }}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-gray-200 dark:border-gray-700 transition-all duration-150 cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                <MessageSquare className="text-emerald-600" size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Live Chat Support</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Available Mon–Fri, 9:00 AM – 5:00 PM EST</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 shrink-0 transition-colors" />
            </button>

            {/* ── 3. Documentation ─────────────────────────────────────── */}
            <button
              type="button"
              role="button"
              aria-label="Open documentation in app"
              onClick={() => {
                setShowHelpModal(false);
                navigate("/docs");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
              }}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-gray-200 dark:border-gray-700 transition-all duration-150 cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                <Globe className="text-indigo-600" size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Documentation</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Browse guides at docs.salesflow.com</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 shrink-0 transition-colors" />
            </button>
          </div>
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About SalesFlow CRM"
        icon={<Info className="text-blue-600" size={18} />}
        footer={
          <button
            onClick={() => setShowAboutModal(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Okay
          </button>
        }
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-3xl mx-auto shadow-md shadow-blue-500/20">
            S
          </div>
          
          <div>
            <h4 className="font-bold text-sm text-gray-950 dark:text-white">SalesFlow CRM Lite</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0 (Build 2026.06.19)</p>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
            A premium, modern client relationship management platform built for fast-growing startups. Engineered using React, Vite, and Tailwind CSS.
          </p>

          <div className="flex justify-center gap-4 pt-2 text-gray-400 dark:text-gray-500">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="https://salesflow.com" target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Globe size={18} />
            </a>
          </div>

          <div className="pt-4 border-t border-gray-150 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
            <CheckCircle size={12} className="text-emerald-500" />
            All systems operational
          </div>
        </div>
      </Modal>
    </div>
  );
}
