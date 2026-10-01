import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, Clock, XCircle, Info } from 'lucide-react';

const PathwayChart = ({
  expectedSteps = [],
  nodes = [],
  edges = [],
  bottlenecks = [],
  variants = [],
  conformanceRate = 71,
  department = 'ICU',
}) => {
  const [selectedVariant, setSelectedVariant] = useState(0);

  const activeVariant = variants && variants[selectedVariant] ? variants[selectedVariant] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Clinical Care Pathway Miner & Conformance Flow ({department})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PM4Py DFG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directly Follows Graph comparing accredited standard flow with actual patient event execution.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Pathway Conformance:</span>
          <span
            className={`text-base font-extrabold font-mono ${
              conformanceRate >= 85
                ? 'text-emerald-400'
                : conformanceRate >= 70
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {conformanceRate}%
          </span>
        </div>
      </div>

      {/* 1. Expected Standard Pathway Flow */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accredited Standard Pathway Sequence (NABH Target)</span>
        </span>

        <div className="flex items-center space-x-2 overflow-x-auto py-3 px-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
          {expectedSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="shrink-0 px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700/80 text-center shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 block">Step {idx + 1}</span>
                <span className="text-xs font-semibold text-slate-100 whitespace-nowrap">{step}</span>
              </div>
              {idx < expectedSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Process Mining Variant Inspector */}
      {variants && variants.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Observed Patient Trajectory Variants</span>
            </span>
            <span className="text-xs text-slate-500">
              {variants.length} Distinct Care Sequences Discovered
            </span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  selectedVariant === idx
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Variant #{idx + 1}</span>
                <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                  ({v.caseCount} cases, {v.percentage}%)
                </span>
                {!v.isConformant && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Active Variant Trace Breakdown */}
          {activeVariant && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">Variant #{selectedVariant + 1} Trace:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeVariant.isConformant
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {activeVariant.isConformant ? 'CONFORMANT TRACE' : 'NON-CONFORMANT / DEVIATING'}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  Represents {activeVariant.percentage}% of patients ({activeVariant.caseCount} records)
                </span>
              </div>

              {/* Steps Flow in this variant */}
              <div className="flex items-center space-x-2 overflow-x-auto py-2">
                {activeVariant.sequence.map((step, idx) => {
                  const isExpected = expectedSteps.includes(step);
                  return (
                    <React.Fragment key={idx}>
                      <div
                        className={`shrink-0 px-3 py-2 rounded-lg border text-center ${
                          isExpected
                            ? 'bg-slate-900 border-slate-700 text-slate-200'
                            : 'bg-red-500/10 border-red-500/40 text-red-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold opacity-60 block">Event {idx + 1}</span>
                        <span className="text-xs font-semibold whitespace-nowrap">{step}</span>
                      </div>
                      {idx < activeVariant.sequence.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Check for skipped steps */}
              {expectedSteps.filter((s) => !activeVariant.sequence.includes(s)).length > 0 && (
                <div className="flex items-center space-x-2 text-xs text-red-400 pt-1">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Skipped Accredited Steps:</strong>{' '}
                    {expectedSteps.filter((s) => !activeVariant.sequence.includes(s)).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Bottlenecks Section */}
      {bottlenecks && bottlenecks.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Process Mining Delay Bottlenecks Detected</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start space-x-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {b.from} → {b.to}
                    </span>
                    <span className="font-bold font-mono text-amber-400">
                      ~{b.avgDelayMinutes} min delay
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{b.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PathwayChart;
