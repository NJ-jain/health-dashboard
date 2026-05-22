"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface IncidentBreakdownChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#050811]/90 backdrop-blur-xl border border-slate-800/80 p-2.5 rounded-xl shadow-2xl shadow-black/60 font-mono text-[10px] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: payload[0].color }} />
        <span className="text-slate-400 font-sans">{data.name.toUpperCase()}:</span>
        <span className="text-slate-100 font-bold">{data.value}</span>
      </div>
    );
  }
  return null;
};

export default function IncidentBreakdownChart({ data, isLoading = false }: IncidentBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data || [];

  // Filter out items with 0 value to make chart drawing clean, but keep them for legend list
  const activeData = chartData.filter(d => d.value > 0);
  const totalIncidents = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading || !mounted) {
    return (
      <div className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full min-h-[300px] w-full animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4 w-full">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
            INCIDENT BREAKDOWN
          </h3>
          <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">CURRENT MONTH</span>
        </div>
        <div className="flex-1 flex flex-col gap-4 justify-center items-center">
          <div className="w-9 h-9 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">
            COMPILING METRICS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      className="glass-panel border border-slate-800/60 rounded-2xl p-5 shadow-lg flex flex-col h-full"
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
          INCIDENT BREAKDOWN
        </h3>
        <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest">CURRENT MONTH</span>
      </div>

      {/* Main Container */}
      <div className="flex flex-col items-center justify-between flex-1 min-h-0 w-full">
        {/* Top: Donut Chart with absolute center total */}
        <div className="flex justify-center items-center relative w-full h-[155px] select-none">
          {/* Centered Total Indicator */}
          <div className="absolute flex flex-col items-center justify-center font-sans mt-[-2px]">
            <span className="text-3xl font-black text-slate-50 tracking-tight leading-none font-mono bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
              {totalIncidents}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 leading-none font-mono">
              TOTALS
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                animationDuration={500}
              >
                {activeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#050811" 
                    strokeWidth={2}
                    className="focus:outline-none"
                    style={{ filter: `drop-shadow(0 0 3px ${entry.color}33)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom: Detailed Legend Table arranged in a beautiful 2-column grid */}
        <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 px-1">
          {chartData.map((item) => {
            const pct = totalIncidents > 0 ? Math.round((item.value / totalIncidents) * 100) : 0;
            return (
              <div 
                key={item.name}
                className="flex items-center justify-between text-[10px] py-1 px-1.5 rounded-lg hover:bg-slate-800/30 border border-transparent hover:border-slate-800/50 transition-all duration-150 font-mono font-semibold"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span 
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-slate-300 truncate font-sans uppercase font-bold text-[9px]" title={item.name}>
                    {item.name === "LTI (Lost Time Injury)" ? "LTI" : item.name.split(" ")[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold shrink-0 ml-1">
                  <span className="text-slate-200">{item.value}</span>
                  <span className="text-slate-500 text-[8px] font-medium">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

