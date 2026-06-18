import React from "react";
import PropTypes from "prop-types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Percent,
  CircleDollarSign,
  Briefcase,
  Clock,
  XCircle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupee = (value) => {
  if (!value && value !== 0) return "₹0";
  const n = Math.round(value);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return "₹" + n.toLocaleString("en-IN");
};

// ─── Mini Sparkline (pure SVG) ─────────────────────────────────────────────
function MiniSparkline({ color = "#2563EB", up = true }) {
  // Static decorative sparkline path
  const path = up
    ? "M0,20 C10,18 20,14 30,10 C40,6 50,8 60,4"
    : "M0,4 C10,6 20,8 30,12 C40,16 50,14 60,20";
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="opacity-60">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Single KPI Card ──────────────────────────────────────────────────────────
const StatCard = React.memo(function StatCard({ card }) {
  const Icon = card.icon;
  const growthVal = card.growth ?? 0;
  const isZero = growthVal === 0;
  const isPositive = growthVal > 0;

  let isFavorable = isPositive;
  if (card.isLowerBetter) isFavorable = !isPositive;

  let TrendIcon = Minus;
  let trendColor = "text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-550";
  let sparkColor = "#9CA3AF";

  if (!isZero) {
    if (isFavorable) {
      trendColor = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30";
      TrendIcon = isPositive ? TrendingUp : TrendingDown;
      sparkColor = "#22C55E";
    } else {
      trendColor = "text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950/30";
      TrendIcon = isPositive ? TrendingUp : TrendingDown;
      sparkColor = "#EF4444";
    }
  }

  const trendLabel = isZero
    ? "No change"
    : card.isAbsPoint
    ? `${growthVal > 0 ? "+" : ""}${growthVal}pp`
    : `${growthVal > 0 ? "+" : ""}${growthVal}%`;

  return (
    <div className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 overflow-hidden relative">
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/60 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center justify-between relative">
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">
          {card.title}
        </span>
        <div className={`p-2 rounded-xl shrink-0 ${card.iconBg}`}>
          <Icon size={14} className={card.iconColor} />
        </div>
      </div>

      {/* Value */}
      <div className="relative">
        <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
          {card.value}
        </span>
      </div>

      {/* Footer: trend + sparkline */}
      <div className="flex items-end justify-between relative mt-auto">
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md w-fit ${trendColor}`}
          >
            <TrendIcon size={9} className="shrink-0" />
            {trendLabel}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
            {card.description}
          </span>
        </div>
        <MiniSparkline color={sparkColor} up={isFavorable} />
      </div>
    </div>
  );
});

// ─── StatsCards Grid ──────────────────────────────────────────────────────────
export default function StatsCards({ metrics }) {
  if (!metrics) return null;

  const {
    totalLeads,
    conversionRate,
    pipelineValue,
    wonRevenue,
    avgSalesCycle,
    lostRate,
  } = metrics;

  const cards = [
    {
      title: "Total Leads",
      value: (totalLeads.value || 0).toLocaleString("en-IN"),
      growth: totalLeads.growth,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "leads this period",
      isLowerBetter: false,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.value ?? 0}%`,
      growth: conversionRate.growth,
      icon: Percent,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      description: "won vs total leads",
      isLowerBetter: false,
      isAbsPoint: true,
    },
    {
      title: "Pipeline Value",
      value: formatRupee(pipelineValue.value),
      growth: pipelineValue.growth,
      icon: Briefcase,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      description: "active deal value",
      isLowerBetter: false,
    },
    {
      title: "Won Revenue",
      value: formatRupee(wonRevenue.value),
      growth: wonRevenue.growth,
      icon: CircleDollarSign,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      description: "closed won value",
      isLowerBetter: false,
    },
    {
      title: "Avg Sales Cycle",
      value: `${avgSalesCycle.value ?? 0}d`,
      growth: avgSalesCycle.growth,
      icon: Clock,
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      description: "avg days to close",
      isLowerBetter: true,
    },
    {
      title: "Lost Rate",
      value: `${lostRate.value ?? 0}%`,
      growth: lostRate.growth,
      icon: XCircle,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500 dark:text-red-400",
      description: "lost vs total leads",
      isLowerBetter: true,
      isAbsPoint: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} card={card} />
      ))}
    </div>
  );
}

StatsCards.propTypes = {
  metrics: PropTypes.shape({
    totalLeads: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
    conversionRate: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
    pipelineValue: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
    wonRevenue: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
    avgSalesCycle: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
    lostRate: PropTypes.shape({ value: PropTypes.number, growth: PropTypes.number }),
  }).isRequired,
};

MiniSparkline.propTypes = {
  color: PropTypes.string,
  up: PropTypes.bool,
};

StatCard.propTypes = {
  card: PropTypes.object.isRequired,
};
