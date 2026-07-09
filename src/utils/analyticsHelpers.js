import { STATUS_COLORS } from "../constants/analyticsColors";

/**
 * Standardizes/maps CRM status strings to standard analytics stages.
 * Handles variations in database statuses safely.
 */
export const mapStatus = (status) => {
  if (!status) return "New";
  const s = status.trim().toLowerCase();
  if (s === "new") return "New";
  if (s === "contacted") return "Contacted";
  if (s === "meeting scheduled" || s === "meeting" || s === "qualified") return "Meeting Scheduled";
  if (s === "proposal sent" || s === "proposal") return "Proposal Sent";
  if (s === "won") return "Won";
  if (s === "lost") return "Lost";
  return "New";
};

/**
 * Retrieves the event date for a specific stage/action of a lead.
 * First checks direct fields, then searches the timeline array, then falls back to active dates.
 */
export const getLeadEventDate = (lead, eventType) => {
  if (!lead) return null;
  
  const type = eventType.toLowerCase();
  if (type === "won" && lead.wonAt) return lead.wonAt;
  if (type === "lost" && lead.lostAt) return lead.lostAt;
  if (type === "proposal" && lead.proposalAt) return lead.proposalAt;
  if (type === "meeting" && lead.meetingAt) return lead.meetingAt;
  if (type === "contacted" && lead.contactedAt) return lead.contactedAt;
  if (type === "created") return lead.createdAt;

  // Search timeline
  if (lead.timeline && Array.isArray(lead.timeline)) {
    const found = lead.timeline.find(
      (t) => t.type === eventType || t.type === type || t.content?.toLowerCase().includes(type)
    );
    if (found && found.date) {
      return found.date.includes("T") ? found.date : `${found.date}T00:00:00Z`;
    }
  }

  // Fallback based on current status and active timestamps
  if (type === "won" && lead.status === "Won") return lead.lastActive || lead.createdAt;
  if (type === "lost" && lead.status === "Lost") return lead.lastActive || lead.createdAt;
  if (type === "proposal" && (lead.status === "Proposal Sent")) return lead.lastActive || lead.createdAt;
  if (type === "meeting" && (lead.status === "Meeting Scheduled")) return lead.lastActive || lead.createdAt;
  if (type === "contacted" && lead.status === "Contacted") return lead.lastActive || lead.createdAt;

  return null;
};

/**
 * Calculates the distribution of lead statuses.
 * Returns arrays sorted by lead counts.
 */
export const getStatusDistribution = (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return [];

  const counts = {
    New: 0,
    Contacted: 0,
    "Meeting Scheduled": 0,
    "Proposal Sent": 0,
    Won: 0,
    Lost: 0,
  };

  leads.forEach((lead) => {
    const mapped = mapStatus(lead.status);
    if (counts[mapped] !== undefined) {
      counts[mapped]++;
    }
  });

  const total = leads.length;
  return Object.keys(counts)
    .map((status) => {
      const count = counts[status];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name: status,
        value: count,
        percentage,
        color: STATUS_COLORS[status] || "#94A3B8",
      };
    })
    .sort((a, b) => b.value - a.value);
};

/**
 * Generates array of last 6 calendar months relative to reference date.
 */
const getLastSixMonths = (referenceDate = new Date()) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    months.push({ monthKey, label });
  }
  return months;
};

/**
 * Groups lead creation counts by month for the last 6 months.
 */
export const getMonthlyLeads = (leads, referenceDate) => {
  const months = getLastSixMonths(referenceDate);
  const dataMap = {};
  months.forEach((m) => {
    dataMap[m.monthKey] = { name: m.label, leads: 0 };
  });

  if (Array.isArray(leads)) {
    leads.forEach((lead) => {
      const createdDateStr = getLeadEventDate(lead, "created");
      if (createdDateStr) {
        const monthKey = createdDateStr.substring(0, 7); // "YYYY-MM"
        if (dataMap[monthKey]) {
          dataMap[monthKey].leads++;
        }
      }
    });
  }

  return months.map((m) => ({
    month: m.label,
    leads: dataMap[m.monthKey].leads,
  }));
};

/**
 * Calculates conversion rates (Won Leads / Total Leads) per month.
 */
