import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Mail, Phone, Building, Briefcase, FileText, Camera, Edit2, Check, X, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";

export default function Profile() {
  const { user, updateProfile } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const buildForm = useCallback(() => ({
    name: user?.name || "",
    role: user?.role || "",
    organization: user?.organization || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    profilePhoto: user?.profilePhoto || ""
  }), [user]);

  // Initialise form from user; rebuild when entering edit mode
  const initialForm = useMemo(() => buildForm(), [buildForm]);
  const [form, setForm] = useState(initialForm);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    updateProfile(form);
    
    // Clear the edit search param to exit edit mode
    setSearchParams({});
    
    const isDark = document.documentElement.classList.contains("dark");
    toast.success("Profile updated successfully!", {
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

  const handleCancel = () => {
    setSearchParams({});
  };

  const toggleEdit = () => {
    if (isEditMode) {
      setSearchParams({});
    } else {
      setSearchParams({ edit: "true" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <User size={20} className="text-blue-600 animate-pulse" />
            User Profile
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            View and manage your personal details and CRM workspace credentials
          </p>
        </div>

        <button
          onClick={toggleEdit}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[40px]
            ${isEditMode 
              ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
            }
          `}
        >
          {isEditMode ? (
            <>
              <X size={14} />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit2 size={14} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center shadow-sm">
          <div className="relative group">
            {form.profilePhoto ? (
              <img 
                src={form.profilePhoto} 
                alt={user.name} 
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/10 dark:ring-blue-500/20 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl font-extrabold uppercase text-blue-700 dark:text-blue-300 ring-4 ring-blue-500/10 shadow-md">
                {user.avatarInitials}
              </div>
            )}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={20} />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-905 dark:text-white leading-tight">{user.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{user.role}</p>
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold select-none mt-1">
              <Building size={10} />
              {user.organization}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-150 dark:border-gray-700 w-full text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-gray-650 dark:text-gray-300">
              <Mail size={13} className="text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-650 dark:text-gray-300">
              <Phone size={13} className="text-gray-400" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg text-[10px]">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Verified CRM administrator account</span>
            </div>
          </div>
        </div>

        {/* Right Column: Bio / Fields Forms */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              {isEditMode ? "Edit Profile Settings" : "Account Overview"}
            </h3>
          </div>

          {isEditMode ? (
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={13} />
                    </div>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={13} />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Job Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Briefcase size={13} />
                    </div>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Organization</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building size={13} />
                    </div>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => setForm(p => ({ ...p, organization: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={13} />
                    </div>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Profile Image URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Profile Photo URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Camera size={13} />
                    </div>
                    <input
                      type="url"
                      value={form.profilePhoto}
                      onChange={(e) => setForm(p => ({ ...p, profilePhoto: e.target.value }))}
                      placeholder="https://..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-455">Biography / Notes</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <FileText size={13} />
                    </div>
                    <textarea
                      rows="4"
                      value={form.bio}
                      onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    ></textarea>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs select-none">
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Full Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Email Address</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Job Position</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.role}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Organization</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.organization}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Direct Phone</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{user.phone}</span>
                </div>
              </div>

              {/* Bio block */}
              <div className="space-y-2 pt-4 border-t border-gray-150 dark:border-gray-700">
                <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[9px]">Biography</span>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium bg-gray-50/50 dark:bg-gray-900/35 p-4 rounded-xl border border-gray-150 dark:border-gray-750">
                  {user.bio || "No biography details specified yet."}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
