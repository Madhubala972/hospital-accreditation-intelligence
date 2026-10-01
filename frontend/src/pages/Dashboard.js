import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import MetricCard from '../components/MetricCard';
import RiskCard from '../components/RiskCard';
import AlertCard from '../components/AlertCard';
import TrendChart from '../components/TrendChart';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import {
  Activity,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ selectedDepartment = 'All' }) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [overallRisk, setOverallRisk] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [deptRisk, setDeptRisk] = useState(null);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  const activeDept = selectedDepartment === 'All' ? 'ICU' : selectedDepartment;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, riskRes, trendRes, alertRes, activeDeptRiskRes] = await Promise.all([
        analyticsApi.getKPIs(),
        analyticsApi.getOverallRisk(),
        analyticsApi.getHistoricalTrends(),
        analyticsApi.getAlerts(),
        analyticsApi.getDepartmentRisk(activeDept),
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.kpis);
      if (riskRes.data.success) setOverallRisk(riskRes.data);
      if (trendRes.data.success) setTrends(trendRes.data.trends);
      if (alertRes.data.success) setAlerts(alertRes.data.alerts);
      if (activeDeptRiskRes.data.success) setDeptRisk(activeDeptRiskRes.data);
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDepartment]);

  if (loading || !kpis || !overallRisk) {
    return (
      <div className="p-8">
        <Loader message="Synthesizing multi-department accreditation telemetry..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Command Center Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Hospital Command Center & Accreditation Radar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Q1-2026 AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time compliance monitoring across NABH, JCI, and The Joint Commission accreditation standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setDataModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Enter / Ingest Data</span>
          </button>

          <button
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Feeds</span>
          </button>

          <Link
            to="/copilot"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Open AI Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top Executive Risk Card */}
      {deptRisk && (
        <RiskCard
          department={activeDept}
          riskScore={deptRisk.overallRiskScore}
          riskCategory={deptRisk.riskCategory}
          contributingFactors={deptRisk.contributingFactors}
          recommendedActions={deptRisk.recommendedActions}
          disclaimer={deptRisk.disclaimer}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Accreditation Risk"
          value={overallRisk.overallRiskScore}
          unit="/100"
          target="< 30"
          trend={`${overallRisk.riskCategory} RISK`}
          trendDirection="up"
          isGoodTrend={false}
          statusColor={overallRisk.overallRiskScore > 60 ? 'red' : 'amber'}
          icon={ShieldCheck}
        />

        <MetricCard
          title="Pathway Conformance"
          value={deptRisk?.telemetry?.pathwayConformance || kpis.averagePathwayConformance}
          unit="%"
          target=">= 90%"
          trend="-13% vs Regional Peer"
          trendDirection="down"
          isGoodTrend={false}
          statusColor="amber"
          department={activeDept}
          icon={Activity}
        />

        <MetricCard
          title="Average Waiting Time"
          value={deptRisk?.telemetry?.avgWaitingTime || kpis.averageWaitingTimeMinutes}
          unit="min"
          target="< 30 min"
          trend="+18.5m Triage Anomaly"
          trendDirection="up"
          isGoodTrend={false}
          statusColor="red"
          department={activeDept}
          icon={Clock}
        />

        <MetricCard
          title="Bed Occupancy"
          value={deptRisk?.telemetry?.occupancyRate || kpis.averageOccupancyRate}
          unit="%"
          target="< 85%"
          trend="Surge State"
          trendDirection="up"
          isGoodTrend={false}
          statusColor={deptRisk?.telemetry?.occupancyRate >= 90 ? 'red' : 'cyan'}
          department={activeDept}
          icon={Users}
        />
      </div>

      {/* Middle Section: Trends & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Trends Chart (2 Columns) */}
        <div className="lg:col-span-2">
          <TrendChart data={trends} height={300} />
        </div>

        {/* Department Accreditation Risk Rankings (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Department Risk Matrix</h3>
            <span className="text-[11px] text-slate-500">Sorted by Severity</span>
          </div>

          <div className="space-y-3">
            {overallRisk.departmentRisks.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">{d.department}</span>
                  <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                    {d.contributingFactors?.[0]?.feature || 'Standard operations'}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      d.overallRiskScore > 75
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : d.overallRiskScore > 50
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {d.overallRiskScore}/100
                  </span>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                    {d.riskCategory}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Active Alerts Preview & Quick Simulation Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Active Alerts */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-slate-100">Critical Accreditation Alerts</h3>
            </div>
            <Link to="/alerts" className="text-xs font-semibold text-cyan-400 hover:underline">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 2).map((a) => (
              <AlertCard key={a._id || a.id} alert={a} />
            ))}
          </div>
        </div>

        {/* Right: Quick Digital Twin Trigger Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Award className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Digital Twin Operational Lab</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test "what-if" surge scenarios using SimPy discrete-event modeling. Evaluate queue buildup and accreditation risk if ICU occupancy hits 100%.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Baseline State:</span>
              <span className="font-mono text-slate-200 font-bold">85% Occupancy</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Simulated Surge:</span>
              <span className="font-mono text-red-400 font-bold">100% (+31.5 Risk Δ)</span>
            </div>
          </div>

          <Link
            to="/digital-twin"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold text-center block shadow-lg shadow-cyan-500/20 transition-all"
          >
            Launch Digital Twin Simulator →
          </Link>
        </div>
      </div>

      {/* Floating AI Copilot Drawer */}
      <AIAssistant currentDepartment={activeDept} />

      {/* Global Ingestion Modal */}
      <DataEntryModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        initialTab="telemetry"
        defaultDept={activeDept}
        onDataSaved={fetchData}
      />
    </div>
  );
};

export default Dashboard;
