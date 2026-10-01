import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { getRiskBadge } from '../utils/riskHelper';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-3">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SimulationChart = ({ simulationResult, department = 'ICU' }) => {
  if (!simulationResult) return null;

  const { baseline, simulated, comparison, bottlenecks, accreditationImpact, engine } = simulationResult;

  const chartData = [
    {
      metric: 'Bed Occupancy (%)',
      Current: baseline.occupancyRate,
      Simulated: simulated.occupancyRate,
    },
    {
      metric: 'Wait Time (min)',
      Current: baseline.avgWaitingTimeMinutes,
      Simulated: simulated.avgWaitingTimeMinutes,
    },
    {
      metric: 'Nurse Workload (%)',
      Current: baseline.nurseWorkloadUtilization,
      Simulated: simulated.nurseWorkloadUtilization,
    },
    {
      metric: 'Queue Length (pts)',
      Current: baseline.triageQueueLength,
      Simulated: simulated.triageQueueLength,
    },
    {
      metric: 'Projected Risk',
      Current: baseline.projectedRiskScore,
      Simulated: simulated.projectedRiskScore,
    },
  ];

  const simRiskBadge = getRiskBadge(simulated.riskCategory || simulated.projectedRiskScore);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Digital Twin Simulation Telemetry & Impact Model ({department})
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Engine: {engine || 'SimPy Discrete-Event Simulation Model'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Simulated Risk:</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${simRiskBadge.color}`}>
            {simulated.projectedRiskScore}/100 ({simRiskBadge.label})
          </span>
        </div>
      </div>

      {/* Comparison Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Current" name="Baseline Current State" fill="#0284c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Simulated" name="What-If Simulated State" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delta Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">Waiting Time Shift</span>
          <span
            className={`text-base font-bold font-mono mt-0.5 block ${
              comparison.waitingTimeDeltaMinutes > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {comparison.waitingTimeDeltaMinutes > 0 ? `+${comparison.waitingTimeDeltaMinutes}` : comparison.waitingTimeDeltaMinutes} min
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">Nurse Utilization</span>
          <span
            className={`text-base font-bold font-mono mt-0.5 block ${
              comparison.nurseUtilizationDeltaPercent > 0 ? 'text-orange-400' : 'text-emerald-400'
            }`}
          >
            {comparison.nurseUtilizationDeltaPercent > 0 ? `+${comparison.nurseUtilizationDeltaPercent}` : comparison.nurseUtilizationDeltaPercent}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">Queue Escalation</span>
          <span className="text-base font-bold font-mono mt-0.5 block text-slate-200">
            {comparison.queueLengthDelta > 0 ? `+${comparison.queueLengthDelta}` : comparison.queueLengthDelta} pts
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">Accreditation Risk Delta</span>
          <span
            className={`text-base font-bold font-mono mt-0.5 block ${
              comparison.riskScoreDelta > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {comparison.riskScoreDelta > 0 ? `+${comparison.riskScoreDelta}` : comparison.riskScoreDelta} pts
          </span>
        </div>
      </div>

      {/* Accreditation Impact Summary */}
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-red-300 uppercase tracking-wide">Accreditation Standard Impact</h4>
          <p className="text-slate-200 leading-relaxed">{accreditationImpact}</p>
        </div>
      </div>
    </div>
  );
};

export default SimulationChart;
