/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import leadService from "../services/leadService";
import { useAuth } from "./AuthContext";

export const LeadContext = createContext();

/**
 * Maps database lead object (which has _id) to frontend format (with id).
 */
function mapLead(lead) {
  if (!lead) return null;
  return {
    ...lead,
    id: lead._id || lead.id,
    // Provide fallback properties so mock UI doesn't crash
    value: Number(lead.value) || 0,
    priority: lead.priority || "Medium",
    role: lead.role || "",
    description: lead.description || lead.notes || "",
    timeline: lead.timeline || []
  };
}

export function LeadProvider({ children }) {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  const [statsData, setStatsData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);

  // Fetch leads on parameter change or initial load
  const fetchLeads = async (params = {}) => {
    setIsLoading(true);
    try {
      const response = await leadService.getLeads(params);
      // Backend returns paginated response: { success: true, data: [...], pagination: {...} }
      const leadsList = response.data || [];
      const mapped = leadsList.map(mapLead);
      setLeads(mapped);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch leads";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leads automatically when authenticated token changes
  useEffect(() => {
    if (token) {
      fetchLeads();
    } else {
      setLeads([]);
    }
  }, [token]);

  const addLead = async (leadData) => {
    try {
      const response = await leadService.createLead(leadData);
      const newLead = mapLead(response.data || response);
      setLeads((prev) => [newLead, ...prev]);
      toast.success(`${newLead.name} added to pipeline`);
      return newLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add lead";
      toast.error(errorMsg);
      throw error;
    }
  };

  const updateLead = async (id, leadData) => {
    try {
      const response = await leadService.updateLead(id, leadData);
      const updated = mapLead(response.data || response);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      toast.success(`${updated.name} updated successfully`);
      return updated;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update lead";
      toast.error(errorMsg);
      throw error;
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      const response = await leadService.updateLeadStatus(id, status);
      const updated = mapLead(response.data || response);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      toast.success("Lead status updated successfully");
      return updated;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update lead status";
      toast.error(errorMsg);
      throw error;
    }
  };

  const deleteLead = async (id) => {
    try {
      await leadService.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to delete lead";
      toast.error(errorMsg);
      throw error;
    }
  };

  const getLeadById = (id) => {
    return leads.find((l) => l.id === id);
  };

  // Local fallback stats computation to keep existing UI fully working
  const getStats = () => {
    const totalCount = leads.length;
    const activeLeads = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
    const wonLeads = leads.filter((l) => l.status === "Won");
    const lostLeads = leads.filter((l) => l.status === "Lost");

    const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const activeValue = activeLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);

    return {
      totalCount,
      activeCount: activeLeads.length,
      wonCount: wonLeads.length,
      lostCount: lostLeads.length,
      totalValue,
      activeValue,
      wonValue,
      avgValue: totalCount > 0 ? Math.round(totalValue / totalCount) : 0
    };
  };

  const fetchStats = async () => {
    try {
      const data = await leadService.getLeadStats();
      setStatsData(data.data || data);
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch lead stats from API:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const data = await leadService.getMonthlyStats();
      setMonthlyStats(data.data || data);
      return data.data || data;
    } catch (error) {
      console.error("Failed to fetch monthly stats from API:", error);
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        isLoading,
        pagination,
        statsData,
        monthlyStats,
        fetchLeads,
        addLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        getLeadById,
        getStats,
        fetchStats,
        fetchMonthlyStats
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

LeadProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadProvider");
  }
  return context;
}
