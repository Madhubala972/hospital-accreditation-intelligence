import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import PathwayChart from '../components/PathwayChart';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import { GitFork, Activity, Clock, AlertTriangle, CheckCircle, RefreshCw, PlusCircle } from 'lucide-react';

const ProcessMining = ({ selectedDepartment = 'ICU' }) => {
  const [dept, setDept] = useState(selectedDepartment === 'All' ? 'ICU' : selectedDepartment);
  const [loading, setLoading] = useState(true);
  const [miningData, setMiningData] = useState(null);
  const [pathwayInfo, setPathwayInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProcessData = async (targetDept) => {
    try {
      setLoading(true);
      const [mineRes, pathRes] = await Promise.all([
        analyticsApi.analyzeProcessMining({ department: targetDept }),
        analyticsApi.getDepartmentPathway(targetDept),
      ]);

      if (mineRes.data.success) setMiningData(mineRes.data.result);
      if (pathRes.data.success) setPathwayInfo(pathRes.data.pathway);
    } catch (err) {
      console.error('Error loading process mining data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const d = selectedDepartment === 'All' ? 'ICU' : selectedDepartment;
    setDept(d);
    fetchProcessData(d);
  }, [selectedDepartment]);

  if (loading || !miningData) {
    return (
      <div className="p-8">
        <Loader message={`Running PM4Py event log analysis and DFG extraction for ${dept}...`} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              PM4Py Process Mining & Clinical Pathway Discovery
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing actual patient event logs to detect sequence inversions, skipped medication verifications, and clinical bottlenecks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Log Patient Trace</span>
          </button>
          {['ICU', 'Emergency', 'Surgery'].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDept(d);
                fetchProcessData(d);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dept === d
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Process Mining Diagram */}
      <PathwayChart
        expectedSteps={pathwayInfo?.expectedSteps || []}
        nodes={miningData.nodes}
        edges={miningData.edges}
        bottlenecks={miningData.bottlenecks}
        variants={miningData.variants}
        conformanceRate={miningData.conformanceRate}
        department={dept}
      />

      {/* Statistics & Activity Frequency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Frequency Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Activity Execution & Duration Frequency</h3>
            <span className="text-xs text-slate-500 font-mono">{miningData.totalCases} Total Cases</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/40">
                <tr>
                  <th className="py-2.5 px-3">Clinical Activity</th>
                  <th className="py-2.5 px-3 text-center">Execution Count</th>
                  <th className="py-2.5 px-3 text-center">Avg Duration</th>
                  <th className="py-2.5 px-3 text-right">Standard Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {miningData.nodes.map((node, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{node.label}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-cyan-400 font-bold">
                      {node.frequency}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                      {node.avgDurationMinutes} min
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Compliant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Process Mining Summary Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Process Mining Insights</h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Analyzed Traces</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {miningData.totalCases} Patient Trajectories
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Average Throughput Time</span>
                <span className="text-lg font-bold font-mono text-cyan-400 mt-0.5 block">
                  {miningData.avgThroughputMinutes} minutes
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Non-Conformant Traces</span>
                <span className="text-lg font-bold font-mono text-red-400 mt-0.5 block">
                  {miningData.nonConformantCases} deviating cases
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block mb-1">PM4Py Alpha & DFG Analyzer:</span>
            Direct transitions with delay spikes &gt; 25m are automatically flagged as accreditation triage bottlenecks.
          </div>
        </div>
      </div>

      <AIAssistant currentDepartment={dept} />

      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="traces"
        defaultDept={dept}
        onDataSaved={() => fetchProcessData(dept)}
      />
    </div>
  );
};

export default ProcessMining;
