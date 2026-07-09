import { useState, useMemo } from "react";
import {
  getStatusDistribution,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getPipelineValue,
  getWonRevenue,
  getAverageSalesCycle,
  getLostRate,
  getLeadSourceStats,
  getFunnelData,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData,
  getLeadEventDate,
} from "../utils/analyticsHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers — all comparisons are done at the YYYY-MM-DD string level to
// completely eliminate UTC-vs-local timezone offset bugs. A date string like
// "2026-06-20" is never re-parsed as a Date object; it is compared lexically.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns today's date as a local YYYY-MM-DD string (no UTC shift). */
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Subtracts `days` calendar days from a YYYY-MM-DD string and returns the
 * resulting YYYY-MM-DD string.  Uses local time arithmetic — no UTC shift.
 */
const subtractDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d); // local midnight — safe from UTC offset
  dt.setDate(dt.getDate() - days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

/**
 * Extracts a YYYY-MM-DD string from a lead's creation date field.
 * Handles ISO strings ("2026-05-10T00:00:00Z"), plain date strings
 * ("2026-05-10"), and falls back to createdAt / timeline.
 */
const getLeadDateStr = (lead) => {
  const raw = getLeadEventDate(lead, "created");
  if (!raw) return null;
  // Take only the first 10 chars — works for both ISO and plain date strings
  return raw.substring(0, 10);
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAnalytics(leads) {
  const [timePeriod, setTimePeriod] = useState("30days");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  // ── Build start / end strings for the CURRENT and PREVIOUS windows ────────
  const dateRanges = useMemo(() => {
    const today = todayStr(); // e.g. "2026-06-20"

    let start = "";
    let end = today;
    let prevStart = "";
    let prevEnd = "";

    if (timePeriod === "7days") {
      start    = subtractDays(today, 7);
      prevEnd  = subtractDays(start, 1);
      prevStart = subtractDays(prevEnd, 7);

    } else if (timePeriod === "90days") {
      start    = subtractDays(today, 90);
      prevEnd  = subtractDays(start, 1);
      prevStart = subtractDays(prevEnd, 90);

    } else if (timePeriod === "thisYear") {
      const year = new Date().getFullYear();
      start     = `${year}-01-01`;
      prevStart = `${year - 1}-01-01`;
      prevEnd   = `${year - 1}-12-31`;

    } else if (timePeriod === "custom" && customRange.startDate && customRange.endDate) {
      start   = customRange.startDate;
      end     = customRange.endDate;

      // Previous window = same duration, immediately before start
      const [sy, sm, sd] = start.split("-").map(Number);
      const [ey, em, ed] = end.split("-").map(Number);
      const startLocal = new Date(sy, sm - 1, sd);
      const endLocal   = new Date(ey, em - 1, ed);
      const durationDays = Math.round((endLocal - startLocal) / 86400000);
      prevEnd   = subtractDays(start, 1);
      prevStart = subtractDays(prevEnd, durationDays);

    } else {
      // Default: "30days"
      start    = subtractDays(today, 30);
      prevEnd  = subtractDays(start, 1);
      prevStart = subtractDays(prevEnd, 30);
    }

    console.log(
      `[Analytics] period="${timePeriod}" | current: ${start} → ${end} | prev: ${prevStart} → ${prevEnd}`
    );

    return { start, end, prevStart, prevEnd };
  }, [timePeriod, customRange]);

  // ── Split leads into current-period and previous-period lists ─────────────
  const periodLeads = useMemo(() => {
    if (!Array.isArray(leads)) return { current: [], previous: [] };

    const { start, end, prevStart, prevEnd } = dateRanges;

    console.log(`[Analytics] Total leads in context: ${leads.length}`);
    console.log(`[Analytics] Filter window → start: ${start}  end: ${end}`);

    const current  = [];
    const previous = [];

    leads.forEach((lead) => {
      const dateStr = getLeadDateStr(lead);
      if (!dateStr) return;

      // Lexicographic comparison of YYYY-MM-DD strings — always correct, no TZ issues
      if (dateStr >= start && dateStr <= end) {
        current.push(lead);
      } else if (dateStr >= prevStart && dateStr <= prevEnd) {
        previous.push(lead);
      }
    });

    console.log(`[Analytics] Filtered leads count (current period): ${current.length}`);
    console.log(`[Analytics] Filtered leads count (previous period): ${previous.length}`);
    if (current.length === 0) {
      console.warn(
        "[Analytics] ⚠ No leads matched current period. Lead createdAt values:",
        leads.map((l) => ({ id: l.id, name: l.name, dateStr: getLeadDateStr(l) }))
      );
    }

    return { current, previous };
  }, [leads, dateRanges]);

  // ── Reference Date for chart helpers (always live "today") ────────────────
  // Chart helpers accept a Date object — we build it from the local date string
  // so it stays in local time, avoiding the UTC-midnight shift.
  const referenceDate = useMemo(() => {
    const today = todayStr();
    const [y, m, d] = today.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight
  }, []);

  // ── KPI metrics ───────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const curr = periodLeads.current;
    const prev = periodLeads.previous;

    const totalLeads     = curr.length;
    const prevTotalLeads = prev.length;
    const totalLeadsGrowth =
      prevTotalLeads > 0
        ? Math.round(((totalLeads - prevTotalLeads) / prevTotalLeads) * 100)
        : 0;

    const wonCount       = curr.filter((l) => l.status === "Won").length;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const prevWonCount   = prev.filter((l) => l.status === "Won").length;
    const prevConversionRate =
      prevTotalLeads > 0 ? Math.round((prevWonCount / prevTotalLeads) * 100) : 0;
    const conversionRateGrowth = conversionRate - prevConversionRate;

    const pipelineValue     = getPipelineValue(curr);
    const prevPipelineValue = getPipelineValue(prev);
    const pipelineValueGrowth =
      prevPipelineValue > 0
        ? Math.round(((pipelineValue - prevPipelineValue) / prevPipelineValue) * 100)
        : 0;

    const wonRevenue     = getWonRevenue(curr);
    const prevWonRevenue = getWonRevenue(prev);
    const wonRevenueGrowth =
      prevWonRevenue > 0
        ? Math.round(((wonRevenue - prevWonRevenue) / prevWonRevenue) * 100)
        : 0;

    const avgSalesCycle     = getAverageSalesCycle(curr);
    const prevAvgSalesCycle = getAverageSalesCycle(prev);
    const avgSalesCycleGrowth =
      prevAvgSalesCycle > 0
        ? Math.round(((avgSalesCycle - prevAvgSalesCycle) / prevAvgSalesCycle) * 100)
        : 0;

    const lostRate     = getLostRate(curr);
    const prevLostRate = getLostRate(prev);
    const lostRateGrowth = lostRate - prevLostRate;

    return {
      totalLeads:     { value: totalLeads,     growth: totalLeadsGrowth },
      conversionRate: { value: conversionRate, growth: conversionRateGrowth },
      pipelineValue:  { value: pipelineValue,  growth: pipelineValueGrowth },
      wonRevenue:     { value: wonRevenue,      growth: wonRevenueGrowth },
      avgSalesCycle:  { value: avgSalesCycle,   growth: avgSalesCycleGrowth },
      lostRate:       { value: lostRate,        growth: lostRateGrowth },
    };
  }, [periodLeads]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartsData = useMemo(() => {
    const curr = periodLeads.current;
    const prev = periodLeads.previous;

    return {
      statusDistribution: getStatusDistribution(curr),
      monthlyLeads:       getMonthlyLeads(curr, referenceDate),
      monthlyConversion:  getConversionByMonth(curr, referenceDate),
      revenueAnalytics:   getRevenueByMonth(curr, referenceDate),
      leadSources:        getLeadSourceStats(curr),
      funnelData:         getFunnelData(curr),
      salesVelocity:      getSalesVelocity(curr),
      prevSalesVelocity:  getSalesVelocity(prev),
      forecast:           getForecastRevenue(curr, referenceDate),
      topPerformers:      getTopPerformers(curr),
      activityHeatmap:    getActivityHeatmapData(curr, referenceDate),
    };
  }, [periodLeads, referenceDate]);

  return {
    timePeriod,
    setTimePeriod,
    customRange,
    setCustomRange,
    metrics,
    chartsData,
    filteredLeadsCount: periodLeads.current.length,
    referenceDate,
  };
}
