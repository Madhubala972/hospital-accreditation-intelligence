import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import benchmarkApi from '../services/benchmarkApi';
import DataEntryModal from '../components/DataEntryModal';

export default function DataEntryCenter() {
  const [metrics, setMetrics] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [standards, setStandards] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('telemetry');
  const [modalDept, setModalDept] = useState('Emergency');

  // JSON batch paste state
  const [rawJsonText, setRawJsonText] = useState('');
  const [batchType, setBatchType] = useState('metrics');

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, pRes, sRes, bRes] = await Promise.all([
        analyticsApi.getAllMetrics(),
        analyticsApi.getAllPathways(),
        analyticsApi.getAccreditationStandards(),
        benchmarkApi.getBenchmarks('All'),
      ]);

      setMetrics(mRes.data?.metrics || []);
      setPathways(pRes.data?.pathways || []);
      setStandards(sRes.data?.standards || []);
      setBenchmarks(bRes.data?.benchmarks || []);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openDataModal = (tab, dept = 'Emergency') => {
    setModalTab(tab);
    setModalDept(dept);
    setModalOpen(true);
  };

  // Quick edit single metric field inline
  const handleQuickMetricChange = (deptName, field, value) => {
    setMetrics((prev) =>
      prev.map((m) => {
        if (m.department === deptName) {
          return { ...m, [field]: parseFloat(value) || 0 };
        }
        return m;
      })
    );
  };

  const handleSaveDepartmentRow = async (deptMetric) => {
    try {
      setFeedback({ type: 'info', text: `Recalculating ML Risk for ${deptMetric.department}...` });
      const res = await analyticsApi.saveDepartmentMetric(deptMetric);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Updated ${deptMetric.department}! ML Risk: ${res.data.metric?.riskScore?.toFixed(1) || 'Updated'}. Conformance and digital twin synchronized.`,
        });
        loadAllData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  // Batch paste handler
  const handleBatchIngest = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array of objects [ { ... }, { ... } ]');
      }

      setFeedback({ type: 'info', text: `Ingesting ${parsed.length} records...` });
      let successCount = 0;

      for (const item of parsed) {
        if (batchType === 'metrics') {
          await analyticsApi.saveDepartmentMetric(item);
          successCount++;
        } else if (batchType === 'traces') {
          await analyticsApi.addPatientTrace(item);
          successCount++;
        } else if (batchType === 'benchmarks') {
          await benchmarkApi.saveBenchmark(item);
          successCount++;
        } else if (batchType === 'standards') {
          await analyticsApi.saveStandard(item);
          successCount++;
        }
      }

      setFeedback({
        type: 'success',
        text: `Successfully ingested and processed ${successCount} ${batchType} records into intelligence pipeline!`,
      });
      setRawJsonText('');
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Batch Ingestion Error: ' + err.message });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Ingestion & Telemetry Center
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Data Entry & Ingestion Control Center</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Directly input, audit, and modify departmental operations, patient traces, and standards. All downstream ML risk models, PM4Py process graphs, and simulations update in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openDataModal('telemetry')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
          >
            <span>➕ New Telemetry</span>
          </button>
          <button
            onClick={() => openDataModal('traces')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
          >
            <span>🔄 Log Patient Trace</span>
          </button>
          <button
            onClick={() => openDataModal('standards')}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center space-x-1.5"
          >
            <span>📜 New Standard</span>
          </button>
          <button
            onClick={loadAllData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs">Active Departments</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Real-time telemetry streams</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs">Process Mining Cases</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {pathways.reduce((acc, p) => acc + (p.totalCases || 0), 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Logged PM4Py patient journeys</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs">Accreditation Standards</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{standards.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quality & safety clauses</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs">Peer Benchmarks</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{benchmarks.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Comparative target metrics</div>
        </div>
      </div>

      {/* Section 1: Departmental Telemetry Live Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>📊 Departmental Telemetry Live Ingestion & ML Risk Recalculator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Edit operational metrics directly in the table below and click "Save & Re-score" to run the gradient boosting ML risk model.
            </p>
          </div>
          <button
            onClick={() => openDataModal('telemetry')}
            className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition self-start sm:self-auto"
          >
            ➕ Full Telemetry Form
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-800/40">
                <th className="p-3">Department</th>
                <th className="p-3">Bed Occupancy (%)</th>
                <th className="p-3">Avg Wait (min)</th>
                <th className="p-3">Conformance (%)</th>
                <th className="p-3">Nurse:Patient</th>
                <th className="p-3">Infection /1k</th>
                <th className="p-3">ML Risk Score</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {metrics.map((m) => (
                <tr key={m.department} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-sans font-bold text-white">{m.department}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={m.bedOccupancy}
                      onChange={(e) => handleQuickMetricChange(m.department, 'bedOccupancy', e.target.value)}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-cyan-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={m.avgWaitTime}
                      onChange={(e) => handleQuickMetricChange(m.department, 'avgWaitTime', e.target.value)}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-cyan-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={m.conformanceRate}
                      onChange={(e) => handleQuickMetricChange(m.department, 'conformanceRate', e.target.value)}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-emerald-300 focus:border-cyan-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={m.nurseToPatientRatio}
                      onChange={(e) => handleQuickMetricChange(m.department, 'nurseToPatientRatio', e.target.value)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-cyan-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={m.infectionRate}
                      onChange={(e) => handleQuickMetricChange(m.department, 'infectionRate', e.target.value)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-rose-300 focus:border-cyan-500"
                    />
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        (m.riskScore || 0) >= 70
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : (m.riskScore || 0) >= 40
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {m.riskScore != null ? m.riskScore.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleSaveDepartmentRow(m)}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-sans font-medium transition shadow-sm"
                    >
                      💾 Save & Re-score
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Patient Trace Event Logger Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">🔄 Patient Process Mining Traces</h3>
              <p className="text-xs text-slate-400">Departmental event sequences mined with PM4Py</p>
            </div>
            <button
              onClick={() => openDataModal('traces')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition"
            >
              ➕ Log Patient Case
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pathways.map((p) => (
              <div key={p.department} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{p.department} - {p.protocolName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.conformanceScore >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {p.conformanceScore?.toFixed(1)}% Conforming
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Total Cases Mined: <span className="text-cyan-300 font-mono">{p.totalCases}</span> | Avg Duration: <span className="text-slate-200 font-mono">{p.avgDurationHours?.toFixed(1)}h</span>
                </div>
                {p.bottlenecks && p.bottlenecks.length > 0 && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                    ⚠️ Detected Bottleneck: {p.bottlenecks.map((b) => b.activity).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Accreditation Standards Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">📜 Accreditation Standards & Clauses</h3>
              <p className="text-xs text-slate-400">Target thresholds & compliance status</p>
            </div>
            <button
              onClick={() => openDataModal('standards')}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 transition"
            >
              ➕ Add Standard
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {standards.map((s) => (
              <div key={s.code} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-300 font-bold">{s.code}</span>
                    <span className="text-slate-300 font-semibold">{s.category} ({s.department})</span>
                  </div>
                  <div className="text-slate-400 text-[11px] line-clamp-1">{s.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Target: {s.operator} {s.targetThreshold} | Actual: <span className="text-slate-300">{s.actualValue}</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'COMPLIANT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: JSON Batch Data Ingestion Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>⚡ Bulk JSON Ingestion Stream</span>
            </h3>
            <p className="text-xs text-slate-400">
              Paste raw JSON arrays of telemetry records, patient trace logs, or peer benchmarks to batch ingest directly into the data warehouse.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400">Target Pipeline:</label>
            <select
              value={batchType}
              onChange={(e) => setBatchType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
            >
              <option value="metrics">Departmental Metrics Telemetry</option>
              <option value="traces">Patient Case Traces (PM4Py)</option>
              <option value="benchmarks">Peer Benchmarks</option>
              <option value="standards">Accreditation Standards</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleBatchIngest} className="space-y-3">
          <textarea
            rows={4}
            value={rawJsonText}
            onChange={(e) => setRawJsonText(e.target.value)}
            placeholder={`[
  {
    "department": "Emergency",
    "bedOccupancy": 89.5,
    "avgWaitTime": 42.0,
    "conformanceRate": 85.0,
    "nurseToPatientRatio": 1.6,
    "infectionRate": 1.9,
    "mortalityRate": 1.5,
    "readmissionRate": 5.4,
    "budgetVariance": 3.2
  }
]`}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
            >
              🚀 Ingest & Process Batch Pipeline
            </button>
          </div>
        </form>
      </div>

      {/* Global Data Entry Modal */}
      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
        defaultDept={modalDept}
        onDataSaved={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
