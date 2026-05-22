/**
 * Global In-Memory Shared Store for Realtime EHS Dashboard
 * Facilitates realtime dashboard data sharing and Server-Sent Events (SSE) client tracking.
 */

// Define standard types for Dashboard metrics
export interface KPICardData {
  title: string;
  value: string | number;
  icon?: any; // Lucide icon component reference
  change: string;
  changeType: "increase" | "decrease";
  comparisonText: string;
  isGoodTrend: "positive" | "negative";
  iconColorClass: string;
  iconBgClass: string;
}

export interface IncidentCategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrendData {
  name: string;
  Fatality: number;
  LTI: number;
  FirstAid: number;
  NearMiss: number;
  UnsafeAct: number;
  UnsafeCond: number;
}

export interface MSIParameterData {
  title: string;
  score: string;
  percentage: number;
  icon?: any;
}

export interface GembaWalkData {
  walksCount: number;
  compliance: number;
  mtdObs: number;
  ytdObs: number;
  closurePct: number;
  trend: Array<{
    name: string;
    Observations: number;
    Closed: number;
  }>;
}

export interface CriticalIssue {
  id: number;
  issue: string;
  area: string;
  status: string;
}

export interface BodyPartInjury {
  id: string;
  name: string;
  count: number;
}

export interface CommitteeMeetingRow {
  label: string;
  val: string;
  textClass?: string;
}

export interface TrainingRow {
  type: string;
  sessions: number;
  headcount: number;
}

export interface AuditGaugeData {
  title: string;
  percentage: number;
  colorType: string;
}

export interface MockDrillRow {
  label: string;
  val: string;
  valClass?: string;
}

export interface DashboardData {
  kpiStats: KPICardData[];
  incidentBreakdown: IncidentCategoryBreakdown[];
  incidentTrend: MonthlyTrendData[];
  msiParameters: MSIParameterData[];
  msiScore: number;
  gembaData: GembaWalkData;
  criticalIssues: CriticalIssue[];
  bodyPartInjuries: BodyPartInjury[];
  fireIncidents: { value: number; change: string };
  envIncidents: { value: number; change: string };
  committeeMeetings: CommitteeMeetingRow[];
  trainingSessions: TrainingRow[];
  auditCompliance: AuditGaugeData[];
  mockDrills: MockDrillRow[];
  milestones: string[];
  lastUpdated: string;
}

// -------------------------------------------------------------
// 1. Shared Mutable State
// -------------------------------------------------------------

// Active connected SSE client type
export interface SSEClient {
  id: string;
  send: (event: string, data: unknown, preSerialized?: string) => void;
  close: () => void;
}

// Global active SSE clients registry
export const sseClients = new Set<SSEClient>();

// Global latest EHS Dashboard data cache
export let latestDashboardData: DashboardData | null = null;

// -------------------------------------------------------------
// 2. Client Registry Management Helpers
// -------------------------------------------------------------

/**
 * Register a new SSE client to the store
 */
export function addSSEClient(client: SSEClient): void {
  sseClients.add(client);
  console.log(`[Store] SSE Client connected. Active clients: ${sseClients.size}`);
}

/**
 * Remove an SSE client from the store registry
 */
export function removeSSEClient(clientId: string): void {
  let found: SSEClient | null = null;
  for (const client of sseClients) {
    if (client.id === clientId) {
      found = client;
      break;
    }
  }
  if (found) {
    sseClients.delete(found);
    console.log(`[Store] SSE Client disconnected. Active clients: ${sseClients.size}`);
  }
}

// -------------------------------------------------------------
// 3. State Mutation & Realtime Broadcast Helpers
// -------------------------------------------------------------

let broadcastDebounceTimer: NodeJS.Timeout | null = null;

/**
 * Update the global EHS dashboard state and broadcast updates to all active SSE clients.
 * Incorporates a 500ms debouncing window to buffer frequent back-to-back sheets webhook updates.
 */
export function updateDashboardData(newData: Partial<DashboardData>): DashboardData {
  const current = latestDashboardData || getInitialMockData();
  
  latestDashboardData = {
    ...current,
    ...newData,
    lastUpdated: new Date().toISOString()
  };

  // Trigger debounced/throttled broadcast
  if (broadcastDebounceTimer) {
    clearTimeout(broadcastDebounceTimer);
  }

  broadcastDebounceTimer = setTimeout(() => {
    broadcastDebounceTimer = null;
    if (latestDashboardData) {
      broadcast("dashboard_update", latestDashboardData);
    }
  }, 500);

  return latestDashboardData;
}

/**
 * Broadcast an event payload to all currently connected SSE clients.
 * Pre-serializes the data payload once, avoiding redundant stringify overhead per client.
 */
export function broadcast(event: string, data: unknown): void {
  if (sseClients.size === 0) return;

  console.log(`[Store] Pre-serializing "${event}" payload once for ${sseClients.size} clients...`);
  
  try {
    const serialized = JSON.stringify(data);
    const preSerialized = `event: ${event}\ndata: ${serialized}\n\n`;

    sseClients.forEach((client) => {
      try {
        client.send(event, data, preSerialized);
      } catch (error) {
        console.error(`[Store] Pruning dead client connection: ${client.id}`, error);
        sseClients.delete(client);
        try { client.close(); } catch (_) {}
      }
    });
  } catch (err) {
    console.error("[Store] Broadcast serialization failure:", err);
  }
}

// Background Keep-Alive Heartbeat routine to keep connections awake and prune dead clients
if (typeof setInterval !== "undefined") {
  const heartbeatInterval = setInterval(() => {
    if (sseClients.size === 0) return;
    
    console.log(`[Store] Heartbeat: Pinging ${sseClients.size} active connections...`);
    const pingMessage = `event: ping\ndata: "heartbeat"\n\n`;
    
    sseClients.forEach((client) => {
      try {
        client.send("ping", "heartbeat", pingMessage);
      } catch (err) {
        console.warn(`[Store] Socket heartbeat dead. Pruning client: ${client.id}`);
        sseClients.delete(client);
        try { client.close(); } catch (_) {}
      }
    });
  }, 25000); // 25s window matching network load balancers

  // Prevent blocking process termination in test environments
  if (typeof heartbeatInterval.unref === "function") {
    heartbeatInterval.unref();
  }
}

// -------------------------------------------------------------
// 4. Initial/Mock Data Generator
// -------------------------------------------------------------

export function getInitialMockData(): DashboardData {
  return {
    kpiStats: [
      {
        title: "Total Incidents",
        value: 21,
        change: "12% vs Apr 2025",
        changeType: "decrease",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive",
        iconColorClass: "text-rose-400",
        iconBgClass: "bg-rose-950/20 border-rose-500/20"
      },
      {
        title: "LTIFR (Lost Time)",
        value: 1.32,
        change: "8% vs Apr 2025",
        changeType: "decrease",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive",
        iconColorClass: "text-emerald-400",
        iconBgClass: "bg-emerald-950/20 border-emerald-500/20"
      },
      {
        title: "First Aid Cases",
        value: 7,
        change: "16% vs Apr 2025",
        changeType: "increase",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "negative",
        iconColorClass: "text-amber-400",
        iconBgClass: "bg-amber-950/20 border-amber-500/20"
      },
      {
        title: "Near Miss Track",
        value: 8,
        change: "11% vs Apr 2025",
        changeType: "decrease",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive",
        iconColorClass: "text-orange-400",
        iconBgClass: "bg-orange-950/20 border-orange-500/20"
      },
      {
        title: "Safety Compliance",
        value: "89%",
        change: "3% vs Apr 2025",
        changeType: "decrease",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "negative",
        iconColorClass: "text-cyan-400",
        iconBgClass: "bg-cyan-950/20 border-cyan-500/20"
      },
      {
        title: "Training Hours",
        value: 320,
        change: "10% vs Apr 2025",
        changeType: "increase",
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive",
        iconColorClass: "text-indigo-400",
        iconBgClass: "bg-indigo-950/20 border-indigo-500/20"
      }
    ],
    incidentBreakdown: [
      { name: "Fatality", value: 0, color: "#EF4444" },
      { name: "LTI (Lost Time Injury)", value: 4, color: "#F97316" },
      { name: "First Aid", value: 7, color: "#10B981" },
      { name: "Near Miss", value: 8, color: "#06B6D4" },
      { name: "Unsafe Act", value: 1, color: "#8B5CF6" },
      { name: "Unsafe Cond.", value: 1, color: "#EAB308" }
    ],
    incidentTrend: [
      { name: "Dec-24", Fatality: 0, LTI: 1, FirstAid: 2, NearMiss: 4, UnsafeAct: 5, UnsafeCond: 1 },
      { name: "Jan-25", Fatality: 0, LTI: 2, FirstAid: 4, NearMiss: 5, UnsafeAct: 3, UnsafeCond: 2 },
      { name: "Feb-25", Fatality: 0, LTI: 1, FirstAid: 3, NearMiss: 5, UnsafeAct: 2, UnsafeCond: 1 },
      { name: "Mar-25", Fatality: 0, LTI: 0, FirstAid: 1, NearMiss: 7, UnsafeAct: 1, UnsafeCond: 1 },
      { name: "Apr-25", Fatality: 0, LTI: 1, FirstAid: 3, NearMiss: 9, UnsafeAct: 2, UnsafeCond: 3 },
      { name: "May-25", Fatality: 0, LTI: 0, FirstAid: 7, NearMiss: 8, UnsafeAct: 1, UnsafeCond: 3 }
    ],
    msiParameters: [
      { title: "Accident Mgmt", score: "9/10", percentage: 90 },
      { title: "Permit to Work (PTW)", score: "8.5/10", percentage: 85 },
      { title: "Electrical Safety", score: "9.5/10", percentage: 95 },
      { title: "PIT / Forklifts", score: "9/10", percentage: 90 },
      { title: "Chemical Safety", score: "8/10", percentage: 80 },
      { title: "Machine Guarding", score: "8.5/10", percentage: 85 },
      { title: "EHS Committee Meetings", score: "10/10", percentage: 100 },
      { title: "Gemba Walks Compliance", score: "9/10", percentage: 90 },
      { title: "EHS Training Compliance", score: "8.5/10", percentage: 85 },
      { title: "Mock Drills Auditing", score: "9/10", percentage: 90 },
      { title: "EHS Legal Compliance", score: "10/10", percentage: 100 },
      { title: "Waste Management Plan", score: "9.5/10", percentage: 95 }
    ],
    msiScore: 90,
    gembaData: {
      walksCount: 24,
      compliance: 96,
      mtdObs: 12,
      ytdObs: 110,
      closurePct: 91,
      trend: [
        { name: "Dec", Observations: 8, Closed: 7 },
        { name: "Jan", Observations: 10, Closed: 9 },
        { name: "Feb", Observations: 15, Closed: 12 },
        { name: "Mar", Observations: 11, Closed: 10 },
        { name: "Apr", Observations: 18, Closed: 16 },
        { name: "May", Observations: 12, Closed: 11 }
      ]
    },
    criticalIssues: [
      { id: 1, issue: "Non-compliance with PTW procedure", area: "Work Area C", status: "Open" },
      { id: 2, issue: "Improper storage of flammable chemicals", area: "Chemical Store A", status: "Open" },
      { id: 3, issue: "Delay in corrective action closure for machine guarding", area: "Production Line 2", status: "Open" },
      { id: 4, issue: "Non-compliance with PTW lockouts", area: "Main Power Substation", status: "Open" }
    ],
    bodyPartInjuries: [
      { id: "head", name: "Head", count: 5 },
      { id: "face", name: "Face", count: 8 },
      { id: "hand", name: "Hand", count: 4 },
      { id: "finger", name: "Finger", count: 8 },
      { id: "leg", name: "Leg", count: 12 },
      { id: "foot", name: "Foot", count: 10 },
      { id: "others", name: "Others (Torso)", count: 5 }
    ],
    fireIncidents: { value: 9, change: "▼ 10% vs Apr 2025" },
    envIncidents: { value: 9, change: "▲ 0% vs Apr 2025" },
    committeeMeetings: [
      { label: "Meeting Done?", val: "Yes", textClass: "text-emerald-400 font-bold" },
      { label: "MOM Shared?", val: "Yes", textClass: "text-emerald-400 font-bold" },
      { label: "Monthly Points", val: "12", textClass: "text-slate-100 font-mono" },
      { label: "YTD Points", val: "45", textClass: "text-slate-100 font-mono" },
      { label: "Monthly Compliance %", val: "88%", textClass: "text-emerald-400 font-mono font-bold" },
      { label: "YTD Closure %", val: "90%", textClass: "text-emerald-400 font-mono font-bold" }
    ],
    trainingSessions: [
      { type: "Training Sessions", sessions: 6, headcount: 320 },
      { type: "Awareness Sessions", sessions: 4, headcount: 280 },
      { type: "Induction Sessions", sessions: 15, headcount: 75 }
    ],
    auditCompliance: [
      { title: "Ambulance Audit", percentage: 82, colorType: "cyan" },
      { title: "Wellness Room", percentage: 88, colorType: "emerald" },
      { title: "Bus Safety Audit", percentage: 76, colorType: "amber" },
      { title: "Conveyor Audit", percentage: 79, colorType: "purple" }
    ],
    mockDrills: [
      { label: "Drill Conducted", val: "Yes", valClass: "text-emerald-400 font-bold" },
      { label: "Drill Type", val: "Fire Evacuation", valClass: "text-slate-300 font-semibold" },
      { label: "Observation", val: "Evacuated in 4.2 min", valClass: "text-slate-400 text-[10px] leading-tight" },
      { label: "Attendance", val: "92%", valClass: "text-cyan-400 font-mono font-bold" }
    ],
    milestones: [
      "ZERO LTI for 3 consecutive months - 91 LTI-free days achieved",
      "MSI Score improved by 8 points vs previous month",
      "Fire evacuation drill completed with 100% headcount",
      "Wellness room utilization improved by 12%"
    ],
    lastUpdated: new Date().toISOString()
  };
}

// Initialize the global store state on module import
latestDashboardData = getInitialMockData();
