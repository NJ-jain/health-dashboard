"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MSISummaryChartProps {
  score?: number; // e.g. 90
  isLoading?: boolean;
}

export default function MSISummaryChart({ score = 0, isLoading = false }: MSISummaryChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const finalScore = typeof score === "number" ? score : 0;

  useEffect(() => {
    setMounted(true);
    // Smooth animation trigger on mount
    const timer = setTimeout(() => {
      setAnimatedScore(finalScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [finalScore]);

  // SVG Gauge calculations
  // Center is at (100, 100). Radius = 70.
  const size = 200;
  const radius = 70;
  const cx = 100;
  const cy = 110;

  // Needle angle: -90 degrees (for 0%) to +90 degrees (for 100%)
  const needleAngle = -90 + (animatedScore / 100) * 180;

  if (isLoading || !mounted) {
    return (
      <div className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full items-center justify-between min-h-[220px] w-full animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5 mb-2 w-full">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
            MSI COMPLIANCE DIAL
          </h3>
          <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">TELEMETRY</span>
        </div>
        <div className="flex-1 flex flex-col gap-4 justify-center items-center w-full">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Spinning rings representing gauge calibration */}
            <div className="absolute inset-0 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-1.5 border-3 border-amber-500/10 border-t-amber-500/50 rounded-full animate-spin [animation-duration:1.5s]" />
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </div>
          <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-mono">
            CALIBRATING SENSORS...
          </span>
        </div>
      </div>
    );
  }

  // Determine compliance text color based on score
  let complianceColor = "text-cyan-400";
  let complianceLabel = "COMPLIANT";
  if (finalScore >= 90) {
    complianceColor = "text-emerald-400";
    complianceLabel = "EXCELLENT";
  } else if (finalScore >= 75) {
    complianceColor = "text-amber-400";
    complianceLabel = "STABLE STATUS";
  } else if (finalScore > 0) {
    complianceColor = "text-rose-400 animate-pulse";
    complianceLabel = "CRITICAL LIMIT";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full items-center justify-between min-h-[220px]"
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5 mb-2 w-full">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
          MSI COMPLIANCE DIAL
        </h3>
        <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">TELEMETRY</span>
      </div>

      {/* SVG Speedometer */}
      <div className="relative w-full max-w-[190px] h-auto flex flex-col items-center justify-center flex-1">
        <svg viewBox="0 0 200 135" className="w-full h-auto overflow-visible select-none">
          <defs>
            {/* Speedometer Arc Color Stops */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />    {/* Red (Danger) */}
              <stop offset="45%" stopColor="#f59e0b" />   {/* Orange/Amber (Warning) */}
              <stop offset="85%" stopColor="#10b981" />   {/* Emerald (Compliant) */}
              <stop offset="100%" stopColor="#06b6d4" />  {/* Electric Cyan (Excellent) */}
            </linearGradient>
          </defs>

          {/* Underlay dark track */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="#0b1329"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Color Gradient Track */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              opacity: 0.9,
            }}
          />

          {/* Ticks & Subdivisions */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = -180 + (tick / 100) * 180;
            const rad = (angle * Math.PI) / 180;
            const startR = radius - 8;
            const endR = radius + 8;
            const x1 = cx + startR * Math.cos(rad);
            const y1 = cy + startR * Math.sin(rad);
            const x2 = cx + endR * Math.cos(rad);
            const y2 = cy + endR * Math.sin(rad);

            return (
              <line
                key={`tick-${tick}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#050811"
                strokeWidth="2.5"
              />
            );
          })}

          {/* Needle Pin / Center Pivot */}
          <circle cx={cx} cy={cy} r="8" className="fill-[#0b1329] stroke-slate-800/80 stroke-[1.5]" />
          <circle cx={cx} cy={cy} r="4" className="fill-cyan-400 animate-pulse" />

          {/* Needle Pointer */}
          <path
            d={`M ${cx - 2},${cy} L ${cx},${cy - radius + 8} L ${cx + 2},${cy} Z`}
            className="fill-rose-500 stroke-rose-400 stroke-[0.5] filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: "transform 1.4s cubic-bezier(0.25, 1.25, 0.5, 1)",
            }}
          />

          {/* Left/Right Limit Marks */}
          <text x={cx - radius - 15} y={cy + 5} className="fill-slate-600 text-[9px] font-black font-mono font-semibold">0%</text>
          <text x={cx + radius + 3} y={cy + 5} className="fill-slate-600 text-[9px] font-black font-mono font-semibold">100%</text>
        </svg>

        {/* Floating Digital Stats */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-2xl font-black text-slate-50 font-mono tracking-tight leading-none bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
            {score}%
          </span>
          <span className={`text-[8px] font-black uppercase tracking-widest mt-1 font-mono leading-none ${complianceColor}`}>
            {complianceLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
