import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import { Split, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { getRiskBadge } from '../utils/riskHelper';

const deviationOptions = [
  { id: 'Medication Verification Skipped', title: 'Medication Verification Skipped', dept: 'ICU', desc: 'Omission of secondary pharmacist/nurse verification before antibiotic infusion.' },
  { id: 'Delayed Broad-Spectrum Antibiotics', title: 'Delayed Antibiotics (> 1h)', dept: 'ICU', desc: 'Administration delayed by 45 minutes beyond the 1-hour sepsis protocol target.' },
  { id: 'Door-to-ECG Triage Delay', title: 'Door-to-ECG Triage Delay (> 10m)', dept: 'Emergency', desc: 'ECG acquisition delayed to 28 minutes due to intake registration backlog.' },
];

const CounterfactualAnalysis = ({ selectedDepartment = 'ICU' }) => {
  const [selectedDeviation, setSelectedDeviation] = useState(deviationOptions[0].id);
  const [loading, setLoading] = useState(true);
  const [cfResult, setCfResult] = useState(null);

  const fetchCounterfactual = async (devType) => {
    try {
      setLoading(true);
      const res = await analyticsApi.runCounterfactual({
        department: selectedDepartment === 'All' ? 'ICU' : selectedDepartment,
        deviationType: devType,
      });
      if (res.data.success) {
        setCfResult(res.data.result);
      }
    } catch (err) {
      console.error('Error running counterfactual analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounterfactual(selectedDeviation);
  }, [selectedDeviation, selectedDepartment]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Split className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Counterfactual Decision Modeling
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluating: "What would hospital performance look like if observed process deviations had NOT occurred?"
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decision-Support Simulation</span>
        </div>
      </div>

      {/* Select Clinical Deviation Scenario */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Observed Pathway Deviation to Evaluate:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {deviationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedDeviation(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedDeviation === opt.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{opt.title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {opt.dept}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {loading || !cfResult ? (
        <Loader message="Synthesizing counterfactual trajectory delta..." />
      ) : (
        <div className="space-y-6">
          {/* Side-by-Side Comparison: Actual vs Counterfactual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Actual Observed Outcome */}
            <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Actual Observed State</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                  {cfResult.actualOutcome.riskCategory} RISK
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Performance recorded under current process deviations: <strong>{cfResult.deviationEvaluated}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Average Waiting Time</span>
                  <span className="text-xl font-extrabold font-mono text-red-400 mt-1 block">
                    {cfResult.actualOutcome.waitingTimeMinutes} min
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Pathway Conformance</span>
                  <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">
                    {cfResult.actualOutcome.conformanceRate}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Accreditation Risk Score</span>
                  <span className="text-xl font-extrabold font-mono text-red-400 mt-1 block">
                    {cfResult.actualOutcome.riskScore} / 100
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Infection Rate</span>
                  <span className="text-xl font-extrabold font-mono text-slate-200 mt-1 block">
                    {cfResult.actualOutcome.infectionRate} / 1000
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Counterfactual Estimated Outcome */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Counterfactual Standard Pathway</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
                  {cfResult.counterfactualOutcome.riskCategory} RISK
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Estimated state if full standard care pathway adherence had been maintained without skipped steps.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Estimated Waiting Time</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                    {cfResult.counterfactualOutcome.waitingTimeMinutes} min
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Estimated Conformance</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                    {cfResult.counterfactualOutcome.conformanceRate}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Estimated Risk Score</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                    {cfResult.counterfactualOutcome.riskScore} / 100
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Estimated Infection Rate</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                    {cfResult.counterfactualOutcome.infectionRate} / 1000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta & Strategic Impact Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Estimated Decision-Support Gains</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Wait Time Reduction</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                  -{cfResult.delta.waitingTimeReductionMinutes} minutes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Conformance Gain</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                  +{cfResult.delta.conformanceImprovementPercent}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Risk Score Reduction</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                  -{cfResult.delta.riskScoreReduction} pts
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Preventable Incidents</span>
                <span className="text-lg font-bold font-mono text-cyan-400 mt-0.5 block">
                  ~{cfResult.delta.estimatedPreventableIncidents} cases/mo
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p className="leading-relaxed">{cfResult.impactSummary}</p>
              <p className="font-semibold text-cyan-400">{cfResult.accreditationBenefit}</p>
            </div>

            {/* Prominent Mandatory Disclaimer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-amber-400/90">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>IMPORTANT:</strong> {cfResult.disclaimer}
              </span>
            </div>
          </div>
        </div>
      )}

      <AIAssistant currentDepartment={selectedDepartment === 'All' ? 'ICU' : selectedDepartment} />
    </div>
  );
};

export default CounterfactualAnalysis;
