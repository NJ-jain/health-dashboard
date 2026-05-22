"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Trees, 
  AlertTriangle, 
  ClipboardCheck, 
  TrendingDown, 
  Clock, 
  BookOpen, 
  FileCheck,
  CheckCircle,
  HelpCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Plus,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Imports
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Card Imports
import KPICard from "@/components/cards/KPICard";
import MSIParameterCard from "@/components/cards/MSIParameterCard";
import RadialAuditGauge from "@/components/cards/RadialAuditGauge";
import InteractiveBodyCard from "@/components/cards/InteractiveBodyCard";

// Chart Imports
import IncidentTrendChart from "@/components/charts/IncidentTrendChart";
import IncidentBreakdownChart from "@/components/charts/IncidentBreakdownChart";
import GembaTrendChart from "@/components/charts/GembaTrendChart";
import MSISummaryChart from "@/components/charts/MSISummaryChart";

// Store Imports
import { 
  DashboardData, 
  KPICardData, 
  MSIParameterData, 
  CriticalIssue, 
  BodyPartInjury, 
  CommitteeMeetingRow, 
  TrainingRow, 
  AuditGaugeData, 
  MockDrillRow 
} from "@/lib/store";

export default function DashboardPage() {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [month, setMonth] = useState("May 2025");
  const [site, setSite] = useState("Site GM");
  const [region, setRegion] = useState("North");
  const [facility, setFacility] = useState("Kalash NDC");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Realtime SSE State
  const [realtimeData, setRealtimeData] = useState<DashboardData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "reconnecting" | "disconnected">("connecting");

  // Establish persistent EventSource SSE stream with explicit automatic reconnection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let heartbeatCheckInterval: NodeJS.Timeout | null = null;
    let isUnmounted = false;
    let retryDelay = 1000;
    let lastEventTime = Date.now();

    const connect = () => {
      if (isUnmounted) return;
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const streamUrl = `${backendUrl}/api/stream`;
      
      console.log(`[Dashboard] Initializing Realtime EventSource: ${streamUrl}`);
      setConnectionStatus("connecting");
      
      try {
        eventSource = new EventSource(streamUrl);
        lastEventTime = Date.now();

        eventSource.addEventListener("connected", (event: any) => {
          try {
            const payload = JSON.parse(event.data);
            console.log("[Dashboard] SSE Handshake established. Client ID:", payload.clientId);
            setConnectionStatus("connected");
            lastEventTime = Date.now();
            retryDelay = 1000; // Reset retry delay on success
          } catch (err) {
            console.error("[Dashboard] Error parsing SSE connected event:", err);
          }
        });

        eventSource.addEventListener("dashboard_update", (event: any) => {
          try {
            const payload = JSON.parse(event.data);
            console.log("[Dashboard] SSE Received realtime update:", payload);
            setRealtimeData(payload);
            
            // Sync local selector states with dynamic sheet properties
            if (payload.facility) setFacility(payload.facility);
            if (payload.region) setRegion(payload.region);
            if (payload.reportMonth) setMonth(payload.reportMonth);
            if (payload.siteGM) {
              setSite(payload.siteGM);
            } else if (payload.siteLead) {
              setSite(payload.siteLead);
            } else {
              setSite("Site GM");
            }
            
            setConnectionStatus("connected");
            lastEventTime = Date.now();
            retryDelay = 1000; // Reset retry delay on success
          } catch (err) {
            console.error("[Dashboard] Error parsing SSE dashboard data:", err);
          }
        });

        eventSource.addEventListener("ping", () => {
          // Keep-alive received
          lastEventTime = Date.now();
          setConnectionStatus("connected");
        });

        eventSource.onerror = (err) => {
          console.warn(`[Dashboard] SSE connection failed. Retrying in ${retryDelay}ms...`, err);
          setConnectionStatus("reconnecting");
          
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
          
          retryTimeout = setTimeout(() => {
            console.log("[Dashboard] Reconnection attempt triggered...");
            retryDelay = Math.min(retryDelay * 2, 30000); // Exponential backoff
            connect();
          }, retryDelay);
        };
      } catch (err) {
        console.error("[Dashboard] EventSource initiation failed:", err);
        setConnectionStatus("disconnected");
      }
    };

    // Periodic watchdog check to verify heartbeats/activities are fresh
    heartbeatCheckInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastEventTime;
      
      // If we haven't received any SSE signals within 35 seconds, connection is considered dead
      if (elapsed > 35000 && eventSource) {
        console.warn(`[Dashboard] Watchdog alert: Stale connection detected (${Math.round(elapsed / 1000)}s since last event). Reconnecting...`);
        setConnectionStatus("reconnecting");
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        
        connect();
      }
    }, 5000);

    connect();

    // Clean up event listener and stream on component unmount
    return () => {
      isUnmounted = true;
      console.log("[Dashboard] Closing active SSE stream connection and cleaning up timeouts.");
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 650);
  };

  // REACTIVE MOCK DATA ENGINE - Generates slightly different stats based on "site" & "month" selections
  const getDashboardData = (): DashboardData => {
    // Seed variance based on site selector
    let multiplier = 1.0;
    if (site === "Site Corp") multiplier = 0.2;
    else if (site === "Site Logistics") multiplier = 0.7;
    else if (site === "Site Assembly") multiplier = 1.2;

    const baseIncidents = Math.round(21 * multiplier);
    const baseNearMiss = Math.round(8 * multiplier);
    const baseFirstAid = Math.round(7 * multiplier);
    const baseLTIFR = Number((1.32 * multiplier).toFixed(2));
    const baseSafetyCompliance = Math.round(Math.min(99, Math.max(70, 89 + (site === "Site Corp" ? 7 : site === "Site Assembly" ? -6 : 0))));
    const baseTrainingHours = Math.round(320 * (site === "Site Corp" ? 2.5 : site === "Site Assembly" ? 0.8 : 1.0));
    const baseMSIScore = Math.round(Math.min(98, Math.max(65, 90 + (site === "Site Corp" ? 5 : site === "Site Assembly" ? -5 : 0))));

    // 1. KPI Stats
    const kpiStats: KPICardData[] = [
      {
        title: "Total Incidents",
        value: baseIncidents,
        change: "12% vs Apr 2025",
        changeType: "decrease" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive" as const, // For incident counts, a decrease is positive!
        iconColorClass: "text-rose-400",
        iconBgClass: "bg-rose-950/20 border-rose-500/20"
      },
      {
        title: "LTIFR (Lost Time)",
        value: baseLTIFR,
        change: "8% vs Apr 2025",
        changeType: "decrease" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive" as const,
        iconColorClass: "text-emerald-400",
        iconBgClass: "bg-emerald-950/20 border-emerald-500/20"
      },
      {
        title: "First Aid Cases",
        value: baseFirstAid,
        change: "16% vs Apr 2025",
        changeType: "increase" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "negative" as const, // An increase in first aid cases is negative
        iconColorClass: "text-amber-400",
        iconBgClass: "bg-amber-950/20 border-amber-500/20"
      },
      {
        title: "Near Miss Track",
        value: baseNearMiss,
        change: "11% vs Apr 2025",
        changeType: "decrease" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive" as const,
        iconColorClass: "text-orange-400",
        iconBgClass: "bg-orange-950/20 border-orange-500/20"
      },
      {
        title: "Safety Compliance",
        value: `${baseSafetyCompliance}%`,
        change: "3% vs Apr 2025",
        changeType: "decrease" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "negative" as const, // A decrease in safety compliance is negative!
        iconColorClass: "text-cyan-400",
        iconBgClass: "bg-cyan-950/20 border-cyan-500/20"
      },
      {
        title: "Training Hours",
        value: baseTrainingHours,
        change: "10% vs Apr 2025",
        changeType: "increase" as const,
        comparisonText: "vs Apr 2025",
        isGoodTrend: "positive" as const, // Training hours increase is positive!
        iconColorClass: "text-indigo-400",
        iconBgClass: "bg-indigo-950/20 border-indigo-500/20"
      }
    ];

    // 2. Incident breakdown data
    const incidentBreakdown = [
      { name: "Fatality", value: 0, color: "#EF4444" },
      { name: "LTI (Lost Time Injury)", value: Math.round(4 * multiplier), color: "#F97316" },
      { name: "First Aid", value: Math.round(7 * multiplier), color: "#10B981" },
      { name: "Near Miss", value: Math.round(8 * multiplier), color: "#06B6D4" },
      { name: "Unsafe Act", value: Math.round(1 * multiplier) || 1, color: "#8B5CF6" },
      { name: "Unsafe Cond.", value: Math.round(1 * multiplier) || 1, color: "#EAB308" },
    ];

    // 3. Incident Trend Chart (Monthly YTD)
    const incidentTrend = [
      { name: "Dec-24", Fatality: 0, LTI: Math.round(1*multiplier), FirstAid: Math.round(2*multiplier), NearMiss: Math.round(4*multiplier), UnsafeAct: 5, UnsafeCond: 1 },
      { name: "Jan-25", Fatality: 0, LTI: Math.round(2*multiplier), FirstAid: Math.round(4*multiplier), NearMiss: Math.round(5*multiplier), UnsafeAct: 3, UnsafeCond: 2 },
      { name: "Feb-25", Fatality: 0, LTI: Math.round(1*multiplier), FirstAid: Math.round(3*multiplier), NearMiss: Math.round(5*multiplier), UnsafeAct: 2, UnsafeCond: 1 },
      { name: "Mar-25", Fatality: 0, LTI: 0, FirstAid: Math.round(1*multiplier), NearMiss: Math.round(7*multiplier), UnsafeAct: 1, UnsafeCond: 1 },
      { name: "Apr-25", Fatality: 0, LTI: Math.round(1*multiplier), FirstAid: Math.round(3*multiplier), NearMiss: Math.round(9*multiplier), UnsafeAct: 2, UnsafeCond: 3 },
      { name: "May-25", Fatality: 0, LTI: Math.round(0*multiplier), FirstAid: baseFirstAid, NearMiss: baseNearMiss, UnsafeAct: 1, UnsafeCond: 3 }
    ];

    // 4. MSI parameters (12 pieces)
    const msiParameters = [
      { title: "Accident Mgmt", score: site === "Site Corp" ? "10/10" : "9/10", percentage: site === "Site Corp" ? 100 : 90 },
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
    ];

    // 5. Gemba walk stats
    const gembaData = {
      walksCount: Math.round(8 * multiplier) || 1,
      compliance: baseSafetyCompliance - 1,
      mtdObs: Math.round(46 * multiplier),
      ytdObs: Math.round(180 * multiplier),
      closurePct: site === "Site Corp" ? 95 : site === "Site Assembly" ? 82 : 89,
      trend: [
        { name: "Dec-24", Observations: Math.round(30*multiplier), Closed: Math.round(25*multiplier) },
        { name: "Jan-25", Observations: Math.round(45*multiplier), Closed: Math.round(38*multiplier) },
        { name: "Feb-25", Observations: Math.round(35*multiplier), Closed: Math.round(32*multiplier) },
        { name: "Mar-25", Observations: Math.round(40*multiplier), Closed: Math.round(37*multiplier) },
        { name: "Apr-25", Observations: Math.round(48*multiplier), Closed: Math.round(42*multiplier) },
        { name: "May-25", Observations: Math.round(46*multiplier), Closed: Math.round(41*multiplier) }
      ]
    };

    // 6. Critical issues
    const criticalIssues = [
      { id: 1, issue: "Non-compliance with PTW procedure", area: "Work Area C", status: "Open" },
      { id: 2, issue: "Improper storage of flammable chemicals", area: "Chemical Store A", status: "Open" },
      { id: 3, issue: "Delay in corrective action closure for machine guarding", area: "Production Line 2", status: "Open" },
      { id: 4, issue: "Non-compliance with PTW lockouts", area: "Main Power Substation", status: "Open" }
    ].slice(0, site === "Site Corp" ? 1 : site === "Site Logistics" ? 3 : 4);

    const bodyPartInjuries = [
      { id: "head", name: "Head", count: Math.round(5 * multiplier) },
      { id: "face", name: "Face", count: Math.round(8 * multiplier) },
      { id: "hand", name: "Hand", count: Math.round(4 * multiplier) },
      { id: "finger", name: "Finger", count: Math.round(8 * multiplier) },
      { id: "leg", name: "Leg", count: Math.round(12 * multiplier) },
      { id: "foot", name: "Foot", count: Math.round(10 * multiplier) },
      { id: "others", name: "Others (Torso)", count: Math.round(5 * multiplier) }
    ];

    const fireIncidents = { value: Math.round(9 * multiplier), change: "▼ 10% vs Apr 2025" };
    const envIncidents = { value: Math.round(9 * multiplier), change: "▲ 0% vs Apr 2025" };

    const committeeMeetings = [
      { label: "Meeting Done?", val: "Yes", textClass: "text-emerald-400 font-bold" },
      { label: "MOM Shared?", val: "Yes", textClass: "text-emerald-400 font-bold" },
      { label: "Monthly Points", val: site === "Site Corp" ? "5" : site === "Site Assembly" ? "15" : "12", textClass: "text-slate-100 font-mono" },
      { label: "YTD Points", val: site === "Site Corp" ? "20" : site === "Site Assembly" ? "55" : "45", textClass: "text-slate-100 font-mono" },
      { label: "Monthly Compliance %", val: site === "Site Corp" ? "95%" : site === "Site Assembly" ? "80%" : "88%", textClass: "text-emerald-400 font-mono font-bold" },
      { label: "YTD Closure %", val: site === "Site Corp" ? "98%" : site === "Site Assembly" ? "85%" : "90%", textClass: "text-emerald-400 font-mono font-bold" }
    ];

    const trainingSessions = [
      { type: "Training Sessions", sessions: Math.round(6 * multiplier) || 1, headcount: Math.round(320 * multiplier) },
      { type: "Awareness Sessions", sessions: Math.round(4 * multiplier) || 1, headcount: Math.round(280 * multiplier) },
      { type: "Induction Sessions", sessions: Math.round(15 * multiplier) || 1, headcount: Math.round(75 * multiplier) }
    ];

    const auditCompliance = [
      { title: "Ambulance Audit", percentage: Math.min(100, Math.round(82 * multiplier)), colorType: "cyan" },
      { title: "Wellness Room", percentage: Math.min(100, Math.round(88 * multiplier)), colorType: "emerald" },
      { title: "Bus Safety Audit", percentage: Math.min(100, Math.round(76 * multiplier)), colorType: "amber" },
      { title: "Conveyor Audit", percentage: Math.min(100, Math.round(79 * multiplier)), colorType: "purple" }
    ];

    const mockDrills = [
      { label: "Drill Conducted", val: "Yes", valClass: "text-emerald-400 font-bold" },
      { label: "Drill Type", val: "Fire Evacuation", valClass: "text-slate-300 font-semibold" },
      { label: "Observation", val: site === "Site Corp" ? "Evacuated in 2.5 min" : "Evacuated in 4.2 min", valClass: "text-slate-400 text-[10px] leading-tight" },
      { label: "Attendance", val: site === "Site Corp" ? "99%" : "92%", valClass: "text-cyan-400 font-mono font-bold" }
    ];

    const milestones = [
      site === "Site Corp" ? "ZERO incidents achieved at corporate offices" : "ZERO LTI for 3 consecutive months - 91 LTI-free days achieved",
      `MSI Score improved to ${baseMSIScore}% vs previous month`,
      "Fire evacuation drill completed with 100% headcount",
      "Wellness room utilization improved by 12%"
    ];

    return {
      kpiStats,
      incidentBreakdown,
      incidentTrend,
      msiParameters,
      msiScore: baseMSIScore,
      gembaData,
      criticalIssues,
      bodyPartInjuries,
      fireIncidents,
      envIncidents,
      committeeMeetings,
      trainingSessions,
      auditCompliance,
      mockDrills,
      milestones,
      lastUpdated: new Date().toISOString()
    };
  };

  // Helper to dynamically restore Lucide Icon components to serialized data
  const enrichRealtimeIcons = (raw: DashboardData | null): DashboardData | null => {
    if (!raw) return null;
    
    const kpiIcons: Record<string, any> = {
      "Total Incidents": AlertTriangle,
      "LTIFR (Lost Time)": Activity,
      "First Aid Cases": Plus,
      "Near Miss Track": ShieldAlert,
      "Safety Compliance": ClipboardCheck,
      "Training Hours": Clock
    };

    const msiIcons: Record<string, any> = {
      "Accident Mgmt": AlertTriangle,
      "Fire & Emergency": Flame,
      "Machine Safety": Activity,
      "PIT / Forklift": ShieldAlert,
      "Material Handling": Clock,
      "Dock Safety": ClipboardCheck,
      "Rack Safety": AlertTriangle,
      "Electrical Safety": Flame,
      "PTW & LOTO": BookOpen,
      "Employee Welfare": UserCheck,
      "Training & Awareness": GraduationCap,
      "Monitoring & Review": FileCheck
    };

    return {
      ...raw,
      kpiStats: raw.kpiStats?.map((stat: KPICardData) => ({
        ...stat,
        icon: kpiIcons[stat.title] || HelpCircle
      })) || [],
      msiParameters: raw.msiParameters?.map((param: MSIParameterData) => ({
        ...param,
        icon: msiIcons[param.title] || HelpCircle
      })) || []
    };
  };

  // Fallback to local re-computed mock data if SSE is not yet loaded or disconnected
  const localMockData = getDashboardData();
  
  let rawData: DashboardData | null = null;
  
  if (realtimeData && realtimeData.records && realtimeData.records.length > 0) {
    // Try to find an exact match matching all filters
    const exactMatch = realtimeData.records.find(r => 
      (r.reportMonth === month) &&
      (r.facility === facility) &&
      (r.region === region) &&
      (r.siteGM === site || r.siteLead === site || r.ehsLead === site)
    );
    
    if (exactMatch) {
      rawData = exactMatch;
    } else {
      // Fallback 1: Match by facility, region, and month
      const matchThree = realtimeData.records.find(r => 
        (r.reportMonth === month) &&
        (r.facility === facility) &&
        (r.region === region)
      );
      if (matchThree) {
        rawData = matchThree;
      } else {
        // Fallback 2: Match by facility and month
        const matchFacilityMonth = realtimeData.records.find(r => 
          (r.reportMonth === month) &&
          (r.facility === facility)
        );
        if (matchFacilityMonth) {
          rawData = matchFacilityMonth;
        } else {
          // Fallback 3: Match just facility
          const matchFacility = realtimeData.records.find(r => r.facility === facility);
          if (matchFacility) {
            rawData = matchFacility;
          } else {
            // Fallback 4: Match just month
            const matchMonth = realtimeData.records.find(r => r.reportMonth === month);
            if (matchMonth) {
              rawData = matchMonth;
            } else {
              // Fallback 5: First available record
              rawData = realtimeData.records[0] || realtimeData;
            }
          }
        }
      }
    }
  } else {
    rawData = realtimeData || localMockData;
  }

  // Preserve records inside the resolved rawData so that they can be passed to Navbar
  if (rawData && realtimeData && realtimeData.records) {
    rawData = {
      ...rawData,
      records: realtimeData.records
    };
  }

  const dashboardData = enrichRealtimeIcons(rawData) as DashboardData;

  const isLoading = (connectionStatus === "connecting" || connectionStatus === "reconnecting") && !realtimeData;

  return (
    <div className="min-h-screen bg-[#070D19] flex font-sans overflow-x-hidden text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Sidebar Panel */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} ehsLead={dashboardData.ehsLead} />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navbar Dashboard Controls */}
        <Navbar 
          month={month} 
          setMonth={setMonth} 
          site={site} 
          setSite={setSite} 
          region={region} 
          setRegion={setRegion} 
          facility={facility} 
          setFacility={setFacility}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          connectionStatus={connectionStatus}
          lastUpdated={dashboardData.lastUpdated}
          reportDate={dashboardData.reportDate}
          records={dashboardData?.records}
        />

        {/* Dynamic Loader screen overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-[#070D19]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs animate-pulse">
                Synchronizing Dashboard Data...
              </span>
            </div>
          </div>
        )}

        {/* Tab Router Switch */}
        {activeTab === "dashboard" ? (
          <div className="p-4 md:p-6 space-y-6 flex-1 max-w-[1700px] w-full mx-auto">
            
            {/* ROW 1: STATS KPI CARDS GRID */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
              {dashboardData.kpiStats.map((stat: KPICardData, i: number) => (
                <KPICard 
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  change={stat.change}
                  changeType={stat.changeType}
                  comparisonText={stat.comparisonText}
                  isGoodTrend={stat.isGoodTrend}
                  iconColorClass={stat.iconColorClass}
                  iconBgClass={stat.iconBgClass}
                  isLoading={isLoading}
                />
              ))}
            </section>

            {/* ROW 2: MONTHLY ANALYTICS SECTION (TREND LINE, BREAKDOWN, HUMAN INJURY, MERGED HAZARD ALERTS) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* Incident Trend Chart - spans 4 columns on large */}
              <div className="lg:col-span-4 h-full min-h-[300px]">
                <IncidentTrendChart data={dashboardData.incidentTrend} isLoading={isLoading} />
              </div>

              {/* Incident Breakdown Pie Chart - spans 3 columns */}
              <div className="lg:col-span-3 h-full min-h-[300px]">
                <IncidentBreakdownChart data={dashboardData.incidentBreakdown} isLoading={isLoading} />
              </div>

              {/* Body Parts Injured human wireframe - spans 3 columns */}
              <div className="lg:col-span-3 h-full min-h-[300px]">
                <InteractiveBodyCard data={dashboardData.bodyPartInjuries} isLoading={isLoading} />
              </div>

              {/* Merged Fire & Environmental Telemetry Card - spans 2 columns */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:col-span-2 glass-panel hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top neon glow line hover effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/40 transition-all duration-500" />
                
                <div className="space-y-4">
                  {/* Title Header */}
                  <div className="border-b border-slate-800/60 pb-3 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hazard Alerts</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  </div>

                  {/* Fire telemetry segment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-rose-400">
                        <Flame size={14} className="text-rose-400 stroke-[2.2px] animate-pulse" />
                        Thermal / Fire
                      </span>
                      {dashboardData.fireIncidents.value > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-rose-500/20 bg-rose-950/20 text-rose-400 animate-pulse">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-emerald-500/20 bg-emerald-950/20 text-emerald-400">
                          Nominal
                        </span>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="space-y-2 animate-pulse py-1">
                        <div className="h-7 bg-slate-800/85 rounded w-1/2" />
                        <div className="h-4 bg-slate-800/50 rounded w-2/3" />
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-3xl font-black text-slate-50 font-mono tracking-tight glow-rose">
                          {dashboardData.fireIncidents.value}
                        </span>
                        <span className="text-[10px] font-bold text-rose-400 font-mono bg-rose-950/10 px-2 py-0.5 rounded-md border border-rose-500/10">
                          {dashboardData.fireIncidents.change}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800/40 my-3" />

                  {/* Environmental telemetry segment */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-emerald-400">
                        <Trees size={14} className="text-emerald-400 stroke-[2.2px]" />
                        Environmental
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-cyan-500/20 bg-cyan-950/20 text-cyan-400">
                        Monitored
                      </span>
                    </div>
                    {isLoading ? (
                      <div className="space-y-2 animate-pulse py-1">
                        <div className="h-7 bg-slate-800/85 rounded w-1/2" />
                        <div className="h-4 bg-slate-800/50 rounded w-2/3" />
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-3xl font-black text-slate-50 font-mono tracking-tight glow-emerald">
                          {dashboardData.envIncidents.value}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-900/40 px-2 py-0.5 rounded-md border border-slate-800/50">
                          {dashboardData.envIncidents.change}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between font-mono">
                  <span>TELEMETRY SCAN</span>
                  <span className="text-cyan-400 animate-pulse">ONLINE</span>
                </div>
              </motion.div>
            </motion.section>

            {/* ROW 3: SURAKSHA INDEX SECTION (GRID SCORES, SPEEDOMETER DIAL, CHECKLISTS) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-gradient-to-r from-slate-900/60 via-[#0c1429]/40 to-[#070d19]/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group"
            >
              {/* Subtle top edge neon line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-500/40 transition-all duration-700" />

              <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded font-mono">MSI</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    My Suraksha Index (MSI) - Parameter-Wise scores
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><XCircle size={12} className="text-rose-500" /> X = Negative Score</span>
                  <span>|</span>
                  <span className="text-cyan-400 font-bold font-mono">✔ Final MSI Score: {dashboardData.msiScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 12 Parameters grid - spans 7 columns */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dashboardData.msiParameters.map((param: MSIParameterData, index: number) => (
                    <MSIParameterCard 
                      key={index}
                      title={param.title}
                      score={param.score}
                      percentage={param.percentage}
                      icon={param.icon}
                      isLoading={isLoading}
                    />
                  ))}
                </div>

                {/* MSI summary speedometer gauge - spans 3 columns */}
                <div className="lg:col-span-3">
                  <MSISummaryChart score={dashboardData.msiScore} isLoading={isLoading} />
                </div>

                {/* MSI callout check-box checklist - spans 2 columns */}
                <div className="lg:col-span-2 bg-slate-950/35 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden group/callout">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent group-hover/callout:via-cyan-500/30 transition-all duration-300" />
                  
                  <div className="border-b border-slate-800/60 pb-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">MSI Callout</span>
                  </div>
                  {isLoading ? (
                    <div className="space-y-3.5 flex-1 justify-center animate-pulse">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-850 shrink-0" />
                          <div className="h-2.5 bg-slate-800 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      {[
                        "Machine Safety Audit",
                        "Powered Industrial Trucks LOTO",
                        "Fire Safety System Check",
                        "Electrical Panels Insulation",
                      ].map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-350 hover:text-slate-100 transition-colors duration-150">
                          <CheckCircle size={14} className="text-emerald-450 shrink-0 mt-0.5" />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-slate-800/50 text-[10px] text-emerald-400 font-bold text-center tracking-wide uppercase font-mono">
                    System Compliant
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ROW 4: REGULAR OPERATIONS (COMMITTEE MEETING, GEMBA WALK WITH BAR CHART, CRITICAL ISSUES TABLE) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-5"
            >
              {/* Committee Meetings summary - spans 3 columns */}
              <div className="xl:col-span-3 glass-panel hover:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Committee Meeting Updates
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                {isLoading ? (
                  <div className="space-y-4 flex-1 justify-center animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex justify-between items-center h-6 border-b border-slate-850 pb-2">
                        <div className="h-2.5 bg-slate-850 rounded w-1/3" />
                        <div className="h-3 bg-slate-800 rounded w-10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40 flex-1 flex flex-col justify-between font-sans">
                    {dashboardData.committeeMeetings.map((row: CommitteeMeetingRow, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 text-xs hover:text-slate-200 transition-colors">
                        <span className="text-slate-400 font-semibold">{row.label}</span>
                        <span className={`${row.textClass || "text-slate-100"}`}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gemba Walk updates with Trend Bar chart - spans 5 columns */}
              <div className="xl:col-span-5 glass-panel hover:border-cyan-500/20 rounded-2xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                {/* Gemba summary metrics */}
                <div className="md:col-span-5 space-y-3.5 border-b md:border-b-0 md:border-r border-slate-800/50 pb-4 md:pb-0 md:pr-4">
                  <div className="border-b border-slate-800/60 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                      Gemba Walks
                    </h3>
                  </div>
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-1">
                            <div className="h-2 bg-slate-850 rounded w-1/2" />
                            <div className="h-4 bg-slate-800 rounded w-1/3" />
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800/50 flex justify-between h-5">
                        <div className="h-2.5 bg-slate-850 rounded w-1/3" />
                        <div className="h-2.5 bg-slate-800 rounded w-10" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Walks</span>
                          <span className="text-lg font-black text-slate-100 font-mono mt-0.5 block">{dashboardData.gembaData.walksCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Compliance</span>
                          <span className="text-lg font-black text-emerald-450 font-mono mt-0.5 block">{dashboardData.gembaData.compliance}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">MTD Obs.</span>
                          <span className="text-lg font-black text-slate-100 font-mono mt-0.5 block">{dashboardData.gembaData.mtdObs}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">YTD Obs.</span>
                          <span className="text-lg font-black text-slate-100 font-mono mt-0.5 block">{dashboardData.gembaData.ytdObs}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/50 flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-400">YTD Closure</span>
                        <span className="text-emerald-400 font-mono font-bold">{dashboardData.gembaData.closurePct}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Double Bar chart */}
                <div className="md:col-span-7 h-full">
                  <GembaTrendChart data={dashboardData.gembaData.trend} isLoading={isLoading} />
                </div>
              </div>

              {/* Critical Issues Table - spans 4 columns */}
              <div className="xl:col-span-4 glass-panel hover:border-rose-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/0 to-transparent group-hover:via-rose-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Critical Safety Issues
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-950/20 border border-rose-500/30 text-rose-400 animate-pulse">
                    Action Needed
                  </span>
                </div>

                <div className="flex-1 overflow-auto max-h-[220px] pr-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/80 py-2.5 pr-2 z-10">Issue</th>
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/80 py-2.5 px-2 z-10">Area</th>
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/80 py-2.5 pl-2 text-right z-10">Status</th>
                      </tr>
                    </thead>
                    {isLoading ? (
                      <tbody className="divide-y divide-slate-800/20 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                          <tr key={i}>
                            <td className="py-3 pr-2">
                              <div className="h-2.5 bg-slate-800/70 rounded w-3/4" />
                            </td>
                            <td className="py-3 px-2">
                              <div className="h-2.5 bg-slate-800/50 rounded w-1/2" />
                            </td>
                            <td className="py-3 pl-2 text-right flex justify-end">
                              <div className="w-12 h-4 bg-slate-850 rounded" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody className="divide-y divide-slate-800/35">
                        {dashboardData.criticalIssues.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-500 font-semibold italic">
                              No critical safety issues reported.
                            </td>
                          </tr>
                        ) : (
                          dashboardData.criticalIssues.map((item: CriticalIssue) => (
                            <tr key={item.id} className="hover:bg-slate-800/30 group transition-colors duration-150">
                              <td className="py-3 pr-2 font-medium text-slate-350 leading-normal group-hover:text-cyan-300 transition-colors" title={item.issue}>
                                {item.issue}
                              </td>
                              <td className="py-3 px-2 text-slate-400 font-semibold group-hover:text-slate-300 transition-colors">{item.area}</td>
                              <td className="py-3 pl-2 text-right">
                                <span className="px-2 py-0.5 rounded border border-rose-500/20 bg-rose-950/20 text-rose-450 font-black text-[9px] uppercase tracking-wide group-hover:border-rose-500/35 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.12)] transition-all">
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </motion.section>

            {/* ROW 5: DRILLS, AUDITS & MILESTONES (TRAINING TABLE, SAFETY COMPLIANCE AUDITS, MOCK DRILL, MILESTONES BULLETS) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* EHS Training & learning sessions table - spans 4 columns */}
              <div className="lg:col-span-4 glass-panel hover:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    EHS Training & Learning
                  </h3>
                </div>

                <div className="flex-1 overflow-auto max-h-[220px] pr-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/85 py-2.5 z-10">Type</th>
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/85 py-2.5 px-3 text-center z-10">Sessions</th>
                        <th className="sticky top-0 bg-[#090f1d] border-b border-slate-800/85 py-2.5 text-right z-10">Headcount</th>
                      </tr>
                    </thead>
                    {isLoading ? (
                      <tbody className="divide-y divide-slate-800/20 animate-pulse">
                        {[1, 2, 3].map((i) => (
                          <tr key={i}>
                            <td className="py-3">
                              <div className="h-2.5 bg-slate-800/70 rounded w-1/2" />
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="h-2.5 bg-slate-800/50 rounded w-8 mx-auto" />
                            </td>
                            <td className="py-3 text-right">
                              <div className="h-2.5 bg-slate-800/70 rounded w-12 ml-auto" />
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-800/80 bg-slate-900/10">
                          <td className="py-3">
                            <div className="h-2.5 bg-slate-800/70 rounded w-1/3" />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="h-2.5 bg-slate-805 rounded w-8 mx-auto" />
                          </td>
                          <td className="py-3 text-right">
                            <div className="h-2.5 bg-slate-800/70 rounded w-12 ml-auto" />
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="divide-y divide-slate-800/35 text-slate-350 font-semibold">
                        {dashboardData.trainingSessions.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-500 font-semibold italic">
                              No training sessions registered.
                            </td>
                          </tr>
                        ) : (
                          <>
                            {dashboardData.trainingSessions.map((row: TrainingRow, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-800/30 group transition-colors duration-150">
                                <td className="py-3 text-slate-300 group-hover:text-cyan-300 transition-colors">{row.type}</td>
                                <td className="py-3 px-3 text-center font-mono text-slate-400 group-hover:text-slate-200 transition-colors">{row.sessions}</td>
                                <td className="py-3 text-right font-mono text-slate-200 group-hover:text-cyan-400 transition-colors">{row.headcount}</td>
                              </tr>
                            ))}
                            {/* Total row */}
                            <tr className="font-bold border-t border-slate-800/80 bg-slate-950/20 sticky bottom-0">
                              <td className="py-3 text-slate-200 uppercase text-[10px] tracking-wider font-black">Total</td>
                              <td className="py-3 px-3 text-center font-mono text-cyan-400 font-black">
                                {dashboardData.trainingSessions.reduce((acc: number, curr: TrainingRow) => acc + curr.sessions, 0)}
                              </td>
                              <td className="py-3 text-right font-mono text-cyan-400 font-black">
                                {dashboardData.trainingSessions.reduce((acc: number, curr: TrainingRow) => acc + curr.headcount, 0)}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              {/* Safety Compliance Audits circles - spans 4 columns */}
              <div className="lg:col-span-4 glass-panel hover:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Safety Compliance Audits
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1 items-center">
                  {dashboardData.auditCompliance.map((audit: AuditGaugeData, idx: number) => (
                    <RadialAuditGauge 
                      key={idx}
                      title={audit.title}
                      percentage={audit.percentage}
                      colorType={audit.colorType as "cyan" | "emerald" | "amber" | "purple"}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Mock Drill Info - spans 2 columns */}
              <div className="lg:col-span-2 glass-panel hover:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Mock Drill
                  </h3>
                </div>

                {isLoading ? (
                  <div className="space-y-4 flex-1 justify-center animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col gap-1 justify-start">
                        <div className="h-2.5 bg-slate-850 rounded w-1/2 mb-1" />
                        <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40 flex-1 flex flex-col justify-between text-xs font-sans">
                    {dashboardData.mockDrills.map((item: MockDrillRow, idx: number) => (
                      <div key={idx} className="flex flex-col py-2.5 justify-start hover:text-slate-200 transition-colors">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">{item.label}</span>
                        <span className={`${item.valClass || "text-slate-350"}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones & Achievements - spans 2 columns */}
              <div className="lg:col-span-2 glass-panel hover:border-emerald-500/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-full group transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
                <div className="border-b border-slate-800/60 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Milestones
                  </h3>
                </div>

                {isLoading ? (
                  <div className="space-y-3.5 flex-1 justify-center animate-pulse mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-2 h-8">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-2 bg-slate-800 rounded w-full" />
                          <div className="h-2 bg-slate-850 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3.5 flex-1 overflow-y-auto mt-2 custom-scrollbar pr-1 max-h-[220px]">
                    {dashboardData.milestones.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                        <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

          </div>
        ) : (
          /* PLACEHOLDER VIEWS FOR OTHER SIDEBAR NAV TABS */
          <div className="p-8 max-w-xl mx-auto text-center flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <ClipboardCheck size={28} className="animate-pulse" />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-slate-200 mt-2">
              Section under maintenance
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              You are navigating to <span className="text-cyan-400 font-bold font-mono">/{activeTab}</span>. In this dashboard evaluation build, only the <span className="text-cyan-400 font-bold font-mono">EHS Dashboard</span> is active with live filtering capabilities. Click the button below to return to the active EHS KPI Dashboard.
            </p>
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className="mt-4 px-5 py-2.5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-50 text-xs tracking-wider uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-200"
            >
              Return to EHS Dashboard
            </button>
          </div>
        )}

        {/* Footer Info bar */}
        <Footer />
      </main>
    </div>
  );
}
