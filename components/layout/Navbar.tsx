"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, SlidersHorizontal, Bell, RefreshCw, Menu, ChevronDown } from "lucide-react";

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
  reportDate?: string;
  records?: any[];
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
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
  lastUpdated,
  reportDate,
  records,
  isSidebarOpen = false,
  onToggleSidebar
}: NavbarProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  let months = ["December 2024", "January 2025", "February 2025", "March 2025", "April 2025", "May 2025"];
  let sites = ["Site GM", "Site Corp", "Site Logistics", "Site Assembly"];
  let regions = ["North", "South", "East", "West"];
  let facilities = ["Kalash NDC", "Refinery Unit 1", "Logistics Hub", "Component Depot"];

  if (records && records.length > 0) {
    const uniqueMonths = Array.from(new Set(records.map(r => r.reportMonth).filter(Boolean))) as string[];
    const uniqueSites = Array.from(new Set(records.flatMap(r => [r.siteGM, r.siteLead, r.ehsLead]).filter(Boolean))) as string[];
    const uniqueRegions = Array.from(new Set(records.map(r => r.region).filter(Boolean))) as string[];
    const uniqueFacilities = Array.from(new Set(records.map(r => r.facility).filter(Boolean))) as string[];

    if (uniqueMonths.length > 0) months = uniqueMonths;
    if (uniqueSites.length > 0) sites = uniqueSites;
    if (uniqueRegions.length > 0) regions = uniqueRegions;
    if (uniqueFacilities.length > 0) facilities = uniqueFacilities;
  }

  // Ensure current active selections are present in the list of options to prevent blank dropdown UI
  if (month && !months.includes(month)) months.push(month);
  if (site && !sites.includes(site)) sites.push(site);
  if (region && !regions.includes(region)) regions.push(region);
  if (facility && !facilities.includes(facility)) facilities.push(facility);

  return (
    <header className="bg-[#050811]/90 backdrop-blur-xl border-b border-slate-850 text-slate-100 px-4 md:px-6 py-3.5 flex flex-col sticky top-0 z-40 shadow-lg shadow-black/10 select-none transition-all duration-350">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Brand & Left Controls */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Hamburger Menu Trigger - visible below lg */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 border border-transparent rounded-xl transition-all duration-200 cursor-pointer shrink-0"
            title="Toggle Menu"
          >
            <Menu size={18} className="stroke-[2.5px]" />
          </button>

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
              <h1 className="text-base md:text-lg font-black tracking-tight bg-gradient-to-r from-slate-50 via-slate-100 to-cyan-300 bg-clip-text text-transparent uppercase font-mono truncate">
                SURAKSHA EHS
              </h1>
            </div>
            <p className="hidden sm:block text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-sans">
              Environment, Health & Safety Performance Report
            </p>
          </div>
        </div>

        {/* Right Controls - Desktop Inline (Visible on xl and above) */}
        <div className="hidden xl:flex items-center gap-3.5">
          {/* Month Selector */}
          <div className="flex flex-col gap-1 min-w-[125px]">
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
          <div className="flex flex-col gap-1 min-w-[115px]">
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
          <div className="flex flex-col gap-1 min-w-[105px]">
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
          <div className="flex flex-col gap-1 min-w-[135px]">
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

          {/* Action Widgets */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-850">
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
                <div className="text-[10px] text-slate-200 font-bold mt-0.5 leading-none">{reportDate || "18-May-2025"}</div>
              </div>
            </div>

            {/* Quick Refresh Icon */}
            <button 
              onClick={onRefresh} 
              className={`p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 border border-slate-800/60 rounded-xl transition-all duration-200 shrink-0 ${isRefreshing ? "animate-spin text-cyan-400 border-cyan-500/20" : ""}`}
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Right Controls - Mobile/Tablet Trigger (Visible below xl) */}
        <div className="flex items-center gap-2 xl:hidden">
          {/* Status indicators */}
          {connectionStatus !== "connected" && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === "disconnected" ? "bg-rose-450" : "bg-amber-450"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === "disconnected" ? "bg-rose-500" : "bg-amber-500"}`} />
            </span>
          )}

          {/* Toggle Accordion Filters Button */}
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono tracking-wider uppercase border rounded-xl transition-all duration-250 cursor-pointer ${
              isFiltersExpanded
                ? "bg-slate-900 border-cyan-500/30 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.06)]"
                : "bg-[#0b1329]/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <SlidersHorizontal size={11} className={isFiltersExpanded ? "text-cyan-400 animate-pulse" : "text-slate-450"} />
            <span>Filters</span>
            <ChevronDown 
              size={11} 
              className={`transition-transform duration-250 ${isFiltersExpanded ? "rotate-180 text-cyan-400" : ""}`} 
            />
          </button>

          {/* Quick Refresh Icon */}
          <button 
            onClick={onRefresh} 
            className={`p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 rounded-xl transition-all duration-200 shrink-0 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={13} />
          </button>

          {/* Alert Bell */}
          <div className="w-7 h-7 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center relative shrink-0">
            <Bell size={13} className="text-slate-35" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* High-Density Inline Filters Status Bar for Mobile when collapsed */}
      {!isFiltersExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-850/60 text-[9px] text-cyan-400/90 font-mono font-bold tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none xl:hidden"
        >
          <span className="text-slate-500 uppercase tracking-widest text-[8px] font-sans">Active Filters:</span>
          <span className="bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-800/40">{facility}</span>
          <span className="text-slate-700">•</span>
          <span className="bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-800/40">{region}</span>
          <span className="text-slate-700">•</span>
          <span className="bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-800/40">{site}</span>
          <span className="text-slate-700">•</span>
          <span className="bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-800/40">{month}</span>
        </motion.div>
      )}

      {/* Collapsible Accordion Controls Drawer for Mobile / Tablet */}
      <AnimatePresence>
        {isFiltersExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="xl:hidden border-t border-slate-850/60 pt-3.5 mt-2.5 flex flex-col gap-4 overflow-hidden"
          >
            {/* Grid of selects */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Month Selector */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
                >
                  {months.map((m) => (
                    <option key={m} value={m} className="bg-[#050811] text-slate-200">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Selector */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Site</span>
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
                >
                  {sites.map((s) => (
                    <option key={s} value={s} className="bg-[#050811] text-slate-200">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Selector */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Region</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
                >
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-[#050811] text-slate-200">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Facility Selector */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">Facility</span>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/80 cursor-pointer shadow-inner font-semibold transition-all duration-200 hover:bg-slate-900"
                >
                  {facilities.map((f) => (
                    <option key={f} value={f} className="bg-[#050811] text-slate-200">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Badges/Sync row */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-850/40 pt-3 flex-row justify-start w-full">
              {/* Telemetry Sync Badge */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950/20 border border-slate-850/60 rounded-xl shrink-0">
                <RefreshCw size={11} className={`text-cyan-400 ${connectionStatus === "connected" ? "animate-spin [animation-duration:15s]" : ""}`} />
                <div className="text-left font-sans">
                  <div className="text-[7px] text-slate-500 font-bold uppercase tracking-wider leading-none">Telemetry Ingest</div>
                  <div className="text-[9px] text-cyan-400 font-mono font-bold mt-0.5 leading-none">
                    {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "PENDING"}
                  </div>
                </div>
              </div>

              {/* Report Date Badge */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950/20 border border-slate-850/60 rounded-xl shrink-0">
                <Calendar size={11} className="text-slate-400 animate-pulse" />
                <div className="text-left font-sans">
                  <div className="text-[7px] text-slate-500 font-bold uppercase tracking-wider leading-none">Report Date</div>
                  <div className="text-[9px] text-slate-200 font-bold mt-0.5 leading-none">{reportDate || "18-May-2025"}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