export const getConversionByMonth = (leads, referenceDate) => {
  const months = getLastSixMonths(referenceDate);
  const dataMap = {};
  months.forEach((m) => {
    dataMap[m.monthKey] = { total: 0, won: 0 };
  });

  if (Array.isArray(leads)) {
    leads.forEach((lead) => {
      const createdDateStr = getLeadEventDate(lead, "created");
      if (createdDateStr) {
        const monthKey = createdDateStr.substring(0, 7);
        if (dataMap[monthKey]) {
          dataMap[monthKey].total++;
          if (lead.status === "Won") {
            dataMap[monthKey].won++;
          }
        }
      }
    });
  }

  return months.map((m) => {
    const { total, won } = dataMap[m.monthKey];
    const rate = total > 0 ? Math.round((won / total) * 100) : 0;
    return {
      month: m.label,
      rate,
      total,
      won,
    };
  });
};

/**
 * Groups Won lead values as revenue by month.
 */
export const getRevenueByMonth = (leads, referenceDate) => {
  const months = getLastSixMonths(referenceDate);
  const dataMap = {};
  months.forEach((m) => {
    dataMap[m.monthKey] = 0;
  });

  if (Array.isArray(leads)) {
    leads.forEach((lead) => {
      if (lead.status === "Won") {
        const wonDateStr = getLeadEventDate(lead, "won");
        if (wonDateStr) {
          const monthKey = wonDateStr.substring(0, 7);
          if (dataMap[monthKey] !== undefined) {
            dataMap[monthKey] += Number(lead.value) || 0;
          }
        }
      }
    });
  }

  return months.map((m) => ({
    month: m.label,
    revenue: dataMap[m.monthKey],
  }));
};

/**
 * Computes pipeline value (sum of active leads).
 */
export const getPipelineValue = (leads) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => l.status !== "Won" && l.status !== "Lost")
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
};

/**
 * Computes won revenue (sum of won leads).
 */
export const getWonRevenue = (leads) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => l.status === "Won")
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
};

/**
 * Computes average sales cycle in days for Won leads.
 */
export const getAverageSalesCycle = (leads) => {
  if (!Array.isArray(leads)) return 0;
  const wonLeads = leads.filter((l) => l.status === "Won");
  if (wonLeads.length === 0) return 0;

  let totalDays = 0;
  let validCount = 0;

  wonLeads.forEach((lead) => {
    const created = getLeadEventDate(lead, "created");
    const won = getLeadEventDate(lead, "won");
    if (created && won) {
      const diffTime = Math.abs(new Date(won) - new Date(created));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
      validCount++;
    }
  });

  return validCount > 0 ? Math.round(totalDays / validCount) : 0;
};

/**
 * Computes lost rate (lost leads / total leads).
 */
export const getLostRate = (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lostLeads = leads.filter((l) => l.status === "Lost").length;
  return Math.round((lostLeads / leads.length) * 100);
};

/**
 * Computes sorting details for lead sources.
 */
