/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * TypeScript-style definition for the Lead object shape.
 *
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier for the lead.
 * @property {string} name - Full name of the lead contact.
 * @property {string} company - Company organization name.
 * @property {string} email - Contact email address.
 * @property {string} phone - Contact phone number.
 * @property {('New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost')} status - Current pipeline stage.
 * @property {('Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other')} source - Lead acquisition source.
 * @property {string} createdAt - Date and time when the lead was created (ISO format).
 * @property {string} [dateCreated] - Short date format for display compatibility (e.g. YYYY-MM-DD).
 * @property {string} [lastActive] - Short date format for last activity compatibility (e.g. YYYY-MM-DD).
 * @property {number} [value] - Deal value in USD.
 * @property {string} [role] - Job role of the lead.
 * @property {string} [priority] - Deal priority ('Low' | 'Medium' | 'High').
 * @property {string} [owner] - Owner/sales rep assigned to the lead.
 * @property {string} [description] - Description or notes.
 * @property {Array<{id: string, date: string, type: string, user: string, content: string}>} [timeline] - Historical logs.
 */

/** Core mock leads data matching the required lead attributes */
const INITIAL_LEADS = [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@acmecorp.com",
    phone: "+1 (555) 234-5678",
    company: "Acme Corp",
    role: "CTO",
    value: 25000,
    status: "Qualified",
    priority: "High",
    source: "Referral",
    owner: "Alex Rivera",
    dateCreated: "2026-05-10",
    lastActive: "2026-06-15",
    description: "Looking to replace their legacy client management systems. Expressed high interest in our API capabilities.",
    timeline: [
      { id: "t-1", date: "2026-05-10", type: "creation", user: "Alex Rivera", content: "Lead created via Referral link." },
      { id: "t-2", date: "2026-05-12", type: "email", user: "Alex Rivera", content: "Sent follow-up proposal with technical document." },
      { id: "t-3", date: "2026-06-15", type: "meeting", user: "Alex Rivera", content: "Product demo call completed successfully. Moved stage from Contacted to Qualified." }
    ]
  },
  {
    id: "lead-2",
    name: "David Chen",
    email: "d.chen@bytedance.io",
    phone: "+86 10 5858 2323",
    company: "ByteDance Ltd",
    role: "Head of Growth",
    value: 48000,
    status: "Proposal Sent",
    priority: "High",
    source: "LinkedIn",
    owner: "Jordan Taylor",
    dateCreated: "2026-04-18",
    lastActive: "2026-06-14",
    description: "Evaluating SaaS integrations for user onboarding tracking. Negotiation underway on custom enterprise terms.",
    timeline: [
      { id: "t-4", date: "2026-04-18", type: "creation", user: "System", content: "Lead identified via Outbound LinkedIn Campaign." },
      { id: "t-5", date: "2026-04-22", type: "call", user: "Jordan Taylor", content: "Discovery call scheduled and conducted." },
      { id: "t-6", date: "2026-06-02", type: "proposal", user: "Jordan Taylor", content: "Sent contract draft with tier-2 pricing details." }
    ]
  },
  {
    id: "lead-3",
    name: "Elena Rostova",
    email: "e.rostova@fintechflow.ru",
    phone: "+7 495 788-9000",
    company: "FinTech Flow",
    role: "Founder & CEO",
    value: 12000,
    status: "Won",
    priority: "Medium",
    source: "Other",
    owner: "Alex Rivera",
    dateCreated: "2026-05-01",
    lastActive: "2026-06-12",
    description: "Self-serve organic lead. Upgrade completed to annual Scale Plan.",
    timeline: [
      { id: "t-7", date: "2026-05-01", type: "creation", user: "System", content: "Signed up organic visitor via blog page search." },
      { id: "t-8", date: "2026-06-12", type: "won", user: "System", content: "Payment verified. Moved to Won stage. Annual subscription active." }
    ]
  },
  {
    id: "lead-4",
    name: "Marcus Aurelius",
    email: "m.aurelius@rome-logistics.com",
    phone: "+39 06 123456",
    company: "Rome Logistics",
    role: "VP Operations",
    value: 8500,
    status: "Contacted",
    priority: "Low",
    source: "Website",
    owner: "Sarah Vance",
    dateCreated: "2026-06-01",
    lastActive: "2026-06-15",
    description: "Inbound contact form request regarding container tracking templates.",
    timeline: [
      { id: "t-9", date: "2026-06-01", type: "creation", user: "System", content: "Inbound webform submitted." },
      { id: "t-10", date: "2026-06-15", type: "call", user: "Sarah Vance", content: "Introductory phone conversation. Sent email with basic templates." }
    ]
  },
  {
    id: "lead-5",
    name: "Liam O'Connor",
    email: "liam@dublindigital.ie",
    phone: "+353 1 496 0123",
    company: "Dublin Digital",
    role: "Product Lead",
    value: 18000,
    status: "New",
    priority: "Medium",
    source: "Website",
    owner: "Sarah Vance",
    dateCreated: "2026-06-15",
    lastActive: "2026-06-15",
    description: "Signed up for free tier but fits high-value profile. Needs immediate touchpoint.",
    timeline: [
      { id: "t-11", date: "2026-06-15", type: "creation", user: "System", content: "Account created on Free Tier." }
    ]
  },
  {
    id: "lead-6",
    name: "Sophia Rodriguez",
    email: "s.rodriguez@cloudscale.net",
    phone: "+1 (555) 890-1234",
    company: "CloudScale",
    role: "VP Marketing",
    value: 35000,
    status: "Won",
    priority: "High",
    source: "Referral",
    owner: "Jordan Taylor",
    dateCreated: "2026-03-10",
    lastActive: "2026-06-10",
    description: "Referred by long-time user. Highly visual dashboard reporting needs.",
    timeline: [
      { id: "t-12", date: "2026-03-10", type: "creation", user: "Jordan Taylor", content: "Referred by Acme CTO. Added to CRM." },
      { id: "t-13", date: "2026-06-10", type: "won", user: "Jordan Taylor", content: "Contracts signed. $35k contract closed." }
    ]
  },
  {
    id: "lead-7",
    name: "Kenji Sato",
    email: "sato@tokyo-ventures.jp",
    phone: "+81 3 5555 4444",
    company: "Tokyo Ventures",
    role: "Managing Partner",
    value: 60000,
    status: "Proposal Sent",
    priority: "High",
    source: "Cold Call",
    owner: "Alex Rivera",
    dateCreated: "2026-04-05",
    lastActive: "2026-06-14",
    description: "Venture firm seeking custom portal access for portfolio tracking. High ticket size.",
    timeline: [
      { id: "t-14", date: "2026-04-05", type: "creation", user: "System", content: "Cold email response converted to CRM lead." },
      { id: "t-15", date: "2026-06-14", type: "email", user: "Alex Rivera", content: "Updated proposal sent with security audits appended." }
    ]
  },
  {
    id: "lead-8",
    name: "Amanda Miller",
    email: "amanda@talentpool.io",
    phone: "+1 (555) 765-4321",
    company: "TalentPool",
    role: "Head of Talent Acquisition",
    value: 5000,
    status: "Lost",
    priority: "Low",
    source: "Website",
    owner: "Sarah Vance",
    dateCreated: "2026-05-15",
    lastActive: "2026-06-01",
    description: "Signed up for pilot but decided to build an internal tool instead.",
    timeline: [
      { id: "t-16", date: "2026-05-15", type: "creation", user: "System", content: "Lead created via web search landing page." },
      { id: "t-17", date: "2026-06-01", type: "lost", user: "Sarah Vance", content: "Closed as lost. Client selected internal script." }
    ]
  }
].map((lead) => ({
  ...lead,
  createdAt: lead.createdAt || new Date(lead.dateCreated).toISOString(),
}));

