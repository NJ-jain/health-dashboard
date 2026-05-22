"use client";
 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  ClipboardCheck, 
  Users, 
  GraduationCap, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Flame,
  FileSpreadsheet,
  X
} from "lucide-react";
 
interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  ehsLead?: string;
  isOpen?: boolean;
  onClose?: () => void;
}
 
export default function Sidebar({ 
  activeTab = "dashboard", 
  onTabChange, 
  ehsLead,
  isOpen = false,
  onClose
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
 
  const menuItems = [
    { id: "dashboard", label: "EHS Dashboard", icon: LayoutDashboard },
    { id: "incidents", label: "Incident Tracking", icon: AlertTriangle },
    { id: "audits", label: "Compliance Audits", icon: ClipboardCheck },
    { id: "gemba", label: "Gemba Walks", icon: Users },
    { id: "training", label: "Training & Learn", icon: GraduationCap },
    { id: "reports", label: "EHS Reports", icon: FileSpreadsheet },
    { id: "settings", label: "System Settings", icon: Settings },
  ];
 
  // User Session Profile (Footer)
  const initials = ehsLead
    ? ehsLead.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AS";
 
  return (
    <>
      {/* Mobile Glass Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050811]/70 backdrop-blur-md z-40 lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        animate={{ 
          width: isCollapsed ? 76 : 260
        }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className={`bg-[#070b14]/95 border-r border-slate-800/40 text-slate-100 flex flex-col h-screen shrink-0 backdrop-blur-md shadow-2xl shadow-black/80 z-50 fixed top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Collapse/Expand Floating Edge Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-20 -right-3.5 bg-[#0a101e] border border-slate-800/80 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 p-1.5 rounded-full z-40 hidden lg:flex items-center justify-center shadow-lg shadow-black/50 cursor-pointer transition-all duration-200"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={11} className="stroke-[3px]" />
          ) : (
            <ChevronLeft size={11} className="stroke-[3px]" />
          )}
        </button>
 
        {/* Brand logo header */}
        <div className={`h-16 flex items-center border-b border-slate-800/30 bg-slate-900/10 px-4 ${
          isCollapsed && !isOpen ? "justify-center" : "justify-between"
        }`}>
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="p-2 bg-gradient-to-tr from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)] cyber-glow-pulse">
              <ShieldAlert size={18} className="stroke-[2.2px]" />
            </div>
            <AnimatePresence>
              {(!isCollapsed || isOpen) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-black text-[13px] tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent truncate font-mono"
                >
                  SURAKSHA EHS
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile close toggle button */}
          {isOpen && onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-450 hover:text-cyan-450 hover:bg-slate-800/40 rounded-xl transition-all duration-200 cursor-pointer"
              title="Close Drawer"
            >
              <X size={16} className="stroke-[2.5px]" />
            </button>
          )}
        </div>


      {/* Navigation items */}
      <nav className={`flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar px-3`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 group relative overflow-hidden select-none ${
                isActive 
                  ? "bg-slate-900/60 border border-cyan-500/20 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.06)] shadow-cyan-950/10"
                  : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 hover:border-slate-800/30"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active neon sidebar highlight marker */}
              {isActive && (
                <motion.div 
                  layoutId="activeBarMarker"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-cyan-400 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon 
                size={18} 
                className={`transition-all duration-200 shrink-0 ${
                  isActive ? "text-cyan-400 filter drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]" : "text-slate-400 group-hover:text-slate-200"
                }`} 
              />
              
              {!isCollapsed && (
                <span className="truncate font-sans font-medium tracking-wide">
                  {item.label
                  }
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety Message Panel */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="m-4 p-4 rounded-2xl bg-gradient-to-tr from-slate-900/40 via-slate-900/20 to-rose-950/5 border border-slate-800/40 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Top red dot blink alert */}
            <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Flame size={14} className="stroke-[2.2px]" />
              <span className="text-[10px] font-black uppercase tracking-widest font-mono">Live Risk Scan</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              LOTO isolation check is outstanding in Area-C maintenance hangar today.
            </p>
            <div className="mt-3.5 text-[9px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline w-fit">
              Assess Hazards &rarr;
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-4 border-t border-slate-800/30 bg-slate-900/10 flex items-center ${
        isCollapsed ? "justify-center" : "gap-3.5"
      } overflow-hidden shrink-0`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-600 to-blue-600 flex items-center justify-center font-black text-slate-100 text-xs shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0 font-mono">
          {initials}
        </div>
        {!isCollapsed && (
          <div className="truncate flex-1">
            <div className="text-xs font-bold text-slate-200 truncate font-sans">{ehsLead || "Mr. A. Sharma"}</div>
            <div className="text-[9px] text-slate-500 font-bold font-mono uppercase tracking-wider truncate mt-0.5">EHS Lead Officer</div>
          </div>
        )}
      </div>
    </motion.aside>
    </>
  );
}

