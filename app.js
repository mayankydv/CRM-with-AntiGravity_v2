// MedTrack CRM - Core Controller Logic (app.js)

// --- CONFIG & CONSTANTS ---
const DEFAULT_CONFIG = {
  audienceTypes: ["Clinic", "Hospital", "Doctor", "Diagnostic Centre"],
  meetingPurposes: ["First Contact", "Follow Up", "Proposal Review", "Contract Negotiation", "Closure"],
  leadStatuses: ["Contacted", "Qualified", "Referral Started", "Converted", "Lost"],
  meetingOutcomes: ["Interested", "Proposal Submitted", "Referral Started", "Lost Opportunity", "No Response", "Postponed"],
  nonConversionReasons: ["Pricing too high", "Doctor aligned elsewhere", "Lack of specialities", "Distance issue", "Service delay", "Other"]
};

const DEFAULT_USERS = [
  { name: "Rahul", pin: "1111", role: "Rep", active: true },
  { name: "Mayank", pin: "6842", role: "Manager", active: true },
  { name: "Admin", pin: "9999", role: "Admin", active: true }
];

const DEFAULT_FORM_FIELDS = [
  { id: "speciality", label: "Speciality Focus", type: "dropdown", mandatory: true, options: ["Cardiology", "Neurology", "Orthopaedics", "Oncology", "Paediatrics", "General Medicine"], active: true, target: "lead" },
  { id: "referralPotentialVolume", label: "Est. Monthly Referrals", type: "number", mandatory: false, options: [], active: true, target: "lead" },
  { id: "competitorActivity", label: "Competitor presence notes", type: "textarea", mandatory: false, options: [], active: true, target: "lead" }
];

const DEFAULT_LEADS = [
  { leadId: "L-001", organisation: "City Heart Clinic", poc1: "Dr. A.K. Sharma (+91 98765 43210)", poc2: "Amit (Manager)", audienceType: "Clinic", owner: "Rahul", status: "Converted", followup: "2026-06-01", revenuePotential: 45000, nonConversionReason: "", nonConversionAction: "", createdAt: "2026-05-10T10:00:00.000Z", updatedAt: "2026-05-20T14:30:00.000Z", archived: false, customFields: { speciality: "Cardiology", referralPotentialVolume: "15" } },
  { leadId: "L-002", organisation: "Apollo Diagnostic Center", poc1: "Dr. Priya Patel (+91 99988 87766)", poc2: "Sunita (Reception)", audienceType: "Diagnostic Centre", owner: "Rahul", status: "Referral Started", followup: "2026-05-25", revenuePotential: 30000, nonConversionReason: "", nonConversionAction: "", createdAt: "2026-05-12T11:00:00.000Z", updatedAt: "2026-05-21T09:00:00.000Z", archived: false, customFields: { speciality: "Neurology", referralPotentialVolume: "8" } },
  { leadId: "L-003", organisation: "Care Family Hospital", poc1: "Dr. Rajesh Gupta (+91 88877 66554)", poc2: "", audienceType: "Hospital", owner: "Rahul", status: "Lost", followup: "", revenuePotential: 75000, nonConversionReason: "Pricing too high", nonConversionAction: "Offer customized discount package in next cycle", createdAt: "2026-05-05T09:30:00.000Z", updatedAt: "2026-05-18T16:00:00.000Z", archived: false, customFields: { speciality: "Orthopaedics", referralPotentialVolume: "25" } },
  { leadId: "L-004", organisation: "Metro Scan Center", poc1: "Dr. Vinay Roy", poc2: "", audienceType: "Diagnostic Centre", owner: "Mayank", status: "Qualified", followup: "2026-05-26", revenuePotential: 20000, nonConversionReason: "", nonConversionAction: "", createdAt: "2026-05-15T08:00:00.000Z", updatedAt: "2026-05-22T10:30:00.000Z", archived: false, customFields: { speciality: "Oncology", referralPotentialVolume: "10" } },
  { leadId: "L-005", organisation: "Shanti Maternity Home", poc1: "Dr. Sneha Patil", poc2: "", audienceType: "Clinic", owner: "Rahul", status: "Contacted", followup: "2026-05-24", revenuePotential: 15000, nonConversionReason: "", nonConversionAction: "", createdAt: "2026-05-20T15:00:00.000Z", updatedAt: "2026-05-20T15:00:00.000Z", archived: false, customFields: { speciality: "Paediatrics", referralPotentialVolume: "5" } }
];

const DEFAULT_MEETINGS = [
  { meetingId: "M-001", leadId: "L-001", purpose: "First Contact", notes: "Met doctor, briefed about cardiology ICU features. Doctor interested.", outcome: "Interested", owner: "Rahul", gps: "23.3315, 75.0354", date: "2026-05-10", followup: "2026-05-15", createdAt: "2026-05-10T10:30:00.000Z", archived: false },
  { meetingId: "M-002", leadId: "L-001", purpose: "Proposal Review", notes: "Reviewed referral rates structure. Finalized discount on scans.", outcome: "Referral Started", owner: "Rahul", gps: "23.3315, 75.0354", date: "2026-05-15", followup: "2026-05-20", createdAt: "2026-05-15T15:00:00.000Z", archived: false },
  { meetingId: "M-003", leadId: "L-003", purpose: "First Contact", notes: "Introduced our orthopaedic services. Doctor feels price is higher than competitor.", outcome: "Proposal Submitted", owner: "Rahul", gps: "23.3298, 75.0412", date: "2026-05-05", followup: "2026-05-12", createdAt: "2026-05-05T10:00:00.000Z", archived: false },
  { meetingId: "M-004", leadId: "L-003", purpose: "Follow Up", notes: "Followed up with proposal. Doctor declined saying competitor is closer.", outcome: "Lost Opportunity", owner: "Rahul", gps: "23.3298, 75.0412", date: "2026-05-18", followup: "", createdAt: "2026-05-18T16:00:00.000Z", archived: false }
];

// --- DATABASE HANDLER (LOCAL-FIRST) ---
class CRMDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem("medtrack_users")) {
      localStorage.setItem("medtrack_users", JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem("medtrack_config")) {
      localStorage.setItem("medtrack_config", JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem("medtrack_form_fields")) {
      localStorage.setItem("medtrack_form_fields", JSON.stringify(DEFAULT_FORM_FIELDS));
    }
    if (!localStorage.getItem("medtrack_leads")) {
      localStorage.setItem("medtrack_leads", JSON.stringify(DEFAULT_LEADS));
    }
    if (!localStorage.getItem("medtrack_meetings")) {
      localStorage.setItem("medtrack_meetings", JSON.stringify(DEFAULT_MEETINGS));
    }
    if (!localStorage.getItem("medtrack_sync_url")) {
      localStorage.setItem("medtrack_sync_url", "");
    }
    if (!localStorage.getItem("medtrack_last_sync")) {
      localStorage.setItem("medtrack_last_sync", "Never");
    }
  }

