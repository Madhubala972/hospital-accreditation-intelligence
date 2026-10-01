import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import benchmarkApi from '../services/benchmarkApi';

const DEPARTMENTS = ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Oncology', 'General Ward'];

const PROTOCOLS_BY_DEPT = {
  Emergency: 'Triage to Admission Pathway',
  ICU: 'Sepsis Management Protocol',
  Surgery: 'Perioperative Safety Pathway',
  Cardiology: 'Acute Coronary Syndrome Protocol',
  Oncology: 'Chemotherapy Safety Pathway',
  'General Ward': 'Routine Inpatient Care Pathway',
};

const DEFAULT_ACTIVITIES_BY_DEPT = {
  Emergency: ['Door Arrival', 'Triage Assessment', 'Physician Examination', 'Diagnostic Blood Test', 'Medication Administration', 'Admission Decision'],
  ICU: ['Admission to ICU', 'Blood Culture Taken', 'Broad Spectrum Antibiotic', 'Lactate Measurement', 'IV Fluid Resuscitation', 'Intensive Monitoring'],
  Surgery: ['Pre-op Assessment', 'WHO Checklist Sign-in', 'Anesthesia Induction', 'Surgical Procedure', 'WHO Checklist Sign-out', 'PACU Recovery'],
  Cardiology: ['Arrival with Chest Pain', '12-Lead ECG <= 10m', 'Cardiology Consult', 'Aspirin / Heparin Initiation', 'Cath Lab Activation', 'PCI Intervention'],
  Oncology: ['Patient Verification', 'Regimen Double-Check', 'Pre-Medication', 'Chemo Infusion', 'Post-Infusion Monitoring', 'Discharge Education'],
  'General Ward': ['Admission Review', 'Vital Signs Check', 'Physician Rounding', 'Medication Dispense', 'Discharge Planning'],
};

