import PropTypes from "prop-types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function ConversionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{d.month}</p>
      <p className="mt-0.5 text-emerald-500 font-bold text-sm">{d.rate}%</p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
        {d.won} won / {d.total} total
      </p>
    </div>
  );
}

// ─── LineChartCard ────────────────────────────────────────────────────────────
export default function LineChartCard({ data }) {
  const { isDarkMode } = useTheme();

  // Calculate average conversion
  const validMonths = data.filter((d) => d.total > 0);
  const avgRate = validMonths.length
    ? Math.round(validMonths.reduce((s, d) => s + d.rate, 0) / validMonths.length)
    : 0;

  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-gray-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Conversion Trend
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
            Monthly won-deal conversion rate
          </p>
        </div>
        {avgRate > 0 && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
            Avg: {avgRate}%
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGreenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
            <XAxis
              dataKey="month"
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-6}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ConversionTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#22C55E"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#22C55E", strokeWidth: 2, fill: "#FFF" }}
              activeDot={{ r: 6, fill: "#22C55E", stroke: "#FFF", strokeWidth: 2 }}
              animationDuration={900}
              animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

LineChartCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      won: PropTypes.number.isRequired,
    })
  ).isRequired,
};

ConversionTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };
