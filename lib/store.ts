/**
 * Global Type Definitions for EHS Dashboard Telemetry
 * Purely representation contracts. No server side state or active clients in this bundle.
 */

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
  facility?: string;
  region?: string;
  reportMonth?: string;
  reportDate?: string;
  siteGM?: string;
  siteLead?: string;
  ehsLead?: string;
  records?: DashboardData[];
}

export interface SSEClient {
  id: string;
  send: (event: string, data: unknown, preSerialized?: string) => void;
  close: () => void;
}
