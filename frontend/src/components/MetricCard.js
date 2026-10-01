import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  unit = '',
  target,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  isGoodTrend = true,
  icon: Icon,
  department,
  statusColor = 'cyan', // 'cyan' | 'emerald' | 'amber' | 'red'
  subtitle,
}) => {
  const getStatusBorder = () => {
    switch (statusColor) {
      case 'red':
        return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50';
      case 'amber':
        return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50';
      case 'emerald':
        return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50';
      case 'cyan':
      default:
        return 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50';
    }
  };

  const getIconColor = () => {
    switch (statusColor) {
      case 'red':
        return 'text-red-400 bg-red-500/10';
      case 'amber':
        return 'text-amber-400 bg-amber-500/10';
      case 'emerald':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'cyan':
      default:
        return 'text-cyan-400 bg-cyan-500/10';
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 backdrop-blur-sm ${getStatusBorder()}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
            {department && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {department}
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border border-white/5 ${getIconColor()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {target && (
          <span className="text-slate-400 font-medium">
            Target: <span className="text-slate-200 font-semibold">{target}</span>
          </span>
        )}

        {trend && (
          <div
            className={`flex items-center space-x-1 font-semibold ${
              isGoodTrend ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}

        {subtitle && !target && !trend && (
          <span className="text-slate-400 text-[11px]">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
