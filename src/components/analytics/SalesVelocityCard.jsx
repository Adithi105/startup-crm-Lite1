import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, HelpCircle, Activity, Zap } from "lucide-react";

const formatRupee = (value) => {
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function SalesVelocityCard({ velocity, prevVelocity }) {
  const diff = velocity - prevVelocity;
  const growth = prevVelocity > 0 ? Math.round((diff / prevVelocity) * 100) : 0;
  const isPositive = growth > 0;
  const isZero = growth === 0;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 shrink-0">
            <Activity size={14} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Sales Velocity
          </h3>
        </div>
        
        {/* Tooltip Help Icon */}
        <div className="group relative">
          <HelpCircle size={14} className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 cursor-pointer" />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 dark:bg-gray-950 text-white text-[10px] p-3 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 leading-relaxed font-normal border border-gray-800">
            <p className="font-bold border-b border-gray-800 pb-1 mb-1.5">Sales Velocity Formula</p>
            <code className="text-blue-400 font-mono block mb-1">
              (Deals × Win % × Avg Size) ÷ Cycle
            </code>
            Represents the rate of revenue moving through the pipeline per day. Higher numbers indicate a faster and more efficient sales process.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto py-2">
        <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
          Current pipeline speed
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
          {formatRupee(velocity)}
          <span className="text-xs font-normal text-gray-450 dark:text-gray-500 lowercase">
            {" "}/ day
          </span>
        </h2>
        
        {/* Comparison trend */}
        <div className="flex items-center gap-1.5 mt-2">
          {!isZero ? (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                isPositive
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20"
                  : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20"
              }`}
            >
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isPositive ? "+" : ""}
              {growth}%
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-gray-400 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 rounded-md">
              0%
            </span>
          )}
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            vs previous period ({formatRupee(prevVelocity)}/day)
          </span>
        </div>
      </div>

      {/* Formula variables tags */}
      <div className="border-t border-gray-100 dark:border-gray-700/80 pt-3 flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 font-semibold">
        <span className="flex items-center gap-1">
          <Zap size={10} className="text-amber-500" />
          Active Pipeline Acceleration
        </span>
        <span>CRM Standard Metric</span>
      </div>
    </div>
  );
}

SalesVelocityCard.propTypes = {
  velocity: PropTypes.number.isRequired,
  prevVelocity: PropTypes.number.isRequired,
};
