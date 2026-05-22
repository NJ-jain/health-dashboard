"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";

interface GembaTrendChartProps {
  data?: Array<{
    name: string;
    Observations: number;
    Closed: number;
  }>;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050811]/90 backdrop-blur-xl border border-slate-800/80 p-2.5 rounded-xl shadow-2xl shadow-black/60 font-mono text-[10px]">
        <p className="font-bold text-cyan-400 mb-1.5 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {item.name.toUpperCase()}:
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

export default function GembaTrendChart({ data, isLoading = false }: GembaTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data || [];

  if (isLoading || !mounted) {
    return (
      <div className="flex flex-col h-full min-h-[170px] w-full justify-between animate-pulse">
        {/* Mock Legend */}
        <div className="flex justify-center gap-4 mb-3 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <div className="h-2.5 bg-slate-800 rounded w-16" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <div className="h-2.5 bg-slate-800 rounded w-12" />
          </div>
        </div>
        {/* Double Bar Grid Loader */}
        <div className="flex-1 flex items-end gap-3.5 px-2 relative min-h-[120px]">
          {/* Cyber Y Axis line */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-800/20" />
          {/* Simulated Bars */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-1 flex items-end justify-center gap-1 h-full">
              <div 
                className="w-2 bg-slate-800/80 rounded-t-sm" 
                style={{ height: `${20 + (i * 12) % 65}%` }} 
              />
              <div 
                className="w-2 bg-slate-700/40 rounded-t-sm" 
                style={{ height: `${10 + (i * 9) % 55}%` }} 
              />
            </div>
          ))}
          {/* Cyber X Axis line */}
          <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-slate-800/20" />
        </div>
        {/* Mock X labels */}
        <div className="flex justify-between px-3 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-2 bg-slate-800/50 rounded w-6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full min-h-[170px] w-full"
    >
      <div className="w-full flex-1 min-h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: -22, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dy={8}
              className="font-mono font-semibold"
            />
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dx={-2}
              className="font-mono font-semibold"
            />
            
            {/* Dark glass tooltip */}
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top"
              height={28}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace", fontWeight: "bold", paddingBottom: "5px" }}
            />

            {/* Observations Bar */}
            <Bar 
              dataKey="Observations" 
              fill="#06b6d4" 
              name="OBSERVATIONS"
              radius={[2, 2, 0, 0]}
              animationDuration={500}
              style={{ filter: "drop-shadow(0 0 3px rgba(6,182,212,0.15))" }}
            />
            
            {/* Closed Bar */}
            <Bar 
              dataKey="Closed" 
              fill="#10b981" 
              name="RESOLVED"
              radius={[2, 2, 0, 0]}
              animationDuration={500}
              style={{ filter: "drop-shadow(0 0 3px rgba(16,185,129,0.15))" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
