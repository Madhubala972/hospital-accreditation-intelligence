import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check, Clock } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const AlertCard = ({ alert, onUpdateStatus }) => {
  const { _id, id, title, severity, department, reason, recommendedAction, status, timestamp } = alert;
  const alertId = _id || id;

  const getSeverityBadge = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertCircle,
          border: 'border-red-500/40 bg-red-500/5',
          text: 'text-red-400',
          badge: 'bg-red-500 text-white',
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          border: 'border-orange-500/40 bg-orange-500/5',
          text: 'text-orange-400',
          badge: 'bg-orange-500 text-white',
        };
      case 'MODERATE':
        return {
          icon: AlertTriangle,
          border: 'border-amber-500/40 bg-amber-500/5',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-900',
        };
      case 'LOW':
      default:
        return {
          icon: Info,
          border: 'border-cyan-500/40 bg-cyan-500/5',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500 text-slate-900',
        };
    }
  };

  const style = getSeverityBadge();
  const Icon = style.icon;

  return (
    <div className={`p-5 rounded-2xl border transition-all ${style.border} space-y-3`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${style.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${style.badge}`}>
                {severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                {department}
              </span>
              {status === 'ACKNOWLEDGED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ACKNOWLEDGED
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-slate-100 mt-1">{title}</h4>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(timestamp)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed pl-10">{reason}</p>

      {/* Recommended Action */}
      <div className="ml-10 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
        <span className="font-bold text-cyan-400 shrink-0">Action:</span>
        <span>{recommendedAction}</span>
      </div>

      {/* Action Workflow Buttons */}
      {onUpdateStatus && status !== 'RESOLVED' && (
        <div className="ml-10 pt-2 flex items-center space-x-2">
          {status === 'ACTIVE' && (
            <button
              onClick={() => onUpdateStatus(alertId, 'ACKNOWLEDGED')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(alertId, 'RESOLVED')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark Resolved</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
