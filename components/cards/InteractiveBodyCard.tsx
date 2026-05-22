"use client";

import { useState } from "react";
import { ShieldAlert, Info, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BodyPartInjury {
  id: string;
  name: string;
  count: number;
  coords: { cx: number; cy: number; r: number; labelX: number; labelY: number; align: "left" | "right" };
}

const PART_COORDS: Record<string, { cx: number; cy: number; r: number; labelX: number; labelY: number; align: "left" | "right" }> = {
  head: { cx: 100, cy: 32, r: 14, labelX: 45, labelY: 32, align: "left" },
  face: { cx: 100, cy: 56, r: 10, labelX: 155, labelY: 56, align: "right" },
  hand: { cx: 58, cy: 110, r: 11, labelX: 45, labelY: 110, align: "left" },
  finger: { cx: 142, cy: 120, r: 10, labelX: 155, labelY: 120, align: "right" },
  leg: { cx: 83, cy: 160, r: 16, labelX: 45, labelY: 175, align: "left" },
  foot: { cx: 117, cy: 220, r: 12, labelX: 155, labelY: 220, align: "right" },
  others: { cx: 100, cy: 100, r: 18, labelX: 155, labelY: 160, align: "right" }
};

interface InteractiveBodyCardProps {
  data?: Array<{ id: string; name: string; count: number }>;
  isLoading?: boolean;
}

export default function InteractiveBodyCard({ data, isLoading = false }: InteractiveBodyCardProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const defaultInjuries = [
    { id: "head", name: "Head", count: 5 },
    { id: "face", name: "Face", count: 8 },
    { id: "hand", name: "Hand", count: 4 },
    { id: "finger", name: "Finger", count: 8 },
    { id: "leg", name: "Leg", count: 12 },
    { id: "foot", name: "Foot", count: 10 },
    { id: "others", name: "Others (Torso)", count: 5 }
  ];

  const rawInjuries = data || defaultInjuries;

  const injuries: BodyPartInjury[] = rawInjuries.map((part) => ({
    ...part,
    coords: PART_COORDS[part.id] || { cx: 100, cy: 100, r: 10, labelX: 100, labelY: 100, align: "left" }
  }));

  if (isLoading) {
    return (
      <div className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full animate-pulse">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4 w-full">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            BODY SCANNER SYSTEM YTD
          </h3>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800/60 text-slate-500 flex items-center gap-1 font-mono uppercase tracking-widest">
            DIAGNOSTICS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
          {/* Left/Center: Pulsing wireframe graphic */}
          <div className="lg:col-span-6 flex justify-center bg-[#070d19]/40 border border-slate-900/60 rounded-xl p-3.5 relative overflow-hidden h-[240px]">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center flex-col gap-2.5">
              <div className="w-12 h-12 rounded-full border border-cyan-500/25 flex items-center justify-center relative">
                <div className="absolute inset-0.5 border border-cyan-500/20 rounded-full animate-ping" />
                <ShieldAlert size={20} className="text-cyan-500/40 animate-pulse" />
              </div>
              <span className="text-[9px] text-cyan-500/50 font-bold uppercase tracking-widest font-mono">
                INITIALIZING MATRIX SCANNERS...
              </span>
            </div>
          </div>

          {/* Right: Table list skeleton */}
          <div className="lg:col-span-6 space-y-2">
            <div className="h-3 bg-slate-850 rounded w-2/3 mb-3 animate-pulse" />
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-800/40 bg-[#111c33]/10 h-7"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                    <div className="h-2.5 bg-slate-800 rounded w-1/3" />
                  </div>
                  <div className="w-10 h-4 bg-slate-800 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full relative overflow-hidden group">
      {/* Laser scan line overlay effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent pointer-events-none animate-[scan_6s_infinite_linear]" />
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          BODY SCANNER SYSTEM YTD
        </h3>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-400 flex items-center gap-1 font-mono tracking-wider">
          ACTIVE DEPLOY
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
        {/* Left/Center: Interactive SVG Body */}
        <div className="lg:col-span-5 flex justify-center bg-[#070d19]/40 border border-slate-900/40 rounded-xl p-3 relative overflow-hidden">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
          
          <svg viewBox="0 0 200 240" className="w-full max-w-[195px] h-auto z-10 transition-all duration-300 transform group-hover:scale-[1.01] select-none">
            {/* STYLIZED HUMANOID WIREFRAME DRAWING */}
            <g className="stroke-slate-800 stroke-[1.5] fill-none">
              {/* Head outer */}
              <circle cx="100" cy="32" r="14" className="stroke-slate-700/50" />
              {/* Neck */}
              <line x1="100" y1="46" x2="100" y2="52" className="stroke-slate-700/50" />
              {/* Shoulders */}
              <line x1="75" y1="56" x2="125" y2="56" className="stroke-slate-700/50" />
              {/* Arms */}
              <path d="M 75 56 Q 60 85 58 110" className="stroke-slate-700/50" />
              <path d="M 125 56 Q 140 85 142 110" className="stroke-slate-700/50" />
              {/* Torso */}
              <rect x="78" y="56" width="44" height="60" rx="6" className="stroke-slate-700/50" />
              <line x1="88" y1="116" x2="84" y2="170" className="stroke-slate-700/50" />
              <line x1="112" y1="116" x2="116" y2="170" className="stroke-slate-700/50" />
              {/* Legs */}
              <path d="M 84 170 L 80 215" className="stroke-slate-700/50" />
              <path d="M 116 170 L 120 215" className="stroke-slate-700/50" />
              {/* Hands */}
              <circle cx="58" cy="113" r="3" className="fill-slate-800 stroke-none" />
              <circle cx="142" cy="113" r="3" className="fill-slate-800 stroke-none" />
              {/* Feet */}
              <path d="M 77 215 H 68" className="stroke-slate-700/50" />
              <path d="M 123 215 H 132" className="stroke-slate-700/50" />
            </g>

            {/* CONNECTION LINES FOR HOVERED LABELS */}
            {injuries.map((part) => {
              const isHovered = hoveredPart === part.id;
              if (!isHovered) return null;

              return (
                <line
                  key={`line-${part.id}`}
                  x1={part.coords.cx}
                  y1={part.coords.cy}
                  x2={part.coords.labelX}
                  y2={part.coords.labelY}
                  className="stroke-cyan-500/50 stroke-1 stroke-dasharray-[3_3] animate-pulse"
                />
              );
            })}

            {/* INTERACTIVE HOTSPOT BUBBLES */}
            {injuries.map((part) => {
              const isHovered = hoveredPart === part.id;
              
              // Define different heat colors depending on injuries count
              let glowColor = "stroke-cyan-500/25 hover:stroke-cyan-400 fill-cyan-500/5";
              let activeGlow = "fill-cyan-500/20 stroke-cyan-400";

              if (part.count >= 10) {
                glowColor = "stroke-rose-500/35 hover:stroke-rose-400 fill-rose-500/5";
                activeGlow = "fill-rose-500/20 stroke-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]";
              } else if (part.count >= 6) {
                glowColor = "stroke-amber-500/35 hover:stroke-amber-400 fill-amber-500/5";
                activeGlow = "fill-amber-500/20 stroke-amber-400";
              }

              return (
                <g 
                  key={part.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPart(part.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  {/* Invisible larger hover zone for easier selection */}
                  <circle
                    cx={part.coords.cx}
                    cy={part.coords.cy}
                    r={part.coords.r + 7}
                    fill="transparent"
                  />

                  {/* Pulsing Core dot if hovered */}
                  {isHovered && (
                    <circle
                      cx={part.coords.cx}
                      cy={part.coords.cy}
                      r={part.coords.r + 4}
                      className="fill-none stroke-cyan-400/60 stroke-[1] animate-ping"
                    />
                  )}

                  {/* Visual Hotspot ring */}
                  <circle
                    cx={part.coords.cx}
                    cy={part.coords.cy}
                    r={part.coords.r}
                    className={`transition-all duration-300 stroke-[1.5] ${
                      isHovered ? activeGlow : glowColor
                    }`}
                  />

                  {/* Small core center dot */}
                  <circle
                    cx={part.coords.cx}
                    cy={part.coords.cy}
                    r="3.5"
                    className={`transition-all duration-200 ${
                      part.count >= 10 ? "fill-rose-400" : part.count >= 6 ? "fill-amber-400" : "fill-cyan-400"
                    } ${isHovered ? "scale-125" : ""}`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Interactive Table / Details list */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono mb-2">
            <Info size={11} className="text-cyan-400/70" /> HOVER TARGETS TO AUDIT ANATOMICAL HEAT MAPS
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
            {injuries.map((part) => {
              const isHovered = hoveredPart === part.id;
              
              // Colors matching count severity
              let textBadgeColor = "text-cyan-400 border-cyan-500/20 bg-cyan-950/20";
              if (part.count >= 10) {
                textBadgeColor = "text-rose-400 border-rose-500/20 bg-rose-950/20";
              } else if (part.count >= 6) {
                textBadgeColor = "text-amber-400 border-amber-500/20 bg-amber-950/20";
              }

              return (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all duration-250 ${
                    isHovered 
                      ? "bg-slate-800/40 border-slate-700 text-slate-100 shadow-[0_0_12px_rgba(6,182,212,0.06)] pl-4"
                      : "bg-[#0b1329]/30 border-slate-900/60 text-slate-400"
                  }`}
                  onMouseEnter={() => setHoveredPart(part.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      part.count >= 10 ? "bg-rose-500" : part.count >= 6 ? "bg-amber-500" : "bg-cyan-500"
                    } ${isHovered ? "animate-pulse scale-125" : ""}`} />
                    {part.name}
                  </span>
                  <span className={`px-2 py-0.5 border rounded font-bold shrink-0 text-[10px] ${textBadgeColor}`}>
                    {part.count} {part.count === 1 ? "INCIDENT" : "INCIDENTS"}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
