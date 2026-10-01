import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  GitFork,
  Split,
  Cpu,
  Radar,
  Award,
  AlertTriangle,
  FileText,
  Bot,
  Sparkles,
  Database,
  Kanban,
} from 'lucide-react';

const navItems = [
  { name: 'Executive Overview', path: '/', icon: LayoutDashboard },
  { name: 'Accreditation Kanban (CAPA)', path: '/kanban', icon: Kanban },
  { name: 'Data Entry Center', path: '/data-entry', icon: Database },
  { name: 'Operational Metrics', path: '/metrics', icon: Activity },
  { name: 'PM4Py Process Mining', path: '/process-mining', icon: GitFork },
  { name: 'Counterfactual Analysis', path: '/counterfactual', icon: Split },
  { name: 'SimPy Digital Twin', path: '/digital-twin', icon: Cpu },
  { name: 'Peer Benchmark Radar', path: '/benchmarks', icon: Radar },
  { name: 'Accreditation Risk & Standards', path: '/accreditation-risk', icon: Award },
  { name: 'Alerts & Anomalies', path: '/alerts', icon: AlertTriangle },
  { name: 'Executive Reports', path: '/reports', icon: FileText },
  { name: 'AI Copilot Assistant', path: '/copilot', icon: Bot, isSpecial: true },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Analytics & Mining
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : item.isSpecial
                    ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.isSpecial ? 'text-cyan-400' : ''}`} />
              <span className="truncate">{item.name}</span>
              {item.isSpecial && (
                <Sparkles className="w-3 h-3 text-cyan-400 ml-auto animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer info in sidebar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span>Decision Engine Online</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          PM4Py + SimPy + Random Forest + Gemini Copilot
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
