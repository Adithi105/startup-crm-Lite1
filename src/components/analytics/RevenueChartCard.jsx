import PropTypes from "prop-types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "../../context/ThemeContext";

// Helper to format values in Indian Rupee format
const formatRupee = (value) => {
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl shadow-md text-xs">
        <p className="font-bold text-gray-900 dark:text-white">{data.month} Revenue</p>
        <p className="mt-0.5 text-emerald-500 font-bold">
          {formatRupee(data.revenue)}
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChartCard({ data }) {
  const { isDarkMode } = useTheme();

  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[340px]">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Revenue Analytics
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Monthly breakdown of closed-won sales revenue
        </p>
      </div>

      <div className="flex-1 w-full mt-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={chartGridColor}
            />
            <XAxis
              dataKey="month"
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-8}
              tickFormatter={(val) => {
                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                if (val >= 1000) return `₹${val / 1000}k`;
                return `₹${val}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22C55E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={850}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

RevenueChartCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
    })
  ).isRequired,
};
