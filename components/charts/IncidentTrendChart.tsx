"use client";

import { useState, useEffect } from "react";
import { 
   LineChart, 
   Line, 
   XAxis, 
   YAxis, 
   CartesianGrid, 
   Tooltip, 
   Legend, 
   ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";

interface IncidentTrendChartProps {
  data?: Array<{
    name: string;
    Fatality: number;
    LTI: number;
    FirstAid: number;
    NearMiss: number;
    UnsafeAct: number;
    UnsafeCond: number;
  }>;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050811]/90 backdrop-blur-xl border border-slate-800/80 p-3 rounded-xl shadow-2xl shadow-black/60 font-mono text-[10px]">
        <p className="font-bold text-cyan-400 mb-1.5 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="text-slate-100 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function IncidentTrendChart({ data, isLoading = false }: IncidentTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data || [];

  if (isLoading || !mounted) {
    return (
      <div className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full min-h-[300px] w-full animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4 w-full">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
            INCIDENT TRENDS (MONTHLY)
          </h3>
          <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">TELEMETRY TIMELINE</span>
        </div>
        <div className="flex-1 flex flex-col gap-4 justify-center items-center">
          <div className="w-9 h-9 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">
            COMPILING TREND MATRIX...
          </span>
        </div>
      </div>
    );
  }

  // Line styling configurations matching our theme
  const lines = [
    { key: "Fatality", color: "#EF4444", name: "Fatality" },
    { key: "LTI", color: "#F97316", name: "LTI" },
    { key: "FirstAid", color: "#10B981", name: "First Aid" },
    { key: "NearMiss", color: "#06B6D4", name: "Near Miss" },
    { key: "UnsafeAct", color: "#8B5CF6", name: "Unsafe Act" },
    { key: "UnsafeCond", color: "#EAB308", name: "Unsafe Cond." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full"
    >
      {/* Chart Title */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
          INCIDENT TRENDS (MONTHLY)
        </h3>
        <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">TELEMETRY TIMELINE</span>
      </div>

      {/* Chart container */}
      <div className="w-full flex-1 min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold font-mono uppercase tracking-widest">
            No incident trends recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -22, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
              <XAxis 
                dataKey="name" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
                className="font-mono font-semibold"
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-3}
                className="font-mono font-semibold"
              />
              
              {/* Custom Glowing Tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace", fontWeight: "bold", paddingBottom: "10px" }}
              />

              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  name={line.name.toUpperCase()}
                  strokeWidth={2}
                  dot={{ r: 2.5, strokeWidth: 1.5, fill: "#050811" }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: line.color }}
                  animationDuration={600}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

