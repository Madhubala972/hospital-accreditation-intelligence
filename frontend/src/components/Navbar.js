import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Bell, Activity, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ selectedDepartment, onDepartmentChange, activeAlertsCount = 2 }) => {
  const { user, logout } = useAuth();

  const departments = ['All', 'ICU', 'Emergency', 'Cardiology', 'Surgery', 'General Medicine'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 backdrop-blur-md">
      {/* Left: Brand / Hospital Status */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-base tracking-tight">Apollo Metro Health</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                LIVE NABH & JCI MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-400">Hospital Accreditation Intelligence Platform</p>
          </div>
        </Link>
      </div>

      {/* Middle: Department Selector */}
      {onDepartmentChange && (
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-2.5">DEPT:</span>
          {departments.map((dept) => {
            const isActive = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => onDepartmentChange(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: Alerts, User & Logout */}
      <div className="flex items-center space-x-4">
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors"
          title="Active Accreditation Alerts"
        >
          <Bell className="w-5 h-5" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm shadow-red-500/50 animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </Link>

        {/* User Card */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user.name}</p>
              <span className="inline-block px-2 py-0.2 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
