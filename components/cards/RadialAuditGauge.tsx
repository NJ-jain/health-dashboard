import React from "react";

interface RadialAuditGaugeProps {
  title: string;
  percentage: number;
  colorType?: "cyan" | "emerald" | "amber" | "purple";
  isLoading?: boolean;
}

export default function RadialAuditGauge({
  title,
  percentage,
  colorType = "cyan",
  isLoading = false
}: RadialAuditGaugeProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-3.5 bg-[#111c33]/30 border border-slate-800/60 rounded-xl animate-pulse">
        <div className="w-[72px] h-[72px] rounded-full bg-slate-800 flex items-center justify-center">
          <div className="w-[62px] h-[62px] rounded-full bg-[#070d19]" />
        </div>
        <div className="h-3 bg-slate-850 rounded-lg w-3/4 mt-2.5" />
      </div>
    );
  }

  // Setup SVG dimensions
  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine stroke color gradients
  let strokeGradient = "from-cyan-500 to-blue-500";
  let dropShadowColor = "rgba(6,182,212,0.4)";
  let textColorClass = "text-cyan-400";
  let bgGradientId = `radialGrad-${colorType}`;

  if (colorType === "emerald") {
    strokeGradient = "from-emerald-500 to-teal-500";
    dropShadowColor = "rgba(16,185,129,0.4)";
    textColorClass = "text-emerald-400";
  } else if (colorType === "amber") {
    strokeGradient = "from-amber-500 to-orange-500";
    dropShadowColor = "rgba(245,158,11,0.4)";
    textColorClass = "text-amber-400";
  } else if (colorType === "purple") {
    strokeGradient = "from-purple-500 to-indigo-500";
    dropShadowColor = "rgba(168,85,247,0.4)";
    textColorClass = "text-purple-400";
  }

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-[#111c33]/30 border border-slate-800/60 rounded-xl transition-all duration-250 hover:bg-[#111c33]/60">
      {/* SVG Ring container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Drawing */}
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={bgGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {colorType === "cyan" && (
                <>
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </>
              )}
              {colorType === "emerald" && (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </>
              )}
              {colorType === "amber" && (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </>
              )}
              {colorType === "purple" && (
                <>
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Underlay Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[#0b1329]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground Active Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${bgGradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out",
              filter: `drop-shadow(0 0 3px ${dropShadowColor})`
            }}
          />
        </svg>

        {/* Centered Compliance Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-black text-slate-100 font-mono tracking-tighter">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Audit Target Label */}
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2.5 text-center truncate w-full">
        {title}
      </span>
    </div>
  );
}

