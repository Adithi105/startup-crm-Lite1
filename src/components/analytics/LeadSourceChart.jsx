import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SOURCE_COLORS } from "../../constants/analyticsColors";
import { useTheme } from "../../context/ThemeContext";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl shadow-md text-xs">
        <p className="font-bold text-gray-900 dark:text-white">{data.source}</p>
        <p className="mt-0.5 text-blue-600 dark:text-blue-400 font-bold">
          {data.count} {data.count === 1 ? "Lead" : "Leads"}
        </p>
      </div>
    );
  }
  return null;
}

export default function LeadSourceChart({ data }) {
  const { isDarkMode } = useTheme();
  // Sort descending by count (if helper didn't do it)
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const chartGridColor = isDarkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = isDarkMode ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Lead Source Analytics
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          Acquisitions grouped by marketing channel
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full mt-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke={chartGridColor}
            />
            <XAxis
              type="number"
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              dy={5}
            />
            <YAxis
              type="category"
              dataKey="source"
              stroke={axisColor}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              animationDuration={850}
              maxBarSize={16}
            >
              {sortedData.map((entry, index) => {
                const color = SOURCE_COLORS[entry.source] || SOURCE_COLORS.Other || "#6B7280";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

LeadSourceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};
