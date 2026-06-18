import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";

const formatRupee = (value) => {
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function ForecastCard({ forecastData }) {
  if (!forecastData) return null;

  const { forecast, confidence, growthTrend } = forecastData;
  const isPositive = growthTrend > 0;
  const isZero = growthTrend === 0;

  // Confidence color grading
  let confidenceColor = "bg-blue-500";
  let confidenceText = "text-blue-500";
  if (confidence >= 85) {
    confidenceColor = "bg-emerald-500";
    confidenceText = "text-emerald-500";
  } else if (confidence < 70) {
    confidenceColor = "bg-amber-500";
    confidenceText = "text-amber-500";
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Brain size={14} />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Revenue Forecast
          </h3>
        </div>
        <span className="text-[9px] bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-semibold">
          Next Month
        </span>
      </div>

      {/* Main Content */}
      <div className="my-auto py-2">
        <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
          Predicted Revenue
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
          {formatRupee(forecast)}
        </h2>

        {/* Growth Trend */}
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
              {growthTrend}%
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-gray-400 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 rounded-md">
              0%
            </span>
          )}
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            projected monthly growth
          </span>
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="border-t border-gray-100 dark:border-gray-750/80 pt-3 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span className="font-semibold">AI Confidence Score</span>
          <span className={`font-bold ${confidenceText}`}>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-150 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${confidenceColor} transition-all duration-500 ease-out`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

ForecastCard.propTypes = {
  forecastData: PropTypes.shape({
    forecast: PropTypes.number.isRequired,
    confidence: PropTypes.number.isRequired,
    growthTrend: PropTypes.number.isRequired,
  }).isRequired,
};