  // Generic Getters / Setters
  get(key) {
    return JSON.parse(localStorage.getItem(`medtrack_${key}`)) || [];
  }

  set(key, data) {
    localStorage.setItem(`medtrack_${key}`, JSON.stringify(data));
  }

  // Specific APIs
  getUsers() { return this.get("users"); }
  saveUsers(users) { this.set("users", users); }

  getConfig() { return JSON.parse(localStorage.getItem("medtrack_config")) || DEFAULT_CONFIG; }
  saveConfig(config) { localStorage.setItem("medtrack_config", JSON.stringify(config)); }

  getFormFields() { return this.get("form_fields"); }
  saveFormFields(fields) { this.set("form_fields", fields); }

  getLeads() { return this.get("leads").filter(l => !l.archived); }
  saveLead(lead) {
    const leads = this.get("leads");
    lead.updatedAt = new Date().toISOString();
    const idx = leads.findIndex(l => l.leadId === lead.leadId);
    if (idx !== -1) {
      leads[idx] = lead;
    } else {
      lead.createdAt = lead.updatedAt;
      leads.push(lead);
    }
    this.set("leads", leads);
  }

  getMeetings() { return this.get("meetings").filter(m => !m.archived); }
  saveMeeting(meeting) {
    const meetings = this.get("meetings");
    meeting.createdAt = meeting.createdAt || new Date().toISOString();
    const idx = meetings.findIndex(m => m.meetingId === meeting.meetingId);
    if (idx !== -1) {
      meetings[idx] = meeting;
    } else {
      meetings.push(meeting);
    }
    this.set("meetings", meetings);
  }

  getSyncSettings() {
    return {
      url: localStorage.getItem("medtrack_sync_url") || "",
      lastSync: localStorage.getItem("medtrack_last_sync") || "Never"
    };
  }

  saveSyncSettings(url) {
    localStorage.setItem("medtrack_sync_url", url);
  }

  clearCache() {
    localStorage.removeItem("medtrack_users");
    localStorage.removeItem("medtrack_config");
    localStorage.removeItem("medtrack_form_fields");
    localStorage.removeItem("medtrack_leads");
    localStorage.removeItem("medtrack_meetings");
    localStorage.removeItem("medtrack_last_sync");
    this.init();
  }
}

const db = new CRMDatabase();

// --- STATE MANAGEMENT ---
let currentUser = null;
let currentPinInput = "";
let selectedLead = null;
let photoPreviewBase64 = null;

// --- ROUTING ---
const routes = {
  "#/login": { view: "loginView", title: "Login", permission: ["Rep", "Manager", "Admin"] },
  "#/dashboard": { view: "dashboardView", title: "Dashboard", permission: ["Rep", "Manager", "Admin"] },
  "#/leads": { view: "leadsView", title: "Leads", permission: ["Rep", "Manager", "Admin"] },
  "#/meetings": { view: "meetingsView", title: "Meetings List", permission: ["Rep", "Manager", "Admin"] },
  "#/reports": { view: "reportsView", title: "Analytics Reports", permission: ["Manager", "Admin"] },
  "#/admin": { view: "adminView", title: "Admin Panel", permission: ["Admin"] }
};

function handleRouting() {
  const hash = window.location.hash || "#/login";
  
  // Verify Session
  checkSession();

  if (!currentUser && hash !== "#/login") {
    window.location.hash = "#/login";
    return;
  }

  if (currentUser && hash === "#/login") {
    window.location.hash = "#/dashboard";
    return;
  }

  const route = routes[hash];
  if (!route) {
    window.location.hash = "#/dashboard";
    return;
  }

  // Check Role Permissions
  if (currentUser && !route.permission.includes(currentUser.role)) {
    showToast("Access Denied: Insufficient Permissions", "error");
    window.location.hash = "#/dashboard";
    return;
  }

  // Render Views
  document.querySelectorAll(".view-container").forEach(el => el.classList.remove("active"));
  const viewEl = document.getElementById(route.view);
  if (viewEl) viewEl.classList.add("active");

  // Highlight bottom navigation tabs
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const activeNavItem = document.querySelector(`.nav-item[href="${hash}"]`);
  if (activeNavItem) activeNavItem.classList.add("active");

  // Load view contents
  initView(hash);
}

function checkSession() {
  const storedUser = localStorage.getItem("medtrack_session");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    document.getElementById("navBar").style.display = "flex";
    document.getElementById("appHeader").style.display = "flex";
    document.getElementById("currentUserLabel").innerText = `${currentUser.name} (${currentUser.role})`;
    
    // Hide tabs based on roles
    const managerTabs = document.querySelectorAll(".nav-manager-only");
    const adminTabs = document.querySelectorAll(".nav-admin-only");
    
    if (currentUser.role === "Rep") {
      managerTabs.forEach(t => t.style.display = "none");
      adminTabs.forEach(t => t.style.display = "none");
    } else if (currentUser.role === "Manager") {
      managerTabs.forEach(t => t.style.display = "flex");
      adminTabs.forEach(t => t.style.display = "none");
    } else {
      managerTabs.forEach(t => t.style.display = "flex");
      adminTabs.forEach(t => t.style.display = "flex");
    }
  } else {
    currentUser = null;
    document.getElementById("navBar").style.display = "none";
    document.getElementById("appHeader").style.display = "none";
  }
}

// --- DYNAMIC VIEW INITIALIZERS ---
function initView(hash) {
  switch (hash) {
    case "#/login":
      resetPinDisplay();
      break;
    case "#/dashboard":
      renderDashboard();
      break;
    case "#/leads":
      renderLeadsList();
      break;
    case "#/meetings":
      renderMeetingsList();
      break;
    case "#/reports":
      renderReports();
      break;
    case "#/admin":
      renderAdminPanel();
      break;
  }
}

// --- AUTHENTICATION ACTIONS ---
function handlePinKey(key) {
  if (key === "clear") {
    currentPinInput = "";
  } else if (key === "backspace") {
    currentPinInput = currentPinInput.slice(0, -1);
  } else if (currentPinInput.length < 4) {
    currentPinInput += key;
  }

  updatePinDots();

  if (currentPinInput.length === 4) {
    // Validate PIN
    const users = db.getUsers();
    const matchedUser = users.find(u => u.pin === currentPinInput && u.active);
    
    if (matchedUser) {
      localStorage.setItem("medtrack_session", JSON.stringify(matchedUser));
      showToast(`Welcome back, ${matchedUser.name}!`, "success");
      currentPinInput = "";
      setTimeout(() => {
        window.location.hash = "#/dashboard";
      }, 500);
    } else {
      const errEl = document.getElementById("authError");
      errEl.classList.add("show");
      currentPinInput = "";
      setTimeout(() => {
        errEl.classList.remove("show");
        updatePinDots();
      }, 1500);
    }
  }
}

