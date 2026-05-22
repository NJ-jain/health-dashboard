import { ShieldCheck, ArrowUp, ArrowDown } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070d19]/90 border-t border-slate-900 text-slate-500 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans mt-auto">
      {/* Legend & Legend Indicators */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/20 border border-emerald-500/25 rounded-md text-emerald-400">
          <ArrowUp size={11} className="stroke-[3px]" />
          Increase vs Previous Month (Positive / Hazardous)
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/20 border border-rose-500/25 rounded-md text-rose-400">
          <ArrowDown size={11} className="stroke-[3px]" />
          Decrease vs Previous Month (Positive / Hazardous)
        </span>
      </div>

      {/* Corporate Metadata and Slogan */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 font-semibold text-[10px] uppercase tracking-wider">
        <span className="text-rose-500 font-bold bg-rose-950/10 border border-rose-500/20 px-2 py-0.5 rounded">CONFIDENTIAL</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300">EHS Department</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">For Internal Use Only</span>
        <span className="text-slate-500">|</span>
        
        {/* Safety Badge */}
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
          <span className="font-bold tracking-wider">Stay Safe, Work Safe, Go Home Safe</span>
        </div>
      </div>
    </footer>
  );
}
