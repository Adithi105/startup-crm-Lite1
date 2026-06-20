import { BookOpen, Search, ChevronRight, Zap, Users, BarChart3, Settings, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const docsSections = [
  {
    icon: <Zap size={18} className="text-blue-600" />,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    title: "Getting Started",
    desc: "Set up your workspace, invite teammates, and import your first leads in minutes.",
    articles: ["Quick Start Guide", "Workspace Configuration", "Importing Leads from CSV"],
  },
  {
    icon: <Users size={18} className="text-emerald-600" />,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    title: "Leads & Pipeline",
    desc: "Manage your entire deal flow, from lead capture to closed won.",
    articles: ["Creating & Editing Leads", "Pipeline Stages Explained", "Bulk Actions & Filters"],
  },
  {
    icon: <BarChart3 size={18} className="text-indigo-600" />,
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    title: "Analytics",
    desc: "Understand your sales performance with deep, real-time reporting.",
    articles: ["Reading Your Dashboard", "Revenue Forecasting", "Lead Source Attribution"],
  },
  {
    icon: <Settings size={18} className="text-orange-500" />,
    bg: "bg-orange-50 dark:bg-orange-950/30",
    title: "Settings & Integrations",
    desc: "Customize SalesFlow to fit your workflow and connect your favorite tools.",
    articles: ["Account & Profile Settings", "Notification Preferences", "API Keys & Webhooks"],
  },
];

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Documentation</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">SalesFlow CRM Lite — Knowledge Base</p>
        </div>
      </div>

      {/* Hero search bar */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} />
            <span className="text-sm font-semibold opacity-90">Knowledge Base</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">How can we help you?</h2>
          <p className="text-sm text-blue-100 mb-5">
            Browse the docs or search for articles, guides, and tutorials.
          </p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
              aria-label="Search documentation"
            />
          </div>
        </div>
      </div>

      {/* Coming Soon notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <HelpCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
        <p>
          <span className="font-bold">Full documentation is coming soon.</span> Our team is actively writing these
          guides. In the meantime, reach out to{" "}
          <a
            href="mailto:support@salesflow.com?subject=Help%20Request%20-%20SalesFlow%20CRM"
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
          >
            support@salesflow.com
          </a>{" "}
          for any questions.
        </p>
      </div>

      {/* Docs sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {docsSections.map((section) => (
          <div
            key={section.title}
            className="premium-card p-5 space-y-3 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md cursor-default"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                {section.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{section.title}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{section.desc}</p>
            <ul className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-700">
              {section.articles.map((article) => (
                <li key={article}>
                  <button
                    className="w-full flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left group cursor-pointer"
                    onClick={() => {}}
                    aria-label={`Read article: ${article}`}
                  >
                    <ChevronRight
                      size={12}
                      className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors"
                    />
                    {article}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Can't find what you need?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Our support team is available Mon–Fri, 9 AM – 5 PM EST.
          </p>
        </div>
        <a
          href="mailto:support@salesflow.com?subject=Help%20Request%20-%20SalesFlow%20CRM"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
