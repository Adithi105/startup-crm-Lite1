import PropTypes from "prop-types";
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { STATUS_COLORS } from "../../constants/analyticsColors";
import { ArrowDownRight, Filter } from "lucide-react";

// ─── Funnel Tooltip ───────────────────────────────────────────────────────────
function FunnelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs min-w-[140px]">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.stage] }} />
        <span className="font-bold text-gray-900 dark:text-white">{d.stage}</span>
      </div>
      <div className="space-y-0.5 text-gray-500 dark:text-gray-400">
        <p>Count: <span className="font-bold text-gray-900 dark:text-white">{d.count}</span></p>
        <p>Conversion: <span className="font-bold text-blue-600 dark:text-blue-400">{d.conversion}%</span></p>
        {d.dropoff > 0 && (
          <p className="text-red-500 font-semibold">Drop-off: -{d.dropoff}%</p>
        )}
      </div>
    </div>
  );
}

// ─── FunnelChartCard ──────────────────────────────────────────────────────────
export default function FunnelChartCard({ data }) {
  const chartData = data.map((item) => ({
    ...item,
    value: item.count || 1,
    fill: STATUS_COLORS[item.stage] || "#2563EB",
  }));

  const totalEntry = data[0]?.count || 1;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 h-[370px]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sales Funnel
            </h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
            Conversion & drop-off across stages
          </p>
        </div>
      </div>

      {/* Chart + Stats side-by-side */}
      <div className="flex-1 flex flex-col md:flex-row items-center gap-4 min-h-0">
        {/* Funnel SVG */}
        <div className="flex-1 w-full h-[200px] md:h-full shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip content={<FunnelTooltip />} />
              <Funnel
                data={chartData}
                dataKey="value"
                nameKey="stage"
                animationDuration={700}
                animationBegin={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList
                  position="center"
                  content={({ x, y, width, height, index }) => {
                    const item = chartData[index];
                    if (!item) return null;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        fill="#FFF"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight="700"
                      >
                        {item.count}
                      </text>
                    );
                  }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Stage detail list */}
        <div className="flex-1 w-full overflow-y-auto max-h-60 space-y-1.5 scrollbar-thin">
          {data.map((item, i) => {
            const pct = Math.round((item.count / totalEntry) * 100);
            const stageColor = STATUS_COLORS[item.stage] || "#2563EB";
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs bg-gray-50/80 dark:bg-gray-700/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stageColor }} />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="font-bold text-gray-900 dark:text-white font-mono">{item.count}</span>
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: stageColor }}
                      />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold w-8 text-right">{item.conversion}%</span>
                  </div>
                </div>
                {i > 0 && item.dropoff > 0 && (
                  <div className="flex items-center gap-1 text-[9px] text-red-500 font-bold pl-6">
                    <ArrowDownRight size={9} />
                    <span>-{item.dropoff}% drop-off</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

FunnelChartCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      conversion: PropTypes.number.isRequired,
      dropoff: PropTypes.number.isRequired,
    })
  ).isRequired,
};

FunnelTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };
