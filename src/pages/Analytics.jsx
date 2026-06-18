import { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { useLeads } from "../context/LeadContext";
import { 
  TrendingUp, 
  Award, 
  Target, 
  Percent, 
  Filter, 
  Calendar
} from "lucide-react";

// Tooltip Component
function AnalyticsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] px-3 py-2 rounded-lg shadow-md text-xs">
        <p className="font-semibold">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="mt-0.5 font-medium" style={{ color: item.color || item.fill }}>
            {item.name}: {item.value.toLocaleString()}
            {item.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const { leads } = useLeads();
  
  // State for analytics controls
  const [timePeriod, setTimePeriod] = useState("all"); // "7days" | "30days" | "all"
  const [ownerFilter, setOwnerFilter] = useState("All");

  // Get unique list of owners
  const owners = useMemo(() => {
    const list = new Set(leads.map(l => l.owner).filter(Boolean));
    return ["All", ...Array.from(list)];
  }, [leads]);

  // Filter leads based on owner and date
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Owner Filter
      const matchesOwner = ownerFilter === "All" || l.owner === ownerFilter;
      
      // Time/Date Filter
      if (timePeriod === "all") return matchesOwner;
      
      const dateLimit = new Date();
      if (timePeriod === "7days") dateLimit.setDate(dateLimit.getDate() - 7);
      if (timePeriod === "30days") dateLimit.setDate(dateLimit.getDate() - 30);
      
      const leadDate = new Date(l.dateCreated);
      const matchesDate = leadDate >= dateLimit;
      
      return matchesOwner && matchesDate;
    });
  }, [leads, ownerFilter, timePeriod]);

  // 1. Group Won deals by Month (Revenue Growth)
  const revenueGrowthData = useMemo(() => {
    // Generate months map
    const months = {
      "2026-02": { name: "Feb 2026", revenue: 0 },
      "2026-03": { name: "Mar 2026", revenue: 0 },
      "2026-04": { name: "Apr 2026", revenue: 0 },
      "2026-05": { name: "May 2026", revenue: 0 },
      "2026-06": { name: "Jun 2026", revenue: 0 }
    };

    filteredLeads.forEach(l => {
      if (l.status === "Won") {
        const monthKey = l.lastActive.substring(0, 7); // e.g. "2026-06"
        if (months[monthKey]) {
          months[monthKey].revenue += l.value;
        }
      }
    });

    // Accumulate for line area chart representation (Cumulative)
    let accum = 0;
    return Object.entries(months)
      .map(([, data]) => {
        accum += data.revenue;
        return {
          month: data.name,
          "New Sales": data.revenue,
          "Cumulative Revenue": accum
        };
      });
  }, [filteredLeads]);

  // 2. Sales Rep Standings (Leaderboard stats)
  const repPerformanceData = useMemo(() => {
    const data = {};
    
    filteredLeads.forEach(l => {
      const owner = l.owner || "Unassigned";
      if (!data[owner]) {
        data[owner] = { name: owner, total: 0, won: 0, lost: 0, active: 0, value: 0, wonValue: 0 };
      }
      
      data[owner].total += 1;
      data[owner].value += l.value;
      if (l.status === "Won") {
        data[owner].won += 1;
        data[owner].wonValue += l.value;
      } else if (l.status === "Lost") {
        data[owner].lost += 1;
      } else {
        data[owner].active += 1;
      }
    });

    return Object.values(data).map(rep => {
      const finished = rep.won + rep.lost;
      const winRate = finished > 0 ? Math.round((rep.won / finished) * 100) : 0;
      return {
        ...rep,
        winRate
      };
    }).sort((a, b) => b.wonValue - a.wonValue);
  }, [filteredLeads]);

  // 3. Source Breakdown Conversion rates
  const sourcePerformanceData = useMemo(() => {
    const data = {
      Inbound: { name: "Inbound", count: 0, won: 0, lost: 0, value: 0 },
      Outbound: { name: "Outbound", count: 0, won: 0, lost: 0, value: 0 },
      Referral: { name: "Referral", count: 0, won: 0, lost: 0, value: 0 },
      SEO: { name: "SEO", count: 0, won: 0, lost: 0, value: 0 }
    };

    filteredLeads.forEach(l => {
      if (data[l.source]) {
        data[l.source].count += 1;
        data[l.source].value += l.value;
        if (l.status === "Won") data[l.source].won += 1;
        if (l.status === "Lost") data[l.source].lost += 1;
      }
    });

    return Object.values(data).map(src => {
      const totalClosed = src.won + src.lost;
      const winRate = totalClosed > 0 ? Math.round((src.won / totalClosed) * 100) : 0;
      return { ...src, winRate };
    });
  }, [filteredLeads]);

  // Summary Metrics calculations
  const totalClosedWonCount = useMemo(() => filteredLeads.filter(l => l.status === "Won").length, [filteredLeads]);
  const totalValueSum = useMemo(() => filteredLeads.reduce((s, l) => s + l.value, 0), [filteredLeads]);
  const totalWonRevenue = useMemo(() => filteredLeads.filter(l => l.status === "Won").reduce((s, l) => s + l.value, 0), [filteredLeads]);
  const overallWinRate = useMemo(() => {
    const closed = filteredLeads.filter(l => l.status === "Won" || l.status === "Lost").length;
    return closed > 0 ? Math.round((totalClosedWonCount / closed) * 100) : 0;
  }, [filteredLeads, totalClosedWonCount]);

  return (
    <div className="space-y-6">
      
      {/* Top filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Performance Reports</h2>
          <p className="text-xs text-[var(--text-secondary)]">Vetted statistics, closed-deal revenue, and conversions grouped by source/owner.</p>
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          
          {/* Owner Filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 shadow-xs">
            <Filter size={12} className="text-[var(--text-secondary)]" />
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="bg-transparent text-[var(--text-main)] focus:outline-none border-none py-0.5 font-semibold"
            >
              {owners.map(own => (
                <option key={own} value={own}>Owner: {own}</option>
              ))}
            </select>
          </div>

          {/* Time range selection */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 shadow-xs">
            <Calendar size={12} className="text-[var(--text-secondary)]" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="bg-transparent text-[var(--text-main)] focus:outline-none border-none py-0.5 font-semibold"
            >
              <option value="all">Time: All Time</option>
              <option value="30days">Time: Last 30 Days</option>
              <option value="7days">Time: Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="premium-card p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Total Closed-Won</span>
            <h3 className="text-xl font-bold mt-0.5">${totalWonRevenue.toLocaleString()}</h3>
            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{totalClosedWonCount} successful conversions</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="premium-card p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
            <Percent size={20} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Average Win Rate</span>
            <h3 className="text-xl font-bold mt-0.5">{overallWinRate}%</h3>
            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Won vs lost deal ratio</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="premium-card p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl">
            <Target size={20} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Open Pipeline Value</span>
            <h3 className="text-xl font-bold mt-0.5">
              ${filteredLeads.filter(l => l.status !== "Won" && l.status !== "Lost").reduce((s,l)=>s+l.value, 0).toLocaleString()}
            </h3>
            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Active negotiation value</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="premium-card p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Avg. Contract Value</span>
            <h3 className="text-xl font-bold mt-0.5">
              ${filteredLeads.length > 0 ? Math.round(totalValueSum / filteredLeads.length).toLocaleString() : 0}
            </h3>
            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Across all log entries</p>
          </div>
        </div>

      </div>

      {/* Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="premium-card p-5 lg:col-span-2 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold">Closed Won Revenue Growth</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Acquisitions timeline tracking monthly sales revenue and cumulative total.</p>
          </div>

          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-secondary)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip content={<AnalyticsTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Area 
                  type="monotone" 
                  dataKey="Cumulative Revenue" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCumulative)" 
                  unit=" USD"
                />
                <Bar 
                  dataKey="New Sales" 
                  fill="#22C55E" 
                  radius={[3, 3, 0, 0]} 
                  opacity={0.7} 
                  maxBarSize={40}
                  unit=" USD"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source breakdown chart */}
        <div className="premium-card p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold">Acquisitions by Source</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Comparison of lead value volume vs actual conversion count.</p>
          </div>

          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcePerformanceData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-secondary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<AnalyticsTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar 
                  dataKey="count" 
                  name="Leads count" 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
                <Bar 
                  dataKey="winRate" 
                  name="Win Rate (%)" 
                  fill="#22C55E" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                  unit="%"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom leaderboard & data table sections */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Representative standings leaderboard */}
        <div className="premium-card p-5 xl:col-span-3 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold">Representative Pipeline Standings</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Lead performance tracking and win rates across team members.</p>
          </div>

          {/* Standings table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-main)] pb-2 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[9px] bg-slate-50 dark:bg-slate-900/60">
                  <th className="p-3">Representative</th>
                  <th className="p-3">Leads Assigned</th>
                  <th className="p-3">Active Deals</th>
                  <th className="p-3">Win Rate</th>
                  <th className="p-3 text-right">Closed Won Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {repPerformanceData.map((rep) => (
                  <tr key={rep.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-3 font-semibold text-[var(--text-main)]">{rep.name}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{rep.total}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{rep.active}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-green-600 dark:text-green-400">{rep.winRate}%</span>
                        <div className="w-12 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className="bg-green-500 h-full" 
                            style={{ width: `${Math.min(rep.winRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-[var(--text-main)]">
                      ${rep.wonValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source breakdown report table */}
        <div className="premium-card p-5 xl:col-span-2 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold">Source Acquisition Yields</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Conversion details by marketing channels.</p>
            </div>
            
            <div className="space-y-4">
              {sourcePerformanceData.map((src) => {
                let channelColor = "bg-blue-600";
                if (src.name === "Outbound") channelColor = "bg-slate-400";
                if (src.name === "Referral") channelColor = "bg-green-500";
                if (src.name === "SEO") channelColor = "bg-amber-500";

                return (
                  <div key={src.name} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${channelColor}`} />
                        <span className="font-semibold text-[var(--text-main)]">{src.name}</span>
                      </div>
                      <span className="font-bold text-[var(--text-main)]">${src.value.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                      <span>{src.count} total leads • {src.won} converted</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">{src.winRate}% Win-Rate</span>
                    </div>
                    
                    {/* Visual bar tracker */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${channelColor}`} 
                        style={{ width: `${Math.min(src.winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
