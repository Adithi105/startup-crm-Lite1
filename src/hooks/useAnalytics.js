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

// Reference date matching the context local time (2026-06-18)
const REFERENCE_DATE = new Date("2026-06-18");

export function useAnalytics(leads) {
  const [timePeriod, setTimePeriod] = useState("30days"); // "7days" | "30days" | "90days" | "thisYear" | "custom"
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  // Compute current and previous date ranges
  const dateRanges = useMemo(() => {
    const end = new Date(REFERENCE_DATE);
    let start = new Date(REFERENCE_DATE);
    let prevStart = new Date(REFERENCE_DATE);
    let prevEnd = new Date(REFERENCE_DATE);

    if (timePeriod === "7days") {
      start.setDate(end.getDate() - 7);
      prevEnd.setDate(start.getDate() - 1);
      prevStart.setDate(prevEnd.getDate() - 7);
    } else if (timePeriod === "90days") {
      start.setDate(end.getDate() - 90);
      prevEnd.setDate(start.getDate() - 1);
      prevStart.setDate(prevEnd.getDate() - 90);
    } else if (timePeriod === "thisYear") {
      start = new Date(REFERENCE_DATE.getFullYear(), 0, 1);
      prevEnd = new Date(REFERENCE_DATE.getFullYear() - 1, 11, 31);
      prevStart = new Date(REFERENCE_DATE.getFullYear() - 1, 0, 1);
    } else if (timePeriod === "custom" && customRange.startDate && customRange.endDate) {
      start = new Date(customRange.startDate);
      const customEnd = new Date(customRange.endDate);
      customEnd.setHours(23, 59, 59, 999);
      end.setTime(customEnd.getTime());

      const diffMs = end.getTime() - start.getTime();
      prevEnd.setTime(start.getTime() - 1);
      prevStart.setTime(prevEnd.getTime() - diffMs);
    } else {
      // Default: "30days"
      start.setDate(end.getDate() - 30);
      prevEnd.setDate(start.getDate() - 1);
      prevStart.setDate(prevEnd.getDate() - 30);
    }

    return { start, end, prevStart, prevEnd };
  }, [timePeriod, customRange]);

  // Split leads into current and previous datasets
  const periodLeads = useMemo(() => {
    if (!Array.isArray(leads)) return { current: [], previous: [] };

    const { start, end, prevStart, prevEnd } = dateRanges;

    const currentList = [];
    const previousList = [];

    leads.forEach((lead) => {
      const createdDateStr = getLeadEventDate(lead, "created");
      if (createdDateStr) {
        const leadDate = new Date(createdDateStr);
        if (leadDate >= start && leadDate <= end) {
          currentList.push(lead);
        } else if (leadDate >= prevStart && leadDate <= prevEnd) {
          previousList.push(lead);
        }
      }
    });

    return { current: currentList, previous: previousList };
  }, [leads, dateRanges]);

  // Compute KPI stats for current vs previous periods
  const metrics = useMemo(() => {
    const curr = periodLeads.current;
    const prev = periodLeads.previous;

    // KPI 1: Total Leads
    const totalLeads = curr.length;
    const prevTotalLeads = prev.length;
    const totalLeadsGrowth =
      prevTotalLeads > 0
        ? Math.round(((totalLeads - prevTotalLeads) / prevTotalLeads) * 100)
        : 0;

    // KPI 2: Conversion Rate
    const wonCount = curr.filter((l) => l.status === "Won").length;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const prevWonCount = prev.filter((l) => l.status === "Won").length;
    const prevConversionRate =
      prevTotalLeads > 0 ? Math.round((prevWonCount / prevTotalLeads) * 100) : 0;
    const conversionRateGrowth = conversionRate - prevConversionRate;

    // KPI 3: Pipeline Value
    const pipelineValue = getPipelineValue(curr);
    const prevPipelineValue = getPipelineValue(prev);
    const pipelineValueGrowth =
      prevPipelineValue > 0
        ? Math.round(((pipelineValue - prevPipelineValue) / prevPipelineValue) * 100)
        : 0;

    // KPI 4: Won Revenue
    const wonRevenue = getWonRevenue(curr);
    const prevWonRevenue = getWonRevenue(prev);
    const wonRevenueGrowth =
      prevWonRevenue > 0
        ? Math.round(((wonRevenue - prevWonRevenue) / prevWonRevenue) * 100)
        : 0;

    // KPI 5: Average Sales Cycle
    const avgSalesCycle = getAverageSalesCycle(curr);
    const prevAvgSalesCycle = getAverageSalesCycle(prev);
    const avgSalesCycleGrowth =
      prevAvgSalesCycle > 0
        ? Math.round(((avgSalesCycle - prevAvgSalesCycle) / prevAvgSalesCycle) * 100)
        : 0;

    // KPI 6: Lost Rate
    const lostRate = getLostRate(curr);
    const prevLostRate = getLostRate(prev);
    const lostRateGrowth = lostRate - prevLostRate;

    return {
      totalLeads: { value: totalLeads, growth: totalLeadsGrowth },
      conversionRate: { value: conversionRate, growth: conversionRateGrowth },
      pipelineValue: { value: pipelineValue, growth: pipelineValueGrowth },
      wonRevenue: { value: wonRevenue, growth: wonRevenueGrowth },
      avgSalesCycle: { value: avgSalesCycle, growth: avgSalesCycleGrowth },
      lostRate: { value: lostRate, growth: lostRateGrowth },
    };
  }, [periodLeads]);

  // Compute all chart data for current + previous period
  const chartsData = useMemo(() => {
    const curr = periodLeads.current;
    const prev = periodLeads.previous;

    return {
      statusDistribution: getStatusDistribution(curr),
      monthlyLeads: getMonthlyLeads(curr, REFERENCE_DATE),
      monthlyConversion: getConversionByMonth(curr, REFERENCE_DATE),
      revenueAnalytics: getRevenueByMonth(curr, REFERENCE_DATE),
      leadSources: getLeadSourceStats(curr),
      funnelData: getFunnelData(curr),
      salesVelocity: getSalesVelocity(curr),
      prevSalesVelocity: getSalesVelocity(prev),  // ← previous period for comparison
      forecast: getForecastRevenue(curr, REFERENCE_DATE),
      topPerformers: getTopPerformers(curr),
      activityHeatmap: getActivityHeatmapData(curr, REFERENCE_DATE),
    };
  }, [periodLeads]);

  return {
    timePeriod,
    setTimePeriod,
    customRange,
    setCustomRange,
    metrics,
    chartsData,
    filteredLeadsCount: periodLeads.current.length,
    referenceDate: REFERENCE_DATE,
  };
}
