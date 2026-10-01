import React from 'react';
import RiskGauge from './RiskGauge';
import { ShieldAlert, CheckCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { getRiskColor } from '../utils/riskHelper';

const RiskCard = ({
  department = 'ICU',
  riskScore = 82,
  riskCategory = 'CRITICAL',
  contributingFactors = [],
  recommendedActions = [],
  disclaimer,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Accreditation Risk Assessment ({department})
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Multi-factor synthesis evaluating clinical pathway conformance, SimPy digital twin strain, Random Forest ML prediction, and NABH/JCI indicator standards.
          </p>
        </div>

        {/* Gauge Component */}
        <div className="shrink-0 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
          <RiskGauge score={riskScore} category={riskCategory} />
        </div>
      </div>

      {/* Breakdown Factors & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left: Top Contributors */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Primary Risk Contributors</span>
          </h3>

          <div className="space-y-2.5">
            {contributingFactors && contributingFactors.length > 0 ? (
              contributingFactors.slice(0, 3).map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start space-x-3"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-cyan-400 font-mono">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{factor.feature}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getRiskColor(factor.impact)}`}>
                        {factor.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{factor.explanation}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No significant risk contributors detected.</p>
            )}
          </div>
        </div>

        {/* Right: Recommended Corrective Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Actionable Priority Interventions</span>
          </h3>

          <div className="space-y-2.5">
            {recommendedActions && recommendedActions.length > 0 ? (
              recommendedActions.slice(0, 3).map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">Maintain standard accreditation monitoring protocol.</p>
            )}
          </div>
        </div>
      </div>

      {disclaimer && (
        <div className="mt-5 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center space-x-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
};

export default RiskCard;
