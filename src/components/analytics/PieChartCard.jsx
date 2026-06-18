import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

// ─── Active slice with outer glow ring ────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      {/* Glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.15}
      />
      {/* Expanded slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs min-w-[110px]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
        <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        <span className="font-bold text-gray-900 dark:text-white">{d.value}</span>{" "}
        {d.value === 1 ? "Lead" : "Leads"}
      </p>
      <p className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">{d.percentage}%</p>
    </div>
  );
}

// ─── PieChartCard ─────────────────────────────────────────────────────────────
export default function PieChartCard({ data }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onEnter = useCallback((_, index) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(-1), []);

  const totalLeads = data.reduce((s, i) => s + i.value, 0);
  const nonZeroData = data.filter((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4 h-[370px]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <PieIcon size={13} className="text-gray-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Lead Status Distribution
            </h3>
          </div>
          <p className="text-[10px] text-gray-450 mt-0.5 ml-5 text-gray-400">
            Pipeline breakdown by stage
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
          {totalLeads} Total
        </span>
      </div>

      {/* Chart + Legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 min-h-0">

        {/* Donut */}
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={nonZeroData.length ? nonZeroData : [{ name: "No Data", value: 1, color: "#E2E8F0", percentage: 0 }]}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                dataKey="value"
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                animationBegin={0}
                animationDuration={700}
                stroke="none"
                strokeWidth={0}
              >
                {(nonZeroData.length ? nonZeroData : [{ color: "#E2E8F0" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
              {totalLeads}
            </span>
            <span className="text-[9px] font-semibold text-gray-450 uppercase tracking-wider mt-0.5 text-gray-400">
              Total Leads
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="flex-1 overflow-y-auto w-full space-y-1 pr-1 scrollbar-thin">
          {data.map((entry, i) => {
            const pct = entry.percentage ?? 0;
            return (
              <div
                key={i}
                className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-xl cursor-default transition-all duration-150 ${
                  activeIndex === i
                    ? "bg-gray-50 dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-50/70 dark:hover:bg-gray-700/40"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-14 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: entry.color }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 w-16 text-right">
                    {entry.value} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

PieChartCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

PieTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};
