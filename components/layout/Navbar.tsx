"use client";

import { Calendar, User, SlidersHorizontal, Bell, RefreshCw } from "lucide-react";

interface NavbarProps {
  month: string;
  setMonth: (val: string) => void;
  site: string;
  setSite: (val: string) => void;
  region: string;
  setRegion: (val: string) => void;
  facility: string;
  setFacility: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  connectionStatus?: "connecting" | "connected" | "reconnecting" | "disconnected";
  lastUpdated?: string;
}

export default function Navbar({
  month,
  setMonth,
  site,
  setSite,
  region,
  setRegion,
  facility,
  setFacility,
  onRefresh,
  isRefreshing = false,
  connectionStatus = "connecting",
  lastUpdated
}: NavbarProps) {
  const months = ["December 2024", "January 2025", "February 2025", "March 2025", "April 2025", "May 2025"];
  const sites = ["Site GM", "Site Corp", "Site Logistics", "Site Assembly"];
  const regions = ["North", "South", "East", "West"];
  const facilities = ["Kalash NDC", "Refinery Unit 1", "Logistics Hub", "Component Depot"];

  return (
    <header className="bg-[#050811]/70 backdrop-blur-xl border-b border-slate-850 text-slate-100 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sticky top-0 z-20 shadow-lg shadow-black/10 select-none">
      {/* Brand Title Block */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {connectionStatus === "connected" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/20 border border-emerald-500/25 rounded-md text-[9px] font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] animate-pulse font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                LIVE
              </span>
            )}
            {connectionStatus === "reconnecting" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-950/20 border border-amber-500/25 rounded-md text-[9px] font-bold uppercase tracking-widest text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                RECONNECTING
              </span>
            )}
            {connectionStatus === "connecting" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-950/20 border border-amber-500/25 rounded-md text-[9px] font-bold uppercase tracking-widest text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                CONNECTING
              </span>
            )}
            {connectionStatus === "disconnected" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/20 border border-rose-500/25 rounded-md text-[9px] font-bold uppercase tracking-widest text-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                OFFLINE
              </span>
            )}
            <h1 className="text-lg md:text-xl font-black tracking-tight bg-gradient-to-r from-slate-50 via-slate-100 to-cyan-300 bg-clip-text text-transparent uppercase font-mono">
              EHS KPI DASHBOARD
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-sans">
            Environment, Health & Safety Performance Report
          </p>
        </div>

        {/* Mobile notifications / refresh */}
        <div className="flex items-center gap-2 xl:hidden">
          <button 
            onClick={onRefresh} 
            className={`p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 rounded-xl transition-all duration-200 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={14} />
          </button>
          <div className="w-7 h-7 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center relative">
            <Bell size={13} className="text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Interactive Selectors & Dashboard Controls */}
      <div className="flex flex-wrap items-center gap-3.5 xl:justify-end">
        {/* Month Selector */}
        <div className="flex flex-col gap-1 min-w-[110px] md:min-w-[125px]">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Month</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-[#050811] text-slate-200">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Site Selector */}
        <div className="flex flex-col gap-1 min-w-[100px] md:min-w-[115px]">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Site</span>
          <select
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
          >
            {sites.map((s) => (
              <option key={s} value={s} className="bg-[#050811] text-slate-200">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div className="flex flex-col gap-1 min-w-[90px] md:min-w-[105px]">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Region</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
          >
            {regions.map((r) => (
              <option key={r} value={r} className="bg-[#050811] text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Facility Selector */}
        <div className="flex flex-col gap-1 min-w-[120px] md:min-w-[135px]">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Facility</span>
          <select
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
          >
            {facilities.map((f) => (
              <option key={f} value={f} className="bg-[#050811] text-slate-200">
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Action Widgets (Date of Report, Last Synced & Lead Officer) */}
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0 xl:pl-4 xl:border-l xl:border-slate-850">
          {/* Telemetry Sync Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/20 border border-slate-850/60 rounded-xl shrink-0">
            <RefreshCw size={12} className={`text-cyan-400 ${connectionStatus === "connected" ? "animate-spin [animation-duration:15s]" : ""}`} />
            <div className="text-left font-sans">
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">Telemetry Ingest</div>
              <div className="text-[10px] text-cyan-400 font-mono font-bold mt-0.5 leading-none">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "PENDING"}
              </div>
            </div>
          </div>

          {/* Report Date Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/20 border border-slate-850/60 rounded-xl shrink-0">
            <Calendar size={12} className="text-slate-400 animate-pulse" />
            <div className="text-left font-sans">
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">Report Date</div>
              <div className="text-[10px] text-slate-200 font-bold mt-0.5 leading-none">18-May-2025</div>
            </div>
          </div>

          {/* Quick Refresh Icon */}
          <button 
            onClick={onRefresh} 
            className={`hidden xl:block p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 border border-slate-800/60 rounded-xl transition-all duration-200 ${isRefreshing ? "animate-spin text-cyan-400 border-cyan-500/20" : ""}`}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
