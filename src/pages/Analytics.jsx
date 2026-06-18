import { useTransition, useState, useEffect, useMemo } from "react";
import { useLeads } from "../context/LeadContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { TrendingUp } from "lucide-react";

// Import Components
import AnalyticsFilters from "../components/analytics/AnalyticsFilters";
import StatsCards from "../components/analytics/StatsCards";
import PieChartCard from "../components/analytics/PieChartCard";
import FunnelChartCard from "../components/analytics/FunnelChartCard";
import BarChartCard from "../components/analytics/BarChartCard";
import LineChartCard from "../components/analytics/LineChartCard";
import RevenueChartCard from "../components/analytics/RevenueChartCard";
import LeadSourceChart from "../components/analytics/LeadSourceChart";
import SalesVelocityCard from "../components/analytics/SalesVelocityCard";
import ForecastCard from "../components/analytics/ForecastCard";
import ActivityHeatmap from "../components/analytics/ActivityHeatmap";
import TopPerformersCard from "../components/analytics/TopPerformersCard";
import EmptyAnalyticsState from "../components/analytics/EmptyAnalyticsState";
import LoadingSkeleton from "../components/analytics/LoadingSkeleton";

// Utility mapper to guarantee sources match the Recharts requirements
function buildSourceChartData(sourcesList) {
  const defaults = ["Website", "Referral", "LinkedIn", "Instagram", "Ads", "Cold Email"];
  const countsMap = {};
  defaults.forEach((s) => (countsMap[s] = 0));

  if (Array.isArray(sourcesList)) {
    sourcesList.forEach((item) => {
      countsMap[item.source] = (countsMap[item.source] || 0) + item.count;
    });
  }

  return Object.keys(countsMap)
    .map((src) => ({ source: src, count: countsMap[src] }))
    .sort((a, b) => b.count - a.count);
}

export default function Analytics() {
  const { leads } = useLeads();
  const [isPending, startTransition] = useTransition();

  const {
    timePeriod,
    setTimePeriod,
    customRange,
    setCustomRange,
    metrics,
    chartsData,
    filteredLeadsCount,
  } = useAnalytics(leads);

  // Initial loading fade-in
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSetTimePeriod = (period) => {
    startTransition(() => setTimePeriod(period));
  };

  const handleSetCustomRange = (range) => {
    startTransition(() => setCustomRange(range));
  };

  // Open "Add Lead" modal via global hotkey registered in App.jsx
  const handleTriggerAddLead = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", altKey: true }));
  };

  // Memoize source chart data
  const sourceChartData = useMemo(
    () => buildSourceChartData(chartsData.leadSources),
    [chartsData.leadSources]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!leads || leads.length === 0) {
    return <EmptyAnalyticsState onAddLead={handleTriggerAddLead} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-600/20">
              <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-9">
            Track sales performance, team velocity, conversion drop-offs, and growth forecasts.
          </p>
        </div>

        {/* Recalculating indicator */}
        {isPending && (
          <span className="self-start text-[10px] text-blue-600 dark:text-blue-400 font-bold animate-pulse bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
            ↻ Recalculating…
          </span>
        )}
      </div>

      {/* ── Analytics Filters ────────────────────────────────────────── */}
      <AnalyticsFilters
        timePeriod={timePeriod}
        setTimePeriod={handleSetTimePeriod}
        customRange={customRange}
        setCustomRange={handleSetCustomRange}
      />

      {/* ── Dashboard Content ─────────────────────────────────────────── */}
      {filteredLeadsCount > 0 ? (
        <div className="space-y-6">

          {/* Row 1 – KPI Cards (6 across) */}
          <StatsCards metrics={metrics} />

          {/* Row 2 – Status Donut + Sales Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChartCard data={chartsData.statusDistribution} />
            <FunnelChartCard data={chartsData.funnelData} />
          </div>

          {/* Row 3 – Monthly Leads + Conversion Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChartCard data={chartsData.monthlyLeads} />
            <LineChartCard data={chartsData.monthlyConversion} />
          </div>

          {/* Row 4 – Revenue Area + Lead Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueChartCard data={chartsData.revenueAnalytics} />
            <LeadSourceChart data={sourceChartData} />
          </div>

          {/* Row 5 – Activity Heatmap + Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityHeatmap data={chartsData.activityHeatmap} />
            <TopPerformersCard data={chartsData.topPerformers} />
          </div>

          {/* Row 6 – Forecast + Sales Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ForecastCard forecastData={chartsData.forecast} />
            <SalesVelocityCard
              velocity={chartsData.salesVelocity}
              prevVelocity={chartsData.prevSalesVelocity}
            />
          </div>
        </div>
      ) : (
        /* Empty filter state */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            No leads fall within the selected date range.
          </p>
          <button
            onClick={() => handleSetTimePeriod("30days")}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline mt-2 cursor-pointer"
          >
            Reset to Last 30 Days
          </button>
        </div>
      )}
    </div>
  );
}
