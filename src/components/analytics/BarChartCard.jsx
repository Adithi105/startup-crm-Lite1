import PropTypes from "prop-types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold text-gray-900 dark:text-white">{d.month}</p>
      <p className="mt-0.5 text-blue-600 dark:text-blue-400 font-bold">
        {d.leads} {d.leads === 1 ? "Lead" : "Leads"}
      </p>
    </div>
  );
}

// ─── BarChartCard ─────────────────────────────────────────────────────────────
export default function BarChartCard({ data }) {
  const { isDarkMode } = useTheme();
  const maxLeads = Math.max(...data.map((d) => d.leads), 0);

  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={13} className="text-gray-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Monthly Leads Trend
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
            Lead acquisition volume over last 6 months
          </p>
        </div>
        {maxLeads > 0 && (
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
            Peak: {maxLeads}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
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
              allowDecimals={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: chartGridColor, opacity: 0.3 }} />
            <Bar
              dataKey="leads"
              fill="url(#barBlueGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
              animationBegin={100}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

BarChartCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ month: PropTypes.string.isRequired, leads: PropTypes.number.isRequired })
  ).isRequired,
};

BarTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };
