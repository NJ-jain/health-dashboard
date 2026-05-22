"use client";

import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  change: string;
  changeType: "increase" | "decrease" | "none";
  comparisonText: string;
  isGoodTrend: "positive" | "negative" | "neutral";
  iconColorClass?: string;
  iconBgClass?: string;
  isLoading?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  comparisonText,
  isGoodTrend,
  iconColorClass = "text-cyan-400",
  iconBgClass = "bg-cyan-950/30 border-cyan-500/20",
  isLoading = false
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg shadow-black/25 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2.5">
            <div className="h-3 bg-slate-800/80 rounded-lg w-2/3" />
            <div className="h-8 bg-slate-700/50 rounded-lg w-1/2" />
          </div>
          <div className="w-11 h-11 bg-slate-800/80 border border-slate-700/30 rounded-xl shrink-0" />
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/40">
          <div className="h-5 bg-slate-800/80 rounded-lg w-1/3" />
          <div className="h-3 bg-slate-800/50 rounded-lg w-1/2" />
        </div>
      </div>
    );
  }

  // Determine if the trend is positive (good) or negative (bad) for safety
  const isTrendGood = 
    (changeType === "decrease" && isGoodTrend === "positive") || 
    (changeType === "increase" && isGoodTrend === "positive") || 
    (changeType === "decrease" && isGoodTrend === "negative" ? false : true);

  // Styling helpers based on safety state
  let trendColor = "text-slate-400 bg-slate-900/40 border-slate-800/60";
  let TrendIcon = Minus;

  if (changeType === "increase") {
    TrendIcon = ArrowUp;
    trendColor = isGoodTrend === "positive" 
      ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.06)]" 
      : "text-rose-400 bg-rose-950/20 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.06)]";
  } else if (changeType === "decrease") {
    TrendIcon = ArrowDown;
    trendColor = isGoodTrend === "positive" 
      ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.06)]" 
      : "text-rose-400 bg-rose-950/20 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.06)]";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden glass-panel hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg shadow-black/20 hover:shadow-cyan-950/15"
    >
      {/* Top light glow hover effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/40 transition-all duration-500" />
      
      <div className="flex items-start justify-between gap-4">
        {/* Metric Value details */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block truncate">
            {title}
          </span>
          <span className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight block mt-2 font-mono bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
            {value}
          </span>
        </div>

        {/* Brand Icon Box */}
        {Icon && (
          <div className={`p-3 border rounded-xl shrink-0 transition-all duration-300 group-hover:scale-105 shadow-inner ${iconBgClass} ${iconColorClass}`}>
            <Icon size={20} className="stroke-[2.2px]" />
          </div>
        )}
      </div>

      {/* Trend Analysis Footer */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/40">
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border rounded-lg shrink-0 ${trendColor}`}>
          <TrendIcon size={11} className="stroke-[2.5px]" />
          {change}
        </span>
        <span className="text-[10px] text-slate-500 font-semibold truncate font-sans">
          {comparisonText}
        </span>
      </div>
    </motion.div>
  );
}