export default function DataEntryModal({ isOpen, onClose, initialTab = 'telemetry', defaultDept = 'Emergency', onDataSaved }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [department, setDepartment] = useState(defaultDept);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states
  // 1. Metric Telemetry Form
  const [metricForm, setMetricForm] = useState({
    bedOccupancy: 85,
    avgWaitTime: 35,
    conformanceRate: 88,
    nurseToPatientRatio: 1.8,
    infectionRate: 1.5,
    mortalityRate: 1.2,
    readmissionRate: 4.8,
    budgetVariance: 2.1,
    patientThroughput: 145,
    incidentCount: 2,
  });

  // 2. Patient Trace Logger Form
  const [traceForm, setTraceForm] = useState({
    caseId: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
    department: defaultDept,
    protocolName: PROTOCOLS_BY_DEPT[defaultDept] || 'Clinical Care Protocol',
    activities: DEFAULT_ACTIVITIES_BY_DEPT[defaultDept] ? DEFAULT_ACTIVITIES_BY_DEPT[defaultDept].join(', ') : '',
    totalDurationMinutes: 180,
    isCompliant: true,
    deviations: '',
  });

  // 3. Peer Benchmark Form
  const [benchmarkForm, setBenchmarkForm] = useState({
    department: defaultDept,
    metric: 'Average Triage Wait Time (min)',
    hospitalValue: 42,
    regionalPeer: 38,
    nationalBenchmark: 30,
    top10Benchmark: 22,
    unit: 'min',
    higherIsBetter: false,
  });

  // 4. Accreditation Standard Form
  const [standardForm, setStandardForm] = useState({
    code: 'COP-' + defaultDept.substring(0, 3).toUpperCase() + '-01',
    category: 'Clinical Safety',
    description: 'Adherence to accredited clinical care protocol pathway',
    department: defaultDept,
    targetThreshold: 85,
    actualValue: 88,
    operator: '>=',
    mandatory: true,
    riskWeight: 'HIGH',
  });

  // 5. Alert Trigger Form
  const [alertForm, setAlertForm] = useState({
    title: 'Elevated Triage Wait Time Surge',
    severity: 'HIGH',
    department: defaultDept,
    category: 'ANOMALY',
    reason: 'Triage wait time crossed 50 minutes threshold during peak shift.',
    recommendedAction: 'Deploy auxiliary triage support staff and activate overflow rooms.',
  });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (defaultDept) {
      setDepartment(defaultDept);
      setTraceForm((prev) => ({
        ...prev,
        department: defaultDept,
        protocolName: PROTOCOLS_BY_DEPT[defaultDept] || prev.protocolName,
        activities: DEFAULT_ACTIVITIES_BY_DEPT[defaultDept] ? DEFAULT_ACTIVITIES_BY_DEPT[defaultDept].join(', ') : prev.activities,
      }));
      setBenchmarkForm((prev) => ({ ...prev, department: defaultDept }));
      setStandardForm((prev) => ({
        ...prev,
        department: defaultDept,
        code: 'COP-' + defaultDept.substring(0, 3).toUpperCase() + '-01',
      }));
      setAlertForm((prev) => ({ ...prev, department: defaultDept }));
    }
  }, [initialTab, defaultDept, isOpen]);

  // Handle department switch in telemetry
  const handleDeptChange = (dept) => {
    setDepartment(dept);
    setTraceForm((prev) => ({
      ...prev,
      department: dept,
      protocolName: PROTOCOLS_BY_DEPT[dept] || 'Standard Protocol',
      activities: DEFAULT_ACTIVITIES_BY_DEPT[dept] ? DEFAULT_ACTIVITIES_BY_DEPT[dept].join(', ') : prev.activities,
    }));
    setBenchmarkForm((prev) => ({ ...prev, department: dept }));
    setStandardForm((prev) => ({
      ...prev,
      department: dept,
      code: 'COP-' + dept.substring(0, 3).toUpperCase() + '-01',
    }));
    setAlertForm((prev) => ({ ...prev, department: dept }));
  };

  // Pre-fill helpers
  const handleLoadCurrentMetrics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDepartmentMetric(department);
      if (res.data && res.data.metric) {
        const m = res.data.metric;
        setMetricForm({
          bedOccupancy: m.bedOccupancy ?? 85,
          avgWaitTime: m.avgWaitTime ?? 35,
          conformanceRate: m.conformanceRate ?? 88,
          nurseToPatientRatio: m.nurseToPatientRatio ?? 1.8,
          infectionRate: m.infectionRate ?? 1.5,
          mortalityRate: m.mortalityRate ?? 1.2,
          readmissionRate: m.readmissionRate ?? 4.8,
          budgetVariance: m.budgetVariance ?? 2.1,
          patientThroughput: m.patientThroughput ?? 145,
          incidentCount: m.incidentCount ?? 2,
        });
        setSuccessMsg(`Loaded existing telemetry for ${department}.`);
      }
    } catch (e) {
      setErrorMsg('Failed to load current metrics: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillSampleHighRisk = () => {
    setMetricForm({
      bedOccupancy: 96.5,
      avgWaitTime: 78.0,
      conformanceRate: 64.0,
      nurseToPatientRatio: 0.9,
      infectionRate: 4.8,
      mortalityRate: 3.5,
      readmissionRate: 11.2,
      budgetVariance: 14.5,
      patientThroughput: 210,
      incidentCount: 8,
    });
    setSuccessMsg('Filled High-Risk operational stress profile.');
  };

  const handleFillSampleIdeal = () => {
    setMetricForm({
      bedOccupancy: 78.0,
      avgWaitTime: 22.0,
      conformanceRate: 98.5,
      nurseToPatientRatio: 2.5,
      infectionRate: 0.4,
      mortalityRate: 0.5,
      readmissionRate: 2.1,
      budgetVariance: 0.5,
      patientThroughput: 160,
      incidentCount: 0,
    });
    setSuccessMsg('Filled Gold-Standard Accredited profile.');
  };

  // Submit Handlers
  const handleSaveTelemetry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        department,
        bedOccupancy: parseFloat(metricForm.bedOccupancy),
        avgWaitTime: parseFloat(metricForm.avgWaitTime),
        conformanceRate: parseFloat(metricForm.conformanceRate),
        nurseToPatientRatio: parseFloat(metricForm.nurseToPatientRatio),
        infectionRate: parseFloat(metricForm.infectionRate),
        mortalityRate: parseFloat(metricForm.mortalityRate),
        readmissionRate: parseFloat(metricForm.readmissionRate),
        budgetVariance: parseFloat(metricForm.budgetVariance),
        patientThroughput: parseInt(metricForm.patientThroughput, 10),
        incidentCount: parseInt(metricForm.incidentCount, 10),
      };

      const res = await analyticsApi.saveDepartmentMetric(payload);
      if (res.data.success) {
        setSuccessMsg(`Telemetry saved for ${department}! ML Risk score recalculated to ${res.data.metric?.riskScore?.toFixed(1) || 'Updated'}.`);
        if (onDataSaved) onDataSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const actList = traceForm.activities
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const devList = traceForm.deviations
        ? traceForm.deviations.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [];

      const payload = {
        caseId: traceForm.caseId || `CASE-${Date.now()}`,
        department: traceForm.department,
        protocolName: traceForm.protocolName,
        activities: actList,
        totalDurationMinutes: parseFloat(traceForm.totalDurationMinutes) || 120,
        isCompliant: traceForm.isCompliant,
        deviations: devList,
      };

      const res = await analyticsApi.addPatientTrace(payload);
      if (res.data.success) {
        setSuccessMsg(`Patient Trace ${traceForm.caseId} recorded! Process Mining DFG recalculated.`);
        // Generate fresh Case ID
        setTraceForm((prev) => ({
          ...prev,
          caseId: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        }));
        if (onDataSaved) onDataSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to log patient trace');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBenchmark = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        department: benchmarkForm.department,
        metric: benchmarkForm.metric,
        hospitalValue: parseFloat(benchmarkForm.hospitalValue),
        regionalPeer: parseFloat(benchmarkForm.regionalPeer),
        nationalBenchmark: parseFloat(benchmarkForm.nationalBenchmark),
        top10Benchmark: parseFloat(benchmarkForm.top10Benchmark),
        unit: benchmarkForm.unit,
        higherIsBetter: benchmarkForm.higherIsBetter,
      };

      const res = await benchmarkApi.saveBenchmark(payload);
      if (res.data.success) {
        setSuccessMsg(`Peer benchmark for "${benchmarkForm.metric}" saved and percentiles updated!`);
        if (onDataSaved) onDataSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save benchmark');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStandard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        code: standardForm.code,
        category: standardForm.category,
        description: standardForm.description,
        department: standardForm.department,
        targetThreshold: parseFloat(standardForm.targetThreshold),
        actualValue: parseFloat(standardForm.actualValue),
        operator: standardForm.operator,
        mandatory: standardForm.mandatory,
        riskWeight: standardForm.riskWeight,
      };

      const res = await analyticsApi.saveStandard(payload);
      if (res.data.success) {
        setSuccessMsg(`Accreditation Standard ${standardForm.code} saved! Status: ${res.data.standard?.status || 'COMPLIANT'}.`);
        if (onDataSaved) onDataSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save standard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        title: alertForm.title,
        severity: alertForm.severity,
        department: alertForm.department,
        category: alertForm.category,
        reason: alertForm.reason,
        recommendedAction: alertForm.recommendedAction,
      };

      const res = await analyticsApi.createAlert(payload);
      if (res.data.success) {
        setSuccessMsg(`Hospital Alert "${alertForm.title}" recorded and dispatched to risk monitors!`);
        if (onDataSaved) onDataSaved();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to dispatch alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                Hospital Data & Event Ingestion Hub
              </h2>
              <p className="text-xs text-slate-400">
                Directly enter telemetry, log clinical event traces, adjust peer benchmarks, and record accreditation standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 pb-2 border-b border-slate-800/60">
          {[
            { id: 'telemetry', label: '📊 Operational Telemetry' },
            { id: 'traces', label: '🔄 Patient Case Trace Logger' },
            { id: 'benchmarks', label: '🌐 Peer Benchmarks' },
            { id: 'standards', label: '📜 Accreditation Standards' },
            { id: 'alerts', label: '🚨 Trigger Custom Alert' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4">
          {/* TAB 1: OPERATIONAL TELEMETRY */}
          {activeTab === 'telemetry' && (
            <form onSubmit={handleSaveTelemetry} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-medium text-slate-300">Department:</label>
                  <select
                    value={department}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleLoadCurrentMetrics}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition"
                  >
                    📥 Fetch Current Data
                  </button>
                  <button
                    type="button"
                    onClick={handleFillSampleHighRisk}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition"
                  >
                    ⚠️ High Risk Preset
                  </button>
                  <button
                    type="button"
                    onClick={handleFillSampleIdeal}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 transition"
                  >
                    ✨ Accredited Ideal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Bed Occupancy (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricForm.bedOccupancy}
                    onChange={(e) => setMetricForm({ ...metricForm, bedOccupancy: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Average Wait Time (mins)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={metricForm.avgWaitTime}
                    onChange={(e) => setMetricForm({ ...metricForm, avgWaitTime: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pathway Conformance Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={metricForm.conformanceRate}
                    onChange={(e) => setMetricForm({ ...metricForm, conformanceRate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nurse-to-Patient Ratio</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={metricForm.nurseToPatientRatio}
                    onChange={(e) => setMetricForm({ ...metricForm, nurseToPatientRatio: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Infection Rate (per 1k days)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={metricForm.infectionRate}
                    onChange={(e) => setMetricForm({ ...metricForm, infectionRate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mortality Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={metricForm.mortalityRate}
                    onChange={(e) => setMetricForm({ ...metricForm, mortalityRate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">30-Day Readmission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={metricForm.readmissionRate}
                    onChange={(e) => setMetricForm({ ...metricForm, readmissionRate: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Budget Variance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={metricForm.budgetVariance}
                    onChange={(e) => setMetricForm({ ...metricForm, budgetVariance: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Patient Throughput</label>
                  <input
                    type="number"
                    min="0"
                    value={metricForm.patientThroughput}
                    onChange={(e) => setMetricForm({ ...metricForm, patientThroughput: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Recalculating ML Risk...' : '💾 Save & Recalculate Risk Engine'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PATIENT CASE TRACE LOGGER */}
          {activeTab === 'traces' && (
            <form onSubmit={handleSaveTrace} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Case ID</label>
                    <input
                      type="text"
                      value={traceForm.caseId}
                      onChange={(e) => setTraceForm({ ...traceForm, caseId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Department</label>
                    <select
                      value={traceForm.department}
                      onChange={(e) => {
                        const d = e.target.value;
                        setTraceForm({
                          ...traceForm,
                          department: d,
                          protocolName: PROTOCOLS_BY_DEPT[d] || 'Standard Protocol',
                          activities: DEFAULT_ACTIVITIES_BY_DEPT[d] ? DEFAULT_ACTIVITIES_BY_DEPT[d].join(', ') : '',
                        });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Protocol / Pathway Name</label>
                    <input
                      type="text"
                      value={traceForm.protocolName}
                      onChange={(e) => setTraceForm({ ...traceForm, protocolName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Activity Sequence (Comma-separated steps executed for patient):</label>
                    <span className="text-[10px] text-slate-500">Order represents patient clinical journey</span>
                  </div>
                  <textarea
                    rows={3}
                    value={traceForm.activities}
                    onChange={(e) => setTraceForm({ ...traceForm, activities: e.target.value })}
                    placeholder="e.g. Door Arrival, Triage Assessment, Blood Test, Medication, Admission"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Total Pathway Duration (Minutes)</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={traceForm.totalDurationMinutes}
                      onChange={(e) => setTraceForm({ ...traceForm, totalDurationMinutes: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Clinical Conformance Status</label>
                    <div className="flex items-center space-x-4 pt-1.5">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isCompliant"
                          checked={traceForm.isCompliant === true}
                          onChange={() => setTraceForm({ ...traceForm, isCompliant: true })}
                          className="text-emerald-500 focus:ring-0"
                        />
                        <span className="text-emerald-400">✅ Compliant</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isCompliant"
                          checked={traceForm.isCompliant === false}
                          onChange={() => setTraceForm({ ...traceForm, isCompliant: false })}
                          className="text-rose-500 focus:ring-0"
                        />
                        <span className="text-rose-400">❌ Non-Compliant / Bottleneck</span>
                      </label>
                    </div>
                  </div>
                </div>

                {!traceForm.isCompliant && (
                  <div>
                    <label className="block text-rose-400 mb-1">Recorded Process Deviations / Omissions (Comma-separated):</label>
                    <input
                      type="text"
                      value={traceForm.deviations}
                      onChange={(e) => setTraceForm({ ...traceForm, deviations: e.target.value })}
                      placeholder="e.g. Skipped Lactate Recheck, Delayed Antibiotics by 45m"
                      className="w-full bg-slate-800 border border-rose-800/60 rounded-lg px-3 py-2 text-rose-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Mining PM4Py Graph...' : '🚀 Ingest Trace & Re-mine PM4Py DFG'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PEER BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <form onSubmit={handleSaveBenchmark} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Department</label>
                    <select
                      value={benchmarkForm.department}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Metric Description</label>
                    <input
                      type="text"
                      value={benchmarkForm.metric}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, metric: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-cyan-400 mb-1 font-semibold">Hospital Current Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={benchmarkForm.hospitalValue}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, hospitalValue: e.target.value })}
                      className="w-full bg-slate-800 border border-cyan-500/60 rounded-lg px-3 py-2 text-cyan-200 font-bold focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Regional Peer Avg</label>
                    <input
                      type="number"
                      step="0.01"
                      value={benchmarkForm.regionalPeer}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, regionalPeer: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">National Benchmark</label>
                    <input
                      type="number"
                      step="0.01"
                      value={benchmarkForm.nationalBenchmark}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, nationalBenchmark: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-400 mb-1">Top 10% Decile Benchmark</label>
                    <input
                      type="number"
                      step="0.01"
                      value={benchmarkForm.top10Benchmark}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, top10Benchmark: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Unit of Measurement</label>
                    <input
                      type="text"
                      value={benchmarkForm.unit}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, unit: e.target.value })}
                      placeholder="e.g. min, %, /1000 days"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Directionality</label>
                    <select
                      value={benchmarkForm.higherIsBetter ? 'true' : 'false'}
                      onChange={(e) => setBenchmarkForm({ ...benchmarkForm, higherIsBetter: e.target.value === 'true' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="false">Lower is Better (e.g. Wait Time, Infection Rate, Mortality)</option>
                      <option value="true">Higher is Better (e.g. Conformance %, Patient Satisfaction)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Recalculating Percentiles...' : '🌐 Save Benchmark & Compute Percentiles'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ACCREDITATION STANDARDS */}
          {activeTab === 'standards' && (
            <form onSubmit={handleSaveStandard} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Standard Code</label>
                    <input
                      type="text"
                      value={standardForm.code}
                      onChange={(e) => setStandardForm({ ...standardForm, code: e.target.value })}
                      placeholder="e.g. COP-ICU-01"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Department</label>
                    <select
                      value={standardForm.department}
                      onChange={(e) => setStandardForm({ ...standardForm, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={standardForm.category}
                      onChange={(e) => setStandardForm({ ...standardForm, category: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Standard Description & Requirement</label>
                  <input
                    type="text"
                    value={standardForm.description}
                    onChange={(e) => setStandardForm({ ...standardForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Compliance Operator</label>
                    <select
                      value={standardForm.operator}
                      onChange={(e) => setStandardForm({ ...standardForm, operator: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value=">=">&gt;= (Greater or Equal)</option>
                      <option value="<=">&lt;= (Less or Equal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Accreditation Target</label>
                    <input
                      type="number"
                      step="0.1"
                      value={standardForm.targetThreshold}
                      onChange={(e) => setStandardForm({ ...standardForm, targetThreshold: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-400 mb-1">Hospital Actual Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={standardForm.actualValue}
                      onChange={(e) => setStandardForm({ ...standardForm, actualValue: e.target.value })}
                      className="w-full bg-slate-800 border border-cyan-500/60 rounded-lg px-3 py-2 text-cyan-200 font-bold focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Risk Weight</label>
                    <select
                      value={standardForm.riskWeight}
                      onChange={(e) => setStandardForm({ ...standardForm, riskWeight: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="HIGH">CRITICAL / HIGH</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Evaluating Standard...' : '📜 Save Standard & Verify Compliance'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: TRIGGER CUSTOM ALERT */}
          {activeTab === 'alerts' && (
            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Alert Title</label>
                    <input
                      type="text"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Department</label>
                    <select
                      value={alertForm.department}
                      onChange={(e) => setAlertForm({ ...alertForm, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Severity Level</label>
                    <select
                      value={alertForm.severity}
                      onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="CRITICAL">🔴 CRITICAL</option>
                      <option value="HIGH">🟠 HIGH</option>
                      <option value="MODERATE">🟡 MODERATE</option>
                      <option value="LOW">🔵 LOW</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Deficit Reason / Root Cause</label>
                  <textarea
                    rows={2}
                    value={alertForm.reason}
                    onChange={(e) => setAlertForm({ ...alertForm, reason: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Recommended Corrective Action</label>
                  <input
                    type="text"
                    value={alertForm.recommendedAction}
                    onChange={(e) => setAlertForm({ ...alertForm, recommendedAction: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium text-xs shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Dispatching Alert...' : '🚨 Broadcast Immediate Alert'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
