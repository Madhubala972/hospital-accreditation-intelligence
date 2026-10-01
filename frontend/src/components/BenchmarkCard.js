import React from 'react';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getRiskBadge } from '../utils/riskHelper';

const BenchmarkCard = ({ benchmark }) => {
  const {
    department,
    indicator,
    yourHospital,
    peerAverage,
    regionalBenchmark,
    nationalBenchmark,
    percentile,
    gap,
    trend,
    unit = '%',
    source,
    riskContribution = 'Moderate',
  } = benchmark;

  const isNegativeGap = (gap || 0) < 0;
  const badge = getRiskBadge(riskContribution);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
            {department}
          </span>
          <h4 className="text-sm font-bold text-slate-100">{indicator}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge.color}`}>
          {riskContribution} Risk
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-4 gap-2 py-3 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-center">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block">Your Hospital</span>
          <span className="text-sm font-bold text-white font-mono mt-0.5 block">
            {yourHospital} {unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block">Peer Average</span>
          <span className="text-sm font-bold text-slate-300 font-mono mt-0.5 block">
            {peerAverage} {unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block">Regional</span>
          <span className="text-sm font-bold text-slate-400 font-mono mt-0.5 block">
            {regionalBenchmark} {unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block">National</span>
          <span className="text-sm font-bold text-slate-400 font-mono mt-0.5 block">
            {nationalBenchmark} {unit}
          </span>
        </div>
      </div>

      {/* Gap & Percentile Status */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Peer Gap:</span>
          <span
            className={`font-bold font-mono ${
              isNegativeGap ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {gap > 0 ? `+${gap}` : gap} {unit}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Percentile: <strong className="text-slate-200 font-mono">{percentile}th</strong>
          </span>
        </div>
      </div>

      {source && (
        <p className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/40">
          Source: {source}
        </p>
      )}
    </div>
  );
};

export default BenchmarkCard;
