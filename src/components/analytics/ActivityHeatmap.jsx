import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../context/ThemeContext";
import { HEATMAP_COLORS, HEATMAP_COLORS_DARK } from "../../constants/analyticsColors";
import { CalendarDays, Flame } from "lucide-react";

export default function ActivityHeatmap({ data }) {
  const { isDarkMode } = useTheme();
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map counting scale to corresponding index
  const getColor = (count) => {
    const palette = isDarkMode ? HEATMAP_COLORS_DARK : HEATMAP_COLORS;
    if (count === 0) return palette[0];
    if (count <= 2) return palette[1];
    if (count <= 5) return palette[2];
    if (count <= 9) return palette[3];
    return palette[4];
  };

  // Group data into weeks (7 days each)
  // Data represents the last 30 days in chronological order.
  // We can render 5 columns of 7 cells each (35 cells total).
  // Pad the beginning so that we display Sunday to Saturday rows.
  const paddedData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // We want to map each date to its day of week (0 = Sunday, 1 = Monday, etc.)
    // Let's align the list so it starts exactly on Sunday.
    const firstDate = new Date(data[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0 to 6
    
    const padded = [];
    // Pad empty slots before first date
    for (let i = 0; i < firstDayOfWeek; i++) {
      padded.push({ date: null, count: 0, isPadded: true });
    }
    
    // Add real data
    data.forEach((item) => {
      padded.push({ ...item, isPadded: false });
    });
    
    // Pad empty slots at the end to make a complete multiple of 7
    while (padded.length % 7 !== 0) {
      padded.push({ date: null, count: 0, isPadded: true });
    }
    
    return padded;
  }, [data]);

  // Split into columns (weeks)
  const weeks = React.useMemo(() => {
    const cols = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      cols.push(paddedData.slice(i, i + 7));
    }
    return cols;
  }, [paddedData]);

  const handleMouseMove = (e, item) => {
    if (item.isPadded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.offsetParent.getBoundingClientRect();
    
    setTooltipPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 40,
    });
    setHoveredDay(item);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const totalPoints = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Pipeline Activity Heatmap
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/10">
            <Flame size={10} className="shrink-0" />
            <span>{totalPoints} Activity pts</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-405 mt-0.5 text-gray-400">
          Outreach and lead pipeline transition activities over the last 30 days
        </p>
      </div>

      {/* Grid Container */}
      <div className="flex-1 flex flex-col justify-center items-center relative my-4 w-full">
        {/* Hover Tooltip Overlay */}
        {hoveredDay && (
          <div
            className="absolute bg-gray-950 text-white text-[9px] px-2 py-1.5 rounded-lg pointer-events-none select-none shadow-md font-bold z-50 text-center -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100 border border-gray-800"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <p>{formatDateLabel(hoveredDay.date)}</p>
            <p className="text-blue-300 font-mono mt-0.5">{hoveredDay.count} Activity points</p>
          </div>
        )}

        <div className="flex items-start gap-2 max-w-full overflow-x-auto p-2 no-scrollbar">
          {/* Weekday Labels */}
          <div className="grid grid-rows-7 gap-1.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 pr-1 mt-1 leading-none select-none">
            <span>Sun</span>
            <span className="opacity-0">Mon</span>
            <span>Tue</span>
            <span className="opacity-0">Wed</span>
            <span>Thu</span>
            <span className="opacity-0">Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Columns */}
          <div className="flex gap-1.5">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-rows-7 gap-1.5">
                {week.map((day, dayIdx) => {
                  const style = {
                    backgroundColor: day.isPadded ? "transparent" : getColor(day.count),
                  };

                  return (
                    <div
                      key={dayIdx}
                      className={`w-4 h-4 rounded-md transition-all duration-150 ${
                        day.isPadded
                          ? "pointer-events-none"
                          : "hover:scale-115 hover:ring-2 hover:ring-blue-500/30 cursor-pointer border border-black/5 dark:border-white/5"
                      }`}
                      style={style}
                      onMouseEnter={(e) => handleMouseMove(e, day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="border-t border-gray-100 dark:border-gray-700/80 pt-3 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={12} />
          Last 30 Days View
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] mr-1">Less</span>
          {HEATMAP_COLORS.map((_, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded border border-black/5 dark:border-white/5"
              style={{
                backgroundColor: isDarkMode ? HEATMAP_COLORS_DARK[idx] : HEATMAP_COLORS[idx],
              }}
            />
          ))}
          <span className="text-[9px] ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

ActivityHeatmap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};
