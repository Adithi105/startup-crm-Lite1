import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, CheckCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail("adithi.c@mits.ac.in");
    setPassword("mits-cse-ai-2026");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-gray-955 to-black text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Background decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md p-8 m-4 rounded-3xl bg-white/5 dark:bg-gray-900/40 backdrop-blur-md border border-white/10 dark:border-gray-800 shadow-2xl relative z-10 space-y-6 animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-blue-500/25 select-none">
            S
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-4">Welcome back to SalesFlow</h2>
          <p className="text-xs text-gray-400">Enterprise CRM platform for growing startups</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-150">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail size={14} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adithi.c@mits.ac.in"
                className="w-full pl-10 pr-4 py-3 text-xs bg-white/5 border border-white/10 dark:border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock size={14} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs bg-white/5 border border-white/10 dark:border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Workspace
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-xs text-gray-400 pt-2">
          New to SalesFlow?{" "}
          <Link to="/register" className="text-blue-400 hover:underline font-bold">
            Create an account
          </Link>
        </div>

        {/* Demo login shortcut card */}
        <div className="p-4 bg-white/5 border border-white/10 dark:border-gray-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={10} />
              Demo Access Mode
            </span>
            <button
              onClick={handleDemoFill}
              type="button"
              className="text-[10px] text-white hover:text-blue-400 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors"
            >
              Fill Credentials
            </button>
          </div>
          <div className="text-[11px] text-gray-300 space-y-1">
            <p><span className="text-gray-500 font-medium">Demo Email:</span> adithi.c@mits.ac.in</p>
            <p><span className="text-gray-500 font-medium">Demo Pass:</span> mits-cse-ai-2026</p>
          </div>
        </div>

      </div>
    </div>
  );
}
