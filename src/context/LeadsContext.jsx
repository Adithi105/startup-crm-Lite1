import React, { createContext, useContext, useState, useEffect } from "react";

const LeadsContext = createContext();

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
    status: "Proposal",
    priority: "High",
    source: "Outbound",
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
    source: "SEO",
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
    source: "Inbound",
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
    source: "Inbound",
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
    status: "Proposal",
    priority: "High",
    source: "Outbound",
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
    source: "SEO",
    owner: "Sarah Vance",
    dateCreated: "2026-05-15",
    lastActive: "2026-06-01",
    description: "Signed up for pilot but decided to build an internal tool instead.",
    timeline: [
      { id: "t-16", date: "2026-05-15", type: "creation", user: "System", content: "Lead created via web search landing page." },
      { id: "t-17", date: "2026-06-01", type: "lost", user: "Sarah Vance", content: "Closed as lost. Client selected internal script." }
    ]
  },
  {
    id: "lead-9",
    name: "Chloe Dupont",
    email: "c.dupont@parisretail.fr",
    phone: "+33 1 42 27 78 89",
    company: "Paris Retail Group",
    role: "COO",
    value: 15000,
    status: "Contacted",
    priority: "Medium",
    source: "Inbound",
    owner: "Jordan Taylor",
    dateCreated: "2026-06-08",
    lastActive: "2026-06-16",
    description: "Requires GDPR compliance guarantees and local hosting options.",
    timeline: [
      { id: "t-18", date: "2026-06-08", type: "creation", user: "System", content: "Lead created via organic download of privacy whitepaper." },
      { id: "t-19", date: "2026-06-16", type: "email", user: "Jordan Taylor", content: "GDPR compliance data sheet sent." }
    ]
  },
  {
    id: "lead-10",
    name: "Oliver Smith",
    email: "o.smith@londondevs.co.uk",
    phone: "+44 20 7946 0958",
    company: "London Devs Ltd",
    role: "Lead Engineer",
    value: 22000,
    status: "Qualified",
    priority: "Medium",
    source: "Referral",
    owner: "Sarah Vance",
    dateCreated: "2026-05-20",
    lastActive: "2026-06-11",
    description: "Referred by cloud service rep. Interested in scaling API access for custom webhooks.",
    timeline: [
      { id: "t-20", date: "2026-05-20", type: "creation", user: "Sarah Vance", content: "Referral log created." },
      { id: "t-21", date: "2026-06-11", type: "meeting", user: "Sarah Vance", content: "Technical session with development leads. Validated specs." }
    ]
  },
  {
    id: "lead-11",
    name: "Emma Watson",
    email: "e.watson@magicinc.com",
    phone: "+1 (555) 345-6789",
    company: "Magic Inc",
    role: "Director of CRM Integration",
    value: 50000,
    status: "Won",
    priority: "High",
    source: "Outbound",
    owner: "Jordan Taylor",
    dateCreated: "2026-03-22",
    lastActive: "2026-05-30",
    description: "Large marketing firm linking CRM pipelines with customer engagement. Seamless conversion.",
    timeline: [
      { id: "t-22", date: "2026-03-22", type: "creation", user: "System", content: "Outbound email campaign response." },
      { id: "t-23", date: "2026-05-30", type: "won", user: "Jordan Taylor", content: "Enterprise terms approved and funded." }
    ]
  },
  {
    id: "lead-12",
    name: "Noah Miller",
    email: "n.miller@greentech.org",
    phone: "+1 (555) 456-7890",
    company: "GreenTech Labs",
    role: "Co-Founder",
    value: 9500,
    status: "New",
    priority: "Low",
    source: "SEO",
    owner: "Alex Rivera",
    dateCreated: "2026-06-14",
    lastActive: "2026-06-14",
    description: "Non-profit lab seeking startup pricing discounts.",
    timeline: [
      { id: "t-24", date: "2026-06-14", type: "creation", user: "System", content: "Signed up via Google search result." }
    ]
  },
  {
    id: "lead-13",
    name: "Mia Wong",
    email: "m.wong@asialink.sg",
    phone: "+65 6789 0122",
    company: "AsiaLink Corp",
    role: "Regional Procurement Manager",
    value: 32000,
    status: "Qualified",
    priority: "Medium",
    source: "Inbound",
    owner: "Jordan Taylor",
    dateCreated: "2026-05-28",
    lastActive: "2026-06-15",
    description: "Multinational logistics hub in Singapore. Wants to standardize leads intake.",
    timeline: [
      { id: "t-25", date: "2026-05-28", type: "creation", user: "System", content: "Web contact inquiry regarding multi-region support." },
      { id: "t-26", date: "2026-06-15", type: "call", user: "Jordan Taylor", content: "Procurement prerequisites list received and vetted." }
    ]
  },
  {
    id: "lead-14",
    name: "Ethan Hunt",
    email: "e.hunt@impossible.gov",
    phone: "+1 (555) 911-0070",
    company: "IMF Corp",
    role: "Head of Operations Security",
    value: 80000,
    status: "Proposal",
    priority: "High",
    source: "Referral",
    owner: "Alex Rivera",
    dateCreated: "2026-05-05",
    lastActive: "2026-06-13",
    description: "Security-first implementation. Requires air-gapped on-prem mock options. High budget.",
    timeline: [
      { id: "t-27", date: "2026-05-05", type: "creation", user: "Alex Rivera", content: "Special referral intake." },
      { id: "t-28", date: "2026-06-13", type: "proposal", user: "Alex Rivera", content: "On-site security architecture draft proposal delivered." }
    ]
  },
  {
    id: "lead-15",
    name: "Isabella Vance",
    email: "i.vance@globalgrowth.com",
    phone: "+1 (555) 789-0123",
    company: "Global Growth Media",
    role: "CMO",
    value: 30000,
    status: "Contacted",
    priority: "High",
    source: "Outbound",
    owner: "Sarah Vance",
    dateCreated: "2026-06-10",
    lastActive: "2026-06-15",
    description: "Cold outreach campaign. Looking to link programmatic marketing spend to lead yields.",
    timeline: [
      { id: "t-29", date: "2026-06-10", type: "creation", user: "System", content: "Lead logged from outbound database." },
      { id: "t-30", date: "2026-06-15", type: "email", user: "Sarah Vance", content: "Introductory deck sent. Scheduled call for next week." }
    ]
  },
  {
    id: "lead-16",
    name: "James Stark",
    email: "j.stark@arcfusion.com",
    phone: "+1 (555) 901-2345",
    company: "Arc Fusion Systems",
    role: "Founder",
    value: 120000,
    status: "Lost",
    priority: "High",
    source: "Outbound",
    owner: "Jordan Taylor",
    dateCreated: "2026-02-10",
    lastActive: "2026-04-10",
    description: "Very high value project, but budget frozen due to hardware recall.",
    timeline: [
      { id: "t-31", date: "2026-02-10", type: "creation", user: "Jordan Taylor", content: "Outbound call converted." },
      { id: "t-32", date: "2026-04-10", type: "lost", user: "Jordan Taylor", content: "Lead closed as lost. Budget completely frozen." }
    ]
  }
];

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("crm_leads");
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  useEffect(() => {
    localStorage.setItem("crm_leads", JSON.stringify(leads));
  }, [leads]);

  const addLead = (newLead) => {
    const fresh = {
      ...newLead,
      id: `lead-${Date.now()}`,
      dateCreated: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      value: Number(newLead.value) || 0,
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "creation",
          user: newLead.owner || "System",
          content: "Lead created."
        }
      ]
    };
    setLeads((prev) => [fresh, ...prev]);
    return fresh;
  };

  const updateLeadStage = (leadId, newStage) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const today = new Date().toISOString().split("T")[0];
          const newLog = {
            id: `t-${Date.now()}`,
            date: today,
            type: newStage.toLowerCase() === "won" ? "won" : newStage.toLowerCase() === "lost" ? "lost" : "stage_change",
            user: lead.owner || "System",
            content: `Stage updated from '${lead.status}' to '${newStage}'.`
          };
          return {
            ...lead,
            status: newStage,
            lastActive: today,
            timeline: [...lead.timeline, newLog]
          };
        }
        return lead;
      })
    );
  };

  const addLeadNote = (leadId, noteText, noteType = "note", userName = "Alex Rivera") => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const today = new Date().toISOString().split("T")[0];
          const newLog = {
            id: `t-${Date.now()}`,
            date: today,
            type: noteType,
            user: userName,
            content: noteText
          };
          return {
            ...lead,
            lastActive: today,
            timeline: [...lead.timeline, newLog]
          };
        }
        return lead;
      })
    );
  };

  const updateLeadDetails = (leadId, updatedFields) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const today = new Date().toISOString().split("T")[0];
          // Only override value when explicitly provided to avoid zeroing out deal amounts
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

  const deleteLead = (leadId) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  const resetLeads = () => {
    setLeads(INITIAL_LEADS);
  };

  // Get global stats
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
    <LeadsContext.Provider
      value={{
        leads,
        stages: STAGES,
        addLead,
        updateLeadStage,
        addLeadNote,
        updateLeadDetails,
        deleteLead,
        resetLeads,
        getStats
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
}