export const getLeadSourceStats = (leads) => {
  if (!Array.isArray(leads)) return [];
  const sources = {};

  leads.forEach((lead) => {
    const src = lead.source || "Other";
    sources[src] = (sources[src] || 0) + 1;
  });

  return Object.keys(sources)
    .map((src) => ({
      source: src,
      count: sources[src],
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Compiles sequential funnel counts, conversions, and drop-offs.
 */
export const getFunnelData = (leads) => {
  const stages = ["New", "Contacted", "Meeting Scheduled", "Proposal Sent", "Won"];
  if (!Array.isArray(leads) || leads.length === 0) {
    return stages.map((stage) => ({ stage, count: 0, conversion: 0, dropoff: 0 }));
  }

  // Count how many leads reached or passed each stage
  const counts = { New: 0, Contacted: 0, "Meeting Scheduled": 0, "Proposal Sent": 0, Won: 0 };

  leads.forEach((lead) => {
    const mapped = mapStatus(lead.status);
    if (mapped === "New") {
      counts.New++;
    } else if (mapped === "Contacted") {
      counts.New++;
      counts.Contacted++;
    } else if (mapped === "Meeting Scheduled") {
      counts.New++;
      counts.Contacted++;
      counts["Meeting Scheduled"]++;
    } else if (mapped === "Proposal Sent") {
      counts.New++;
      counts.Contacted++;
      counts["Meeting Scheduled"]++;
      counts["Proposal Sent"]++;
    } else if (mapped === "Won") {
      counts.New++;
      counts.Contacted++;
      counts["Meeting Scheduled"]++;
      counts["Proposal Sent"]++;
      counts.Won++;
    } else if (mapped === "Lost") {
      // For lost leads, they had to start at New at least.
      counts.New++;
      // We check if they went through higher stages based on dates or timeline
      if (getLeadEventDate(lead, "proposal")) {
        counts.Contacted++;
        counts["Meeting Scheduled"]++;
        counts["Proposal Sent"]++;
      } else if (getLeadEventDate(lead, "meeting")) {
        counts.Contacted++;
        counts["Meeting Scheduled"]++;
      } else if (getLeadEventDate(lead, "contacted")) {
        counts.Contacted++;
      }
    }
  });

  const baseCount = counts.New || 1;

  return stages.map((stage, index) => {
    const count = counts[stage];
    const conversion = Math.round((count / baseCount) * 100);
    
    // Calculate drop-off from previous stage
    let dropoff = 0;
    if (index > 0) {
      const prevStage = stages[index - 1];
      const prevCount = counts[prevStage];
      dropoff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
    }

    return {
      stage,
      count,
      conversion,
      dropoff,
    };
  });
};

/**
 * Computes Sales Velocity metric: (Active Deals * Win Rate * Avg Deal Size) / Avg Sales Cycle length.
 * Yields revenue velocity value per day.
 */
export const getSalesVelocity = (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;

  const activeLeads = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const wonLeads = leads.filter((l) => l.status === "Won");

  const opportunities = activeLeads.length;
  const winRate = leads.length > 0 ? wonLeads.length / leads.length : 0;

  const avgDealSize = wonLeads.length > 0
    ? wonLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0) / wonLeads.length
    : leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0) / leads.length;

  const cycleLength = getAverageSalesCycle(leads) || 14; // fallback to 14 days to prevent division by zero or unrealistic velocities

  const velocity = (opportunities * winRate * avgDealSize) / cycleLength;
  return Math.round(velocity);
};

/**
 * Generates forecasted revenue for next month using the average revenue of the last 6 months.
 */
export const getForecastRevenue = (leads, referenceDate) => {
  const monthlyRevenue = getRevenueByMonth(leads, referenceDate);
  const totalRev = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const avgRevenue = monthlyRevenue.length > 0 ? totalRev / monthlyRevenue.length : 0;

  // Simple growth trend: comparing last month's revenue to previous month
  let growthTrend = 0;
  if (monthlyRevenue.length >= 2) {
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (prevMonth > 0) {
      growthTrend = Math.round(((lastMonth - prevMonth) / prevMonth) * 100);
    }
  }

  // Consistency / confidence score based on monthly variations
  let confidence = 85; // default confidence
  if (avgRevenue > 0) {
    const variance = monthlyRevenue.reduce((sum, m) => sum + Math.pow(m.revenue - avgRevenue, 2), 0) / monthlyRevenue.length;
    const stdDev = Math.sqrt(variance);
    const coValue = stdDev / avgRevenue;
    confidence = Math.max(60, Math.min(95, Math.round(95 - coValue * 30)));
  }

  return {
    forecast: Math.round(avgRevenue),
    confidence,
    growthTrend,
  };
};

/**
 * Ranks rep owners by won revenue values.
 */
export const getTopPerformers = (leads) => {
  if (!Array.isArray(leads)) return [];
  const reps = {};

  leads.forEach((lead) => {
    if (lead.status === "Won" && lead.owner) {
      reps[lead.owner] = (reps[lead.owner] || 0) + (Number(lead.value) || 0);
    }
  });

  return Object.keys(reps)
    .map((name) => ({
      name,
      value: reps[name],
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Compiles GitHub-style activity contribution map.
 * Generates details for the last 30 days.
 */
export const getActivityHeatmapData = (leads, referenceDate = new Date()) => {
  const dataMap = {};
  
  // Initialize the last 30 days in dataMap with count: 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    dataMap[dateStr] = 0;
  }

  if (Array.isArray(leads)) {
    leads.forEach((lead) => {
      // 1. Check lead creation
      const created = getLeadEventDate(lead, "created");
      if (created) {
        const dateStr = created.substring(0, 10);
        if (dataMap[dateStr] !== undefined) dataMap[dateStr] += 1; // 1 point for lead creation
      }

      // 2. Check timeline events (meetings, emails, calls, won, lost)
      if (lead.timeline && Array.isArray(lead.timeline)) {
        lead.timeline.forEach((item) => {
          if (item.date) {
            const dateStr = item.date.substring(0, 10);
            if (dataMap[dateStr] !== undefined) {
              // Different weights for activities
              if (item.type === "meeting") {
                dataMap[dateStr] += 3; // 3 points for meetings
              } else if (item.type === "call" || item.type === "email") {
                dataMap[dateStr] += 2; // 2 points for outreach
              } else {
                dataMap[dateStr] += 1;
              }
            }
          }
        });
      }
    });
  }

  return Object.keys(dataMap).map((date) => ({
    date,
    count: dataMap[date],
  }));
};