/**
 * LeadContext - Context object for sharing Leads data and actions.
 */
export const LeadContext = createContext();

/**
 * LeadProvider - Wraps child tree with LeadContext to enable sharing leads state.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child elements.
 * @returns {React.JSX.Element} Provider layout.
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("crm_leads");
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  // Persist state to localStorage on modification
  useEffect(() => {
    localStorage.setItem("crm_leads", JSON.stringify(leads));
  }, [leads]);

  /**
   * Generates a lead and adds it to pipeline state.
   * Automatically injects unique ID (UUID) and createdAt timestamp.
   *
   * @param {Omit<Lead, 'id' | 'createdAt'>} leadData - Field parameters for creating lead.
   * @returns {Lead} The full newly created Lead object.
   */
  const addLead = (leadData) => {
    const isoDate = new Date().toISOString();
    const shortDate = isoDate.split("T")[0];
    
    const newLead = {
      ...leadData,
      id: crypto.randomUUID(),
      createdAt: isoDate,
      dateCreated: shortDate,
      lastActive: shortDate,
      value: Number(leadData.value) || 0,
      timeline: leadData.timeline || [
        {
          id: `t-${Date.now()}`,
          date: shortDate,
          type: "creation",
          user: leadData.owner || "System",
          content: "Lead created."
        }
      ]
    };
    
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  /**
   * Merges modifications to an existing lead matching the specified id.
   *
   * @param {string} id - The lead id to modify.
   * @param {Partial<Lead>} updatedFields - Fields to update.
   */
  const updateLead = (id, updatedFields) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const today = new Date().toISOString().split("T")[0];
          const merged = { ...lead, ...updatedFields, lastActive: today };
          if ("value" in updatedFields) {
            merged.value = Number(updatedFields.value) || 0;
          }
          return merged;
        }
        return lead;
      })
    );
  };

  /**
   * Deletes a lead matching the specified id.
   *
   * @param {string} id - The lead id to remove.
   */
  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  /**
   * Retrieves a single lead object by its id.
   *
   * @param {string} id - Lead ID to lookup.
   * @returns {Lead|undefined} The matched lead object or undefined.
   */
  const getLeadById = (id) => {
    return leads.find((lead) => lead.id === id);
  };

  /**
   * Computes dashboard analytics statistics based on the active leads state.
   *
   * @returns {Object} Computed stats structure.
   */
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

  return (
    <LeadContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        getLeadById,
        getStats
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

LeadProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useLeads - Hook to consume LeadContext and handle exceptions if consumed out of tree bounds.
 *
 * @returns {Object} Context methods and values.
 * @throws {Error} If called outside of a LeadProvider context.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadProvider");
  }
  return context;
}
