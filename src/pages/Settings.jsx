import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Palette, 
  Bell, 
  Check, 
  ShieldCheck, 
  Moon, 
  Sun,
  Smartphone,
  Mail,
  Volume2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { user, updateProfile } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tabs: "account" | "security" | "appearance" | "notifications"
  // Derive active tab directly from URL param — no state needed
  const activeTab = searchParams.get("tab") || "account";

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Form states
  const [orgName, setOrgName] = useState(user.organization || "");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC+5:30");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [notifs, setNotifs] = useState({
    emailLeadCreated: true,
    emailReportMonthly: false,
    pushLeadWon: true,
    pushLeadAssign: true,
    pushAudioSound: false
  });

  const handleSaveAccount = (e) => {
    e.preventDefault();
    updateProfile({ organization: orgName });
    triggerToast("Account settings saved!");
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    triggerToast("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleNotif = (key) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifs = () => {
    triggerToast("Notification settings saved!");
  };

  const triggerToast = (msg) => {
    const isDark = document.documentElement.classList.contains("dark");
    toast.success(msg, {
      duration: 3000,
      style: {
        borderRadius: "10px",
        background: isDark ? "#1f2937" : "#fff",
        color: isDark ? "#fff" : "#111827",
        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
        fontSize: "13px",
      },
    });
  };

  const tabs = [
    { id: "account", label: "Account", icon: <User size={15} /> },
    { id: "security", label: "Security", icon: <Lock size={15} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center gap-2 select-none">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Workspace Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure global workspace options, system security, notifications, and dark theme variables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Sidebar Tabs Control */}
        <div className="md:col-span-1 flex flex-col gap-1.5 select-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer border border-transparent hover:border-gray-250 dark:hover:border-gray-700
                ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                  : "text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Settings Form Panels */}
        <div className="md:col-span-3 bg-white dark:bg-gray-800 border border-gray-205 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden min-h-[360px] flex flex-col">
          
          <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">
              {activeTab} Settings
            </h3>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            
            {/* ACCOUNT PANEL */}
            {activeTab === "account" && (
              <form onSubmit={handleSaveAccount} className="space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Organization / Agency Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Default Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="JPY">JPY (¥) - Japanese Yen</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                      >
                        <option value="UTC-5:00">UTC-5:00 - EST (New York)</option>
                        <option value="UTC+0:00">UTC+0:00 - GMT (London)</option>
                        <option value="UTC+5:30">UTC+5:30 - IST (New Delhi)</option>
                        <option value="UTC+9:00">UTC+9:00 - JST (Tokyo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <Check size={13} />
                    Save Account Settings
                  </button>
                </div>
              </form>
            )}

            {/* SECURITY PANEL */}
            {activeTab === "security" && (
              <form onSubmit={handleSaveSecurity} className="space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <Check size={13} />
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* APPEARANCE PANEL */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Application Theme Options</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Personalize your workspace look. Light mode keeps things clean and bright, while Dark mode reduces eye strain in low-light environments.
                  </p>
                  
                  {/* Visual selectors */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    
                    {/* Light Select card */}
                    <button
                      onClick={() => { if (isDarkMode) toggleTheme(); }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-28
                        ${!isDarkMode 
                          ? "bg-blue-50/50 border-blue-500 text-blue-700 dark:bg-gray-900 dark:border-gray-800" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100/70 text-gray-600 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-400"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Sun size={18} className="text-amber-500" />
                        {!isDarkMode && <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white"><Check size={10} /></div>}
                      </div>
                      <div>
                        <p className="font-bold text-xs">Light Mode</p>
                        <p className="text-[10px] text-gray-400 mt-1">Default clean workspace</p>
                      </div>
                    </button>

                    {/* Dark Select card */}
                    <button
                      onClick={() => { if (!isDarkMode) toggleTheme(); }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-28
                        ${isDarkMode 
                          ? "bg-blue-900/10 border-blue-500 text-blue-400 dark:border-blue-500" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100/70 text-gray-600 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-400"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Moon size={18} className="text-blue-400" />
                        {isDarkMode && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white"><Check size={10} /></div>}
                      </div>
                      <div>
                        <p className="font-bold text-xs">Dark Mode</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Eye-relaxing dark mode</p>
                      </div>
                    </button>

                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-200/40 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold select-none">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>Theme settings auto-sync immediately to this browser's local state storage.</span>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS PANEL */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Email Settings Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 select-none">
                      <Mail size={13} className="text-blue-600" />
                      Email Alerts & Digests
                    </h4>
                    
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200/30">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Lead Creation Updates</p>
                          <p className="text-[10px] text-gray-500">Send confirmation mail whenever a new lead is added.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifs.emailLeadCreated}
                          onChange={() => handleToggleNotif("emailLeadCreated")}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200/30">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Monthly Analytics Digest</p>
                          <p className="text-[10px] text-gray-500">Email a monthly PDF dashboard performance report.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifs.emailReportMonthly}
                          onChange={() => handleToggleNotif("emailReportMonthly")}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Push/System Section */}
                  <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 select-none">
                      <Smartphone size={13} className="text-emerald-500" />
                      In-App & Push Notifications
                    </h4>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200/30">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Deal Won alerts</p>
                          <p className="text-[10px] text-gray-500">Show browser push modal when pipeline stage hits Won.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifs.pushLeadWon}
                          onChange={() => handleToggleNotif("pushLeadWon")}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200/30">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">Lead Ownership Changes</p>
                          <p className="text-[10px] text-gray-500">Notify immediately when a contact is assigned to you.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifs.pushLeadAssign}
                          onChange={() => handleToggleNotif("pushLeadAssign")}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200/30">
                        <div className="flex-1 flex items-center gap-1.5">
                          <Volume2 size={13} className="text-gray-400" />
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Audio Alert on Sales Closed</p>
                            <p className="text-[10px] text-gray-500">Play cash register chime sound on deal wins.</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifs.pushAudioSound}
                          onChange={() => handleToggleNotif("pushAudioSound")}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleSaveNotifs}
                    className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <Check size={13} />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