function updatePinDots() {
  const dots = document.querySelectorAll(".pin-dot");
  dots.forEach((dot, idx) => {
    if (idx < currentPinInput.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function resetPinDisplay() {
  currentPinInput = "";
  updatePinDots();
}

function logout() {
  localStorage.removeItem("medtrack_session");
  currentUser = null;
  showToast("Logged out successfully", "info");
  window.location.hash = "#/login";
}

// --- DASHBOARD ACTIONS & CHARTS ---
function renderDashboard() {
  const leads = db.getLeads();
  const meetings = db.getMeetings();

  // Filters based on Role (Reps can only see their own leads unless manager/admin)
  const repFilter = (item) => currentUser.role === "Rep" ? item.owner === currentUser.name : true;
  const filteredLeads = leads.filter(repFilter);
  const filteredMeetings = meetings.filter(repFilter);

  // Metrics calculations
  const totalLeads = filteredLeads.length;
  const activeLeads = filteredLeads.filter(l => l.status !== "Converted" && l.status !== "Lost").length;
  const meetingsCompleted = filteredMeetings.filter(m => m.outcome !== "Postponed").length;

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingFollowups = filteredLeads.filter(l => l.followup && l.followup <= todayStr && l.status !== "Converted" && l.status !== "Lost").length;

  const convertedLeads = filteredLeads.filter(l => l.status === "Converted").length;
  const lostLeads = filteredLeads.filter(l => l.status === "Lost").length;

  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const lostRate = totalLeads ? Math.round((lostLeads / totalLeads) * 100) : 0;

  const revenuePotential = filteredLeads.reduce((acc, l) => acc + (l.revenuePotential || 0), 0);

  // Bind Metrics UI
  document.getElementById("metricTotalLeads").innerText = totalLeads;
  document.getElementById("metricMeetings").innerText = meetingsCompleted;
  document.getElementById("metricActiveLeads").innerText = activeLeads;
  document.getElementById("metricFollowups").innerText = pendingFollowups;
  document.getElementById("metricConversionRate").innerText = `${conversionRate}%`;

  // Render Pipeline Funnel
  renderFunnelChart(filteredLeads);

  // Render Rep Rankings Leaderboard (only meaningful for Admin/Manager)
  renderRepRanking(leads);

  // Render Lost Reasons Pie/Donut Chart
  renderLostReasonsChart(filteredLeads);
}

function renderFunnelChart(filteredLeads) {
  const stages = [
    { label: "Visits / Contacts", status: "Contacted" },
    { label: "Qualified Leads", status: "Qualified" },
    { label: "Referrals Started", status: "Referral Started" },
    { label: "Converted Patients", status: "Converted" }
  ];

  const chartEl = document.getElementById("pipelineFunnelChart");
  chartEl.innerHTML = "";

  // Accumulate count from bottom-up for proper pipeline flow (Converted has converted count; Contacted has all)
  let count = 0;
  const counts = stages.map(stage => {
    if (stage.status === "Contacted") {
      count = filteredLeads.length;
    } else if (stage.status === "Qualified") {
      count = filteredLeads.filter(l => l.status !== "Contacted").length;
    } else if (stage.status === "Referral Started") {
      count = filteredLeads.filter(l => l.status === "Referral Started" || l.status === "Converted").length;
    } else {
      count = filteredLeads.filter(l => l.status === "Converted").length;
    }
    return { label: stage.label, count };
  });

  const maxCount = counts[0]?.count || 1;

  counts.forEach((item, index) => {
    const widthPct = Math.max(30, Math.round((item.count / maxCount) * 100));
    const opacity = 1 - (index * 0.15);
    
    const stageEl = document.createElement("div");
    stageEl.className = "funnel-stage";
    stageEl.style.width = `${widthPct}%`;
    stageEl.style.backgroundColor = `rgba(15, 76, 97, ${opacity})`;
    stageEl.style.alignSelf = "center";
    
    stageEl.innerHTML = `
      <span class="funnel-stage-label">${item.label}</span>
      <span class="funnel-stage-value">${item.count}</span>
    `;
    chartEl.appendChild(stageEl);
  });
}

function renderRepRanking(allLeads) {
  // Aggregate revenue and conversions by rep
  const repStats = {};
  allLeads.forEach(lead => {
    if (!repStats[lead.owner]) {
      repStats[lead.owner] = { name: lead.owner, conversions: 0, revenue: 0 };
    }
    if (lead.status === "Converted") {
      repStats[lead.owner].conversions += 1;
    }
    repStats[lead.owner].revenue += (lead.revenuePotential || 0);
  });

  const repsArray = Object.values(repStats).sort((a, b) => b.revenue - a.revenue);
  const container = document.getElementById("repRankingsChart");
  container.innerHTML = "";

  if (repsArray.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px;">No Rep data available</div>`;
    return;
  }

  const maxRevenue = repsArray[0].revenue || 1;

  repsArray.forEach(rep => {
    const pct = Math.round((rep.revenue / maxRevenue) * 100);
    const itemEl = document.createElement("div");
    itemEl.className = "ranking-item";
    itemEl.innerHTML = `
      <div class="ranking-meta">
        <span class="ranking-name">${rep.name} (${rep.conversions} Converted)</span>
        <span class="ranking-score">₹${rep.revenue.toLocaleString()}</span>
      </div>
      <div class="ranking-bar-wrapper">
        <div class="ranking-bar" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(itemEl);
  });
}

function renderLostReasonsChart(filteredLeads) {
  const config = db.getConfig();
  const lostLeads = filteredLeads.filter(l => l.status === "Lost");
  
  const reasonCounts = {};
  config.nonConversionReasons.forEach(r => reasonCounts[r] = 0);
  lostLeads.forEach(lead => {
    const r = lead.nonConversionReason || "Other";
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  const dataset = Object.entries(reasonCounts).filter(([_, count]) => count > 0);
  const totalLost = lostLeads.length;
  
  const container = document.getElementById("lostReasonsChart");
  container.innerHTML = "";

  if (totalLost === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:20px;">No lost opportunities recorded yet. Great!</div>`;
    return;
  }

  // Draw pure SVG pie chart
  let svgContent = `<svg viewBox="0 0 100 100" width="120" height="120" style="transform: rotate(-90deg); flex-shrink:0;">`;
  let cumAngle = 0;
  
  const colors = ["#ef4444", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#64748b"];

  dataset.forEach(([reason, count], idx) => {
    const pct = count / totalLost;
    const angle = pct * 360;
    
    // Calculate arc path
    const x1 = 50 + 40 * Math.cos((cumAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((cumAngle * Math.PI) / 180);
    
    cumAngle += angle;
    
    const x2 = 50 + 40 * Math.cos((cumAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((cumAngle * Math.PI) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    svgContent += `<path d="M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[idx % colors.length]}"></path>`;
  });
  
  svgContent += `<circle cx="50" cy="50" r="22" fill="white"></circle>`;
  svgContent += `</svg>`;

  // Create Legend
  let legendContent = `<div style="display:flex; flex-direction:column; gap:6px; flex:1;">`;
  dataset.forEach(([reason, count], idx) => {
    const pct = Math.round((count / totalLost) * 100);
    legendContent += `
      <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem;">
        <span style="width:10px; height:10px; border-radius:50%; background-color:${colors[idx % colors.length]}; display:inline-block;"></span>
        <span style="font-weight:600; flex:1;">${reason}</span>
        <span style="color:var(--text-muted)">${count} (${pct}%)</span>
      </div>
    `;
  });
  legendContent += `</div>`;

  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "20px";
  wrap.style.width = "100%";
  wrap.innerHTML = svgContent + legendContent;
  
  container.appendChild(wrap);
}

// --- LEADS ACTIONS ---
let activeStatusFilter = "All";

function renderLeadsList() {
  const leads = db.getLeads();
  const searchVal = document.getElementById("leadSearchInput").value.toLowerCase();
  
  // Reps can only view own leads
  const ownerFilter = (item) => currentUser.role === "Rep" ? item.owner === currentUser.name : true;
  
  // Render Filters chips dynamically
  renderLeadFilterChips(leads);

  const container = document.getElementById("leadsListContainer");
  container.innerHTML = "";

  const filtered = leads
    .filter(ownerFilter)
    .filter(lead => {
      const matchSearch = lead.organisation.toLowerCase().includes(searchVal) || 
                          lead.poc1.toLowerCase().includes(searchVal) ||
                          lead.owner.toLowerCase().includes(searchVal);
      const matchStatus = activeStatusFilter === "All" || lead.status === activeStatusFilter;
      return matchSearch && matchStatus;
    });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:32px 0;">No leads found. Tap the '+' button to add.</div>`;
    return;
  }

  filtered.forEach(lead => {
    const card = document.createElement("div");
    card.className = "record-card glass";
    card.onclick = () => showLeadDetail(lead.leadId);

    const statusBadgeClass = `badge-${lead.status.toLowerCase().replace(" ", "-")}`;

    card.innerHTML = `
      <div class="record-header">
        <div class="record-title">${lead.organisation}</div>
        <div class="record-badge ${statusBadgeClass}">${lead.status}</div>
      </div>
      <div class="record-details">
        <div class="record-detail-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
          <span>${lead.poc1.split(" ")[0]}...</span>
        </div>
        <div class="record-detail-item">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${lead.followup ? "Next: " + lead.followup : "No Followup"}</span>
        </div>
      </div>
      <div class="record-footer">
        <div class="record-owner">
          <div class="record-owner-avatar">${lead.owner[0]}</div>
          <span>${lead.owner}</span>
        </div>
        <div class="record-time">
          Potential: ₹${(lead.revenuePotential || 0).toLocaleString()}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderLeadFilterChips(leads) {
  const container = document.getElementById("leadFilterChips");
  container.innerHTML = "";

  const statuses = ["All", ...db.getConfig().leadStatuses];
  
  statuses.forEach(status => {
    const chip = document.createElement("div");
    chip.className = `filter-chip ${activeStatusFilter === status ? "active" : ""}`;
    chip.innerText = status;
    chip.onclick = (e) => {
      e.stopPropagation();
      activeStatusFilter = status;
      renderLeadsList();
    };
    container.appendChild(chip);
  });
}

function toggleLeadFilterSheet() {
  const el = document.getElementById("leadFilterChips");
  el.classList.toggle("show");
}

// --- MEETINGS ACTIONS ---
function renderMeetingsList() {
  const meetings = db.getMeetings();
  const searchVal = document.getElementById("meetingSearchInput").value.toLowerCase();
  const ownerFilter = (item) => currentUser.role === "Rep" ? item.owner === currentUser.name : true;

  const container = document.getElementById("meetingsListContainer");
  container.innerHTML = "";

  const leads = db.getLeads();

  const filtered = meetings
    .filter(ownerFilter)
    .filter(meeting => {
      const lead = leads.find(l => l.leadId === meeting.leadId);
      const orgName = lead ? lead.organisation : "";
      return orgName.toLowerCase().includes(searchVal) || 
             meeting.purpose.toLowerCase().includes(searchVal) ||
             meeting.owner.toLowerCase().includes(searchVal);
    });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:32px 0;">No meetings found. Tap the '+' button to log.</div>`;
    return;
  }

  filtered.forEach(meeting => {
    const lead = leads.find(l => l.leadId === meeting.leadId);
    const orgName = lead ? lead.organisation : "Unknown Hospital";

    const card = document.createElement("div");
    card.className = "record-card glass";
    card.onclick = () => showMeetingDetail(meeting.meetingId);

    card.innerHTML = `
      <div class="record-header">
        <div class="record-title">${orgName}</div>
        <div class="record-badge badge-qualified">${meeting.purpose}</div>
      </div>
      <div class="record-details" style="grid-template-columns: 1fr;">
        <div class="record-detail-item" style="font-weight: 500;">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"></path></svg>
          <span>GPS: ${meeting.gps || "Not Captured"}</span>
        </div>
        <div class="record-detail-item">
          <span>Notes: ${meeting.notes.substring(0, 50)}...</span>
        </div>
      </div>
      <div class="record-footer">
        <div class="record-owner">
          <div class="record-owner-avatar">${meeting.owner[0]}</div>
          <span>${meeting.owner}</span>
        </div>
        <div class="record-time">
          ${meeting.date}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- FORM ENGINE (DYNAMIC RENDERING) ---
function openAddLeadSheet() {
  selectedLead = null;
  document.getElementById("leadSheetTitle").innerText = "Add New Lead";
  document.getElementById("leadFormSubmitBtn").innerText = "Save Lead";
  document.getElementById("leadDeleteBtn").style.display = "none";
  
  // Clear core inputs
  document.getElementById("leadOrg").value = "";
  document.getElementById("leadPoc1").value = "";
  document.getElementById("leadPoc2").value = "";
  document.getElementById("leadRevenue").value = "";
  document.getElementById("leadFollowup").value = "";
  
  // Populate dropdowns from dynamic configuration
  populateDropdown("leadAudience", db.getConfig().audienceTypes);
  populateDropdown("leadStatus", db.getConfig().leadStatuses);
  populateDropdown("leadLostReason", db.getConfig().nonConversionReasons, true);

  // Toggle reasons box when status changes
  toggleLostReasonsBox();

  // Render custom fields
  renderDynamicCustomFields("leadCustomFieldsContainer", "lead");

  // Show bottom sheet
  document.getElementById("leadFormSheet").style.display = "flex";
}

function openAddMeetingSheet() {
  document.getElementById("meetingSheetTitle").innerText = "Log Client Meeting";
  
  // Populate Leads Dropdown
  const leadsDropdown = document.getElementById("meetingLeadId");
  leadsDropdown.innerHTML = "";
  const leads = db.getLeads().filter(l => currentUser.role === "Rep" ? l.owner === currentUser.name : true);
  leads.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.leadId;
    opt.innerText = l.organisation;
    leadsDropdown.appendChild(opt);
  });

  // Populate config dropdowns
  populateDropdown("meetingPurpose", db.getConfig().meetingPurposes);
  populateDropdown("meetingOutcome", db.getConfig().meetingOutcomes);
  
  // Clear fields
  document.getElementById("meetingNotes").value = "";
  document.getElementById("meetingDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("meetingFollowup").value = "";
  document.getElementById("meetingGps").value = "";
  document.getElementById("gpsCoordsDisplay").innerText = "Tap button below to capture";
  
  // Photo reset
  photoPreviewBase64 = null;
  const imgPreview = document.getElementById("photoCapturePreview");
  imgPreview.src = "";
  imgPreview.style.display = "none";

  // Dynamic custom fields
  renderDynamicCustomFields("meetingCustomFieldsContainer", "meeting");

  document.getElementById("meetingFormSheet").style.display = "flex";
}

function populateDropdown(elId, list, addEmpty = false) {
  const el = document.getElementById(elId);
  el.innerHTML = "";
  if (addEmpty) {
    el.innerHTML = `<option value="">-- Choose Reason (if Lost) --</option>`;
  }
  list.forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.innerText = val;
    el.appendChild(opt);
  });
}

function toggleLostReasonsBox() {
  const status = document.getElementById("leadStatus").value;
  const lostBox = document.getElementById("lostReasonSection");
  if (status === "Lost") {
    lostBox.style.display = "block";
    document.getElementById("leadLostReason").setAttribute("required", "true");
  } else {
    lostBox.style.display = "none";
    document.getElementById("leadLostReason").removeAttribute("required");
  }
}

// Render dynamic custom inputs configured by Admin
function renderDynamicCustomFields(containerId, target) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const fields = db.getFormFields().filter(f => f.active && f.target === target);

  fields.forEach(field => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.className = `form-label ${field.mandatory ? "required" : ""}`;
    label.innerText = field.label;
    group.appendChild(label);

    let input;
    if (field.type === "dropdown") {
      input = document.createElement("select");
      input.className = "form-control dynamic-field";
      input.id = `custom_${field.id}`;
      if (field.mandatory) input.required = true;
      
      input.innerHTML = `<option value="">-- Select Option --</option>`;
      field.options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.innerText = opt;
        input.appendChild(o);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.className = "form-control dynamic-field";
      input.id = `custom_${field.id}`;
      if (field.mandatory) input.required = true;
    } else if (field.type === "checkbox") {
      group.className = "form-checkbox";
      input = document.createElement("input");
      input.type = "checkbox";
      input.className = "dynamic-field";
      input.id = `custom_${field.id}`;
      label.className = "";
      label.prepend(input);
      // swap children to make label appear after checkbox
      group.appendChild(label);
      container.appendChild(group);
      return;
    } else {
      input = document.createElement("input");
      input.type = field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "number" ? "number" : "text";
      input.className = "form-control dynamic-field";
      input.id = `custom_${field.id}`;
      if (field.mandatory) input.required = true;
    }

    group.appendChild(input);
    container.appendChild(group);
  });
}

// Save Lead Form Submit
function submitLeadForm(e) {
  e.preventDefault();
  
  const leadId = selectedLead ? selectedLead.leadId : "L-" + Math.floor(Math.random() * 9000 + 1000);
  const status = document.getElementById("leadStatus").value;

  const customFieldsData = {};
  const dynamicInputs = document.querySelectorAll("#leadCustomFieldsContainer .dynamic-field");
  dynamicInputs.forEach(input => {
    const fid = input.id.replace("custom_", "");
    customFieldsData[fid] = input.type === "checkbox" ? input.checked : input.value;
  });

  const leadData = {
    leadId,
    organisation: document.getElementById("leadOrg").value,
    poc1: document.getElementById("leadPoc1").value,
    poc2: document.getElementById("leadPoc2").value,
    audienceType: document.getElementById("leadAudience").value,
    owner: selectedLead ? selectedLead.owner : currentUser.name,
    status,
    followup: document.getElementById("leadFollowup").value,
    revenuePotential: parseFloat(document.getElementById("leadRevenue").value) || 0,
    nonConversionReason: status === "Lost" ? document.getElementById("leadLostReason").value : "",
    nonConversionAction: status === "Lost" ? document.getElementById("leadLostAction").value : "",
    createdAt: selectedLead ? selectedLead.createdAt : new Date().toISOString(),
    archived: false,
    customFields: customFieldsData
  };

  db.saveLead(leadData);
  showToast(selectedLead ? "Lead details updated!" : "New referral lead added successfully!", "success");
  closeSheet("leadFormSheet");
  renderLeadsList();
  renderDashboard();
}

// Save Meeting Form Submit
function submitMeetingForm(e) {
  e.preventDefault();

  const customFieldsData = {};
  const dynamicInputs = document.querySelectorAll("#meetingCustomFieldsContainer .dynamic-field");
  dynamicInputs.forEach(input => {
    const fid = input.id.replace("custom_", "");
    customFieldsData[fid] = input.type === "checkbox" ? input.checked : input.value;
  });

  const meetingData = {
    meetingId: "M-" + Math.floor(Math.random() * 9000 + 1000),
    leadId: document.getElementById("meetingLeadId").value,
    purpose: document.getElementById("meetingPurpose").value,
    notes: document.getElementById("meetingNotes").value,
    outcome: document.getElementById("meetingOutcome").value,
    owner: currentUser.name,
    gps: document.getElementById("meetingGps").value,
    date: document.getElementById("meetingDate").value,
    followup: document.getElementById("meetingFollowup").value,
    createdAt: new Date().toISOString(),
    archived: false,
    customFields: customFieldsData,
    photo: photoPreviewBase64
  };

  db.saveMeeting(meetingData);

  // Update linked Lead status automatically to match meeting outcome
  const leads = db.getLeads();
  const linkedLead = leads.find(l => l.leadId === meetingData.leadId);
  if (linkedLead) {
    if (meetingData.outcome === "Referral Started" || meetingData.outcome === "Proposal Submitted") {
      linkedLead.status = "Referral Started";
      linkedLead.followup = meetingData.followup || linkedLead.followup;
      db.saveLead(linkedLead);
    } else if (meetingData.outcome === "Lost Opportunity") {
      linkedLead.status = "Lost";
      linkedLead.nonConversionReason = "Doctor aligned elsewhere";
      linkedLead.nonConversionAction = "Refollow and analyze service gaps";
      db.saveLead(linkedLead);
    }
  }

  showToast("Meeting logged successfully and referral statuses synced!", "success");
  closeSheet("meetingFormSheet");
  renderMeetingsList();
  renderDashboard();
}

// Geolocation simulator
function captureGps() {
  const display = document.getElementById("gpsCoordsDisplay");
  const input = document.getElementById("meetingGps");

  display.innerText = "Accessing GPS...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        input.value = `${lat}, ${lng}`;
        display.innerText = `Captured: ${lat}, ${lng} (Accuracy: ${pos.coords.accuracy.toFixed(1)}m)`;
        showToast("GPS location secured!", "info");
      },
      (err) => {
        // Fallback for demo simulation (since GitHub Pages / local file might block GPS)
        const simLat = (23.33 + (Math.random() - 0.5) * 0.05).toFixed(5);
        const simLng = (75.03 + (Math.random() - 0.5) * 0.05).toFixed(5);
        input.value = `${simLat}, ${simLng}`;
        display.innerText = `Simulated GPS: ${simLat}, ${simLng} (Local permission fallback)`;
        showToast("Simulated GPS captured", "warning");
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  } else {
    display.innerText = "GPS Not supported on this device";
  }
}

// Photo Upload Simulator
function triggerPhotoCapture() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.capture = "environment"; // Trigger back camera on mobile
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoPreviewBase64 = event.target.result;
        const img = document.getElementById("photoCapturePreview");
        img.src = photoPreviewBase64;
        img.style.display = "block";
        showToast("Image captured and attached!", "info");
      };
      reader.readAsDataURL(file);
    }
  };
  fileInput.click();
}

// --- DETAILS VIEWS ---
function showLeadDetail(id) {
  const lead = db.getLeads().find(l => l.leadId === id);
  if (!lead) return;

  selectedLead = lead;

  document.getElementById("detailOrg").innerText = lead.organisation;
  document.getElementById("detailStatus").innerText = lead.status;
  document.getElementById("detailStatus").className = `record-badge badge-${lead.status.toLowerCase().replace(" ", "-")}`;

  document.getElementById("detailAudience").innerText = lead.audienceType;
  document.getElementById("detailOwner").innerText = lead.owner;
  document.getElementById("detailPoc1").innerText = lead.poc1;
  document.getElementById("detailPoc2").innerText = lead.poc2 || "-";
  document.getElementById("detailFollowup").innerText = lead.followup || "None Scheduled";
  document.getElementById("detailRevenue").innerText = `₹${lead.revenuePotential.toLocaleString()}`;

  // Custom Fields render
  const customList = document.getElementById("detailCustomFields");
  customList.innerHTML = "";
  const registeredFields = db.getFormFields().filter(f => f.target === "lead");
  
  registeredFields.forEach(f => {
    const val = lead.customFields?.[f.id] ?? "-";
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "6px 0";
    li.style.borderBottom = "1px solid var(--bg-app)";
    li.style.fontSize = "0.85rem";
    li.innerHTML = `<span style="color:var(--text-muted);">${f.label}:</span> <span style="font-weight:600;">${val}</span>`;
    customList.appendChild(li);
  });

  // History timeline
  const timeline = document.getElementById("detailTimeline");
  timeline.innerHTML = "";
  const leadMeetings = db.getMeetings().filter(m => m.leadId === id);

  if (leadMeetings.length === 0) {
    timeline.innerHTML = `<li style="font-size:0.85rem; color:var(--text-muted)">No activities logged for this lead yet.</li>`;
  } else {
    leadMeetings.forEach(meeting => {
      const li = document.createElement("li");
      li.style.padding = "8px 0";
      li.style.fontSize = "0.85rem";
      li.style.borderBottom = "1px dotted var(--bg-app)";
      li.innerHTML = `
        <div style="font-weight:600; color:var(--primary);">${meeting.purpose} - ${meeting.outcome}</div>
        <div style="color:var(--text-muted); font-size:0.75rem;">Logged by ${meeting.owner} on ${meeting.date}</div>
        <div style="margin-top:4px; font-style:italic;">"${meeting.notes}"</div>
      `;
      timeline.appendChild(li);
    });
  }

  // Edit controls display based on roles (reps can only edit their own leads)
  const editBtn = document.getElementById("leadDetailEditBtn");
  if (currentUser.role === "Rep" && lead.owner !== currentUser.name) {
    editBtn.style.display = "none";
  } else {
    editBtn.style.display = "block";
  }

  document.getElementById("leadDetailSheet").style.display = "flex";
}

function editSelectedLead() {
  if (!selectedLead) return;
  
  // Close detail sheet
  closeSheet("leadDetailSheet");

  // Open Form Sheet & Load values
  document.getElementById("leadSheetTitle").innerText = "Edit Lead Details";
  document.getElementById("leadFormSubmitBtn").innerText = "Update Lead";
  
  // Reps/Managers can archive/delete if authorized
  if (currentUser.role === "Admin" || currentUser.role === "Manager") {
    document.getElementById("leadDeleteBtn").style.display = "block";
  } else {
    document.getElementById("leadDeleteBtn").style.display = "none";
  }

  document.getElementById("leadOrg").value = selectedLead.organisation;
  document.getElementById("leadPoc1").value = selectedLead.poc1;
  document.getElementById("leadPoc2").value = selectedLead.poc2 || "";
  document.getElementById("leadRevenue").value = selectedLead.revenuePotential;
  document.getElementById("leadFollowup").value = selectedLead.followup || "";

  populateDropdown("leadAudience", db.getConfig().audienceTypes);
  document.getElementById("leadAudience").value = selectedLead.audienceType;

  populateDropdown("leadStatus", db.getConfig().leadStatuses);
  document.getElementById("leadStatus").value = selectedLead.status;

  populateDropdown("leadLostReason", db.getConfig().nonConversionReasons, true);
  
  toggleLostReasonsBox();
  if (selectedLead.status === "Lost") {
    document.getElementById("leadLostReason").value = selectedLead.nonConversionReason || "";
    document.getElementById("leadLostAction").value = selectedLead.nonConversionAction || "";
  }

  // Set custom fields values
  renderDynamicCustomFields("leadCustomFieldsContainer", "lead");
  const registeredFields = db.getFormFields().filter(f => f.target === "lead" && f.active);
  registeredFields.forEach(f => {
    const input = document.getElementById(`custom_${f.id}`);
    if (input) {
      if (f.type === "checkbox") {
        input.checked = selectedLead.customFields?.[f.id] || false;
      } else {
        input.value = selectedLead.customFields?.[f.id] || "";
      }
    }
  });

  document.getElementById("leadFormSheet").style.display = "flex";
}

function archiveSelectedLead() {
  if (!selectedLead) return;
  if (confirm("Are you sure you want to archive/remove this lead? This will remove it from active tracking.")) {
    const leads = db.get("leads");
    const idx = leads.findIndex(l => l.leadId === selectedLead.leadId);
    if (idx !== -1) {
      leads[idx].archived = true;
      db.set("leads", leads);
      showToast("Lead archived successfully", "info");
      closeSheet("leadFormSheet");
      renderLeadsList();
      renderDashboard();
    }
  }
}

function showMeetingDetail(id) {
  const meeting = db.getMeetings().find(m => m.meetingId === id);
  if (!meeting) return;

  const leads = db.getLeads();
  const lead = leads.find(l => l.leadId === meeting.leadId);

  document.getElementById("detailMeetingOrg").innerText = lead ? lead.organisation : "Unknown Hospital";
  document.getElementById("detailMeetingPurpose").innerText = meeting.purpose;
  document.getElementById("detailMeetingDate").innerText = meeting.date;
  document.getElementById("detailMeetingOutcome").innerText = meeting.outcome;
  document.getElementById("detailMeetingGps").innerText = meeting.gps || "None Recorded";
  document.getElementById("detailMeetingNotes").innerText = meeting.notes;
  document.getElementById("detailMeetingOwner").innerText = meeting.owner;

  // Custom photo
  const photoContainer = document.getElementById("detailMeetingPhotoContainer");
  if (meeting.photo) {
    photoContainer.innerHTML = `<img src="${meeting.photo}" alt="Meeting Proof" style="max-width:100%; border-radius:8px; margin-top:8px; box-shadow:var(--shadow-sm);">`;
  } else {
    photoContainer.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No photo proof attached</span>`;
  }

  document.getElementById("meetingDetailSheet").style.display = "flex";
}

function closeSheet(id) {
  document.getElementById(id).style.display = "none";
}

// --- ANALYTICS REPORTS ---
function renderReports() {
  const leads = db.getLeads();
  const meetings = db.getMeetings();

  // 1. Hospital Referral Conversion table
  const tbody = document.getElementById("reportsConversionTable");
  tbody.innerHTML = "";

  leads.forEach(lead => {
    const count = meetings.filter(m => m.leadId === lead.leadId).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--primary);">${lead.organisation}</td>
      <td>${lead.audienceType}</td>
      <td>${lead.owner}</td>
      <td><span class="record-badge badge-${lead.status.toLowerCase().replace(" ", "-")}">${lead.status}</span></td>
      <td style="text-align:center;">${count}</td>
      <td style="text-align:right; font-weight:600;">₹${lead.revenuePotential.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  // 2. Aggregate statistics calculations
  const totalConversions = leads.filter(l => l.status === "Converted").length;
  const lostOpportunities = leads.filter(l => l.status === "Lost").length;
  const referralGrowthValue = leads.filter(l => l.status === "Converted").reduce((acc, l) => acc + l.revenuePotential, 0);

  document.getElementById("repTotalConversions").innerText = totalConversions;
  document.getElementById("repTotalLost").innerText = lostOpportunities;
  document.getElementById("repTotalReferralsGrowth").innerText = `₹${referralGrowthValue.toLocaleString()}`;
}

// --- ADMIN PANEL AND DYNAMIC FORMS CONFIG ---
let activeAdminTab = "users";

function renderAdminPanel() {
  // Tabs navigation
  document.querySelectorAll(".admin-tab").forEach(el => el.classList.remove("active"));
  const activeTab = document.querySelector(`.admin-tab[onclick="switchAdminTab('${activeAdminTab}')"]`);
  if (activeTab) activeTab.classList.add("active");

  document.querySelectorAll(".admin-section").forEach(el => el.classList.remove("active"));
  const section = document.getElementById(`admin_${activeAdminTab}`);
  if (section) section.classList.add("active");

  if (activeAdminTab === "users") {
    renderAdminUsers();
  } else if (activeAdminTab === "dropdowns") {
    renderAdminDropdowns();
  } else if (activeAdminTab === "forms") {
    renderAdminForms();
  } else if (activeAdminTab === "sync") {
    renderAdminSync();
  }
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  renderAdminPanel();
}

// 1. Users Admin
function renderAdminUsers() {
  const users = db.getUsers();
  const tbody = document.getElementById("adminUsersTableBody");
  tbody.innerHTML = "";

  users.forEach((user, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--primary);">${user.name}</td>
      <td><code>${user.pin}</code></td>
      <td>${user.role}</td>
      <td>
        <span class="sync-badge ${user.active ? "online" : "offline"}" style="padding:4px 8px; cursor:pointer;" onclick="toggleUserStatus(${idx})">
          ${user.active ? "Active" : "Disabled"}
        </span>
      </td>
      <td>
        <button class="action-icon-btn delete" onclick="deleteUser(${idx})">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addNewUser(e) {
  e.preventDefault();
  const name = document.getElementById("newUserName").value.trim();
  const pin = document.getElementById("newUserPin").value.trim();
  const role = document.getElementById("newUserRole").value;

  if (!name || pin.length !== 4) {
    showToast("Invalid user name or PIN (Must be 4 digits)", "error");
    return;
  }

  const users = db.getUsers();
  if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    showToast("Username already exists", "error");
    return;
  }

  users.push({ name, pin, role, active: true });
  db.saveUsers(users);
  showToast("New user added successfully!", "success");
  
  // Clear
  document.getElementById("newUserName").value = "";
  document.getElementById("newUserPin").value = "";
  renderAdminUsers();
}

function toggleUserStatus(idx) {
  const users = db.getUsers();
  users[idx].active = !users[idx].active;
  db.saveUsers(users);
  showToast("User status updated!", "info");
  renderAdminUsers();
}

function deleteUser(idx) {
  const users = db.getUsers();
  if (confirm(`Are you sure you want to delete user: ${users[idx].name}?`)) {
    users.splice(idx, 1);
    db.saveUsers(users);
    showToast("User deleted", "info");
    renderAdminUsers();
  }
}

// 2. Config Dropdowns Admin
function renderAdminDropdowns() {
  const config = db.getConfig();
  const dropdownSelect = document.getElementById("adminDropdownSelect");
  const selectedKey = dropdownSelect.value;
  const list = config[selectedKey] || [];

  const chipsContainer = document.getElementById("adminDropdownChips");
  chipsContainer.innerHTML = "";

  list.forEach((opt, idx) => {
    const chip = document.createElement("div");
    chip.className = "option-chip";
    chip.innerHTML = `
      <span>${opt}</span>
      <button class="option-chip-delete" onclick="deleteDropdownOption('${selectedKey}', ${idx})">&times;</button>
    `;
    chipsContainer.appendChild(chip);
  });
}

function handleDropdownSelectChange() {
  renderAdminDropdowns();
}

function addDropdownOption() {
  const input = document.getElementById("adminNewOptionInput");
  const val = input.value.trim();
  if (!val) return;

  const key = document.getElementById("adminDropdownSelect").value;
  const config = db.getConfig();
  config[key] = config[key] || [];

  if (config[key].includes(val)) {
    showToast("Option already exists", "warning");
    return;
  }

  config[key].push(val);
  db.saveConfig(config);
  showToast("Option added to configured dropdown", "success");
  input.value = "";
  renderAdminDropdowns();
  
  // Refresh UI layouts depending on config
  db.init();
}

function deleteDropdownOption(key, idx) {
  const config = db.getConfig();
  config[key].splice(idx, 1);
  db.saveConfig(config);
  showToast("Option removed", "info");
  renderAdminDropdowns();
}

// 3. Custom Dynamic Fields Config Admin
function renderAdminForms() {
  const fields = db.getFormFields();
  const tbody = document.getElementById("adminFormsTableBody");
  tbody.innerHTML = "";

  fields.forEach((field, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--primary);">${field.label} (<code>${field.id}</code>)</td>
      <td>${field.type.toUpperCase()}</td>
      <td>${field.target.toUpperCase()}</td>
      <td>${field.mandatory ? "Yes" : "No"}</td>
      <td>
        <span class="sync-badge ${field.active ? "online" : "offline"}" style="padding:4px 8px; cursor:pointer;" onclick="toggleFormFieldActive(${idx})">
          ${field.active ? "Enabled" : "Disabled"}
        </span>
      </td>
      <td>
        <button class="action-icon-btn delete" onclick="deleteFormField(${idx})">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleFieldTypeChange() {
  const type = document.getElementById("newFieldType").value;
  const optionsGroup = document.getElementById("newFieldOptionsGroup");
  if (type === "dropdown") {
    optionsGroup.style.display = "block";
  } else {
    optionsGroup.style.display = "none";
  }
}

function addFormField(e) {
  e.preventDefault();
  const label = document.getElementById("newFieldLabel").value.trim();
  const type = document.getElementById("newFieldType").value;
  const target = document.getElementById("newFieldTarget").value;
  const mandatory = document.getElementById("newFieldMandatory").checked;
  const rawOptions = document.getElementById("newFieldOptions").value;

  if (!label) return;

  const id = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fields = db.getFormFields();
  if (fields.some(f => f.id === id)) {
    showToast("Field with a similar name already exists", "error");
    return;
  }

  let optionsList = [];
  if (type === "dropdown" && rawOptions) {
    optionsList = rawOptions.split(",").map(o => o.trim()).filter(o => o.length > 0);
  }

  fields.push({
    id,
    label,
    type,
    mandatory,
    options: optionsList,
    active: true,
    target
  });

  db.saveFormFields(fields);
  showToast("Dynamic form updated! Field added.", "success");

  // Reset
  document.getElementById("newFieldLabel").value = "";
  document.getElementById("newFieldOptions").value = "";
  document.getElementById("newFieldMandatory").checked = false;
  handleFieldTypeChange();
  renderAdminForms();
}

function toggleFormFieldActive(idx) {
  const fields = db.getFormFields();
  fields[idx].active = !fields[idx].active;
  db.saveFormFields(fields);
  showToast("Field state changed", "info");
  renderAdminForms();
}

function deleteFormField(idx) {
  const fields = db.getFormFields();
  if (confirm(`Are you sure you want to remove field: ${fields[idx].label}?`)) {
    fields.splice(idx, 1);
    db.saveFormFields(fields);
    showToast("Dynamic field deleted", "info");
    renderAdminForms();
  }
}

// 4. Synchronization panel
function renderAdminSync() {
  const settings = db.getSyncSettings();
  document.getElementById("adminSyncUrlInput").value = settings.url;
  document.getElementById("adminLastSyncDisplay").innerText = settings.lastSync;
}

function saveSyncUrl() {
  const url = document.getElementById("adminSyncUrlInput").value.trim();
  db.saveSyncSettings(url);
  showToast("Sync URL Saved!", "success");
}

function forceSync() {
  triggerSync();
}

// --- GOOGLE APPS SCRIPT SYNC ENGINE ---
async function triggerSync() {
  const settings = db.getSyncSettings();
  if (!settings.url) {
    showToast("Sync URL not configured! Running in local sandbox mode.", "warning");
    return;
  }

  const badge = document.getElementById("syncBadge");
  badge.classList.add("syncing");
  badge.innerText = "Syncing...";
  showToast("Initializing Sheet Sync...", "info");

  // Payload for post: sends entire local state for simplicity & robustness in Apps Script merges
  const payload = {
    users: db.getUsers(),
    config: db.getConfig(),
    formFields: db.getFormFields(),
    leads: db.get("leads"), // Include archived elements to trigger server-side archives
    meetings: db.get("meetings")
  };

  try {
    const response = await fetch(settings.url, {
      method: "POST",
      mode: "no-cors", // Required for redirection in GAS execution contexts
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Note: 'no-cors' resolves successfully but opaque response is returned. 
    // We will attempt a GET call to load the merged values back from the Google Apps Script.
    const getRes = await fetch(`${settings.url}?action=getData`);
    const serverData = await getRes.json();

    if (serverData && serverData.success) {
      if (serverData.users) db.set("users", serverData.users);
      if (serverData.config) db.set("config", serverData.config);
      if (serverData.formFields) db.set("form_fields", serverData.formFields);
      if (serverData.leads) db.set("leads", serverData.leads);
      if (serverData.meetings) db.set("meetings", serverData.meetings);

      const timestamp = new Date().toLocaleString();
      localStorage.setItem("medtrack_last_sync", timestamp);
      document.getElementById("adminLastSyncDisplay").innerText = timestamp;
      
      showToast("Bidirectional Sheets sync complete!", "success");
      
      badge.classList.remove("syncing");
      badge.classList.add("online");
      badge.classList.remove("offline");
      badge.innerText = "Synced";

      // Refresh whatever view is currently active
      handleRouting();
    } else {
      throw new Error("Invalid payload response from server");
    }
  } catch (error) {
    console.error("Sync error: ", error);
    showToast("Sync failed. Check API URL and permissions.", "error");
    
    badge.classList.remove("syncing");
    badge.classList.add("offline");
    badge.classList.remove("online");
    badge.innerText = "Offline Cache";
  }
}

// --- UTILITIES ---
function showToast(msg, type = "success") {
  const toast = document.getElementById("toastNotification");
  toast.innerText = msg;
  toast.className = `notification-toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// FAB Sheet Toggle
function toggleFabMenu() {
  const sheet = document.getElementById("fabSheet");
  sheet.classList.toggle("show");
}

function handleFabItemClick(action) {
  toggleFabMenu();
  if (action === "addLead") {
    openAddLeadSheet();
  } else if (action === "addMeeting") {
    openAddMeetingSheet();
  }
}

// --- APP RUNTIME INITIALIZATION ---
window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", () => {
  handleRouting();

  // Listen to network status to update icon indicator
  const updateOnlineStatus = () => {
    const badge = document.getElementById("syncBadge");
    if (navigator.onLine) {
      badge.classList.add("online");
      badge.classList.remove("offline");
      badge.innerText = "Online Cache";
    } else {
      badge.classList.remove("online");
      badge.classList.add("offline");
      badge.innerText = "Offline";
    }
  };

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  // Bind forms submit actions
  document.getElementById("leadFormEl").addEventListener("submit", submitLeadForm);
  document.getElementById("meetingFormEl").addEventListener("submit", submitMeetingForm);
});
