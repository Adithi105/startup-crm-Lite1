import PropTypes from "prop-types";
import { Award, Trophy, User } from "lucide-react";

const formatRupee = (value) => {
  return "₹" + Math.round(value).toLocaleString("en-IN");
};

export default function TopPerformersCard({ data }) {
  // Find maximum value to calculate relative progress ratios
  const maxRevenue = data.length > 0 ? data[0].value : 0;

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
          iconColor: "text-amber-500",
          label: "1st",
        };
      case 1:
        return {
          bg: "bg-gray-100 text-gray-700 dark:bg-gray-400/10 dark:text-gray-400",
          iconColor: "text-gray-400",
          label: "2nd",
        };
      case 2:
        return {
          bg: "bg-orange-100 text-orange-700 dark:bg-orange-600/10 dark:text-orange-400",
          iconColor: "text-orange-500",
          label: "3rd",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400",
          iconColor: "text-gray-400",
          label: `${index + 1}th`,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[340px]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Top Performers
          </h3>
          <Trophy size={14} className="text-amber-500 shrink-0" />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Sales representatives ranked by won revenue
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto mt-4 px-1 pr-1 space-y-3.5 scrollbar-thin">
        {data.length > 0 ? (
          data.map((rep, index) => {
            const rank = getRankStyle(index);
            const relativeRatio = maxRevenue > 0 ? Math.round((rep.value / maxRevenue) * 100) : 0;

            return (
              <div key={index} className="space-y-1">
                {/* Rep Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {/* Rank Indicator */}
                    <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-[10px] shrink-0 ${rank.bg}`}>
                      {index < 3 ? <Award size={12} className={rank.iconColor} /> : index + 1}
                    </span>

                    {/* Rep Details */}
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block leading-tight">
                        {rep.name}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">
                        Rep #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Revenue Value */}
                  <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white block leading-tight">
                      {formatRupee(rep.value)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                      Won Value
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="pl-8 flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${relativeRatio}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono w-6 text-right shrink-0 select-none">
                    {relativeRatio}%
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 text-center text-xs">
            <User size={24} className="opacity-30 mb-2 shrink-0" />
            <p className="font-medium">No sales rep data found</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Win deals to feature team standings</p>
          </div>
        )}
      </div>
    </div>
  );
}

TopPerformersCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};
