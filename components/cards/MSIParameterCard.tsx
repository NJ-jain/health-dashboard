"use client";

import React from "react";
import { motion } from "framer-motion";

interface MSIParameterCardProps {
  title: string;
  score: string;      // e.g. "9/10"
  percentage: number; // e.g. 90
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBgClass?: string;
  iconColorClass?: string;
  isLoading?: boolean;
}

export default function MSIParameterCard({
  title,
  score,
  percentage,
  icon: Icon,
  iconBgClass = "bg-slate-800/40 border-slate-700/60",
  iconColorClass = "text-cyan-400",
  isLoading = false
}: MSIParameterCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111c33]/40 border border-slate-850/60 rounded-xl p-3.5 flex items-center gap-3.5 animate-pulse">
        <div className="w-10 h-10 bg-slate-800 border border-slate-700/50 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="h-3 bg-slate-800 rounded-lg w-1/2" />
            <div className="h-3 bg-slate-800 rounded-lg w-1/4" />
          </div>
          <div className="w-full h-1.5 bg-slate-850 rounded-full" />
        </div>
      </div>
    );
  }

  // Determine color based on score compliance percentage
  let barColorClass = "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]";
  let textColorClass = "text-cyan-400";
  
  if (percentage >= 90) {
    barColorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
    textColorClass = "text-emerald-400";
  } else if (percentage >= 75) {
    barColorClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    textColorClass = "text-amber-400";
  } else {
    barColorClass = "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    textColorClass = "text-rose-400";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="bg-[#111c33]/30 border border-slate-800/60 hover:border-cyan-500/30 rounded-xl p-3.5 flex items-center gap-3.5 transition-all duration-200 hover:bg-[#111c33]/60 hover:shadow-md hover:shadow-cyan-950/5"
    >
      {/* Icon frame */}
      {Icon && (
        <div className={`p-2.5 border rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconBgClass} ${iconColorClass}`}>
          <Icon size={16} className="stroke-[2px]" />
        </div>
      )}

      {/* Details & compliance progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span 
            className="text-[10px] xl:text-[11px] font-bold text-slate-300 tracking-tight xl:tracking-wide uppercase block truncate" 
            title={title}
          >
            {title}
          </span>
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-[11px] font-bold text-slate-100 font-mono">{score}</span>
            <span className={`text-[10px] font-black font-mono px-1 rounded bg-[#0b1329]/60 border border-slate-800 ${textColorClass}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress track */}
        <div className="w-full h-1.5 bg-[#0b1329] border border-slate-800/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}


