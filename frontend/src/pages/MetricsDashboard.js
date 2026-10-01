import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import MetricCard from '../components/MetricCard';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import {
  Activity,
  Users,
  Clock,
  HeartPulse,
  Syringe,
  AlertTriangle,
  FileCheck,
  Percent,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

const MetricsDashboard = ({ selectedDepartment = 'All' }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDept, setTargetDept] = useState('Emergency');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAllMetrics();
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const filteredMetrics =
    selectedDepartment === 'All'
      ? metrics
      : metrics.filter((m) => m.department.toLowerCase() === selectedDepartment.toLowerCase());

  if (loading) {
    return (
      <div className="p-8">
        <Loader message="Loading departmental operational metrics..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Operational & Clinical Quality Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous surveillance of patient waiting times, infection rates, staffing ratios, and care pathway conformance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setTargetDept(selectedDepartment === 'All' ? 'Emergency' : selectedDepartment);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Update / Input Telemetry</span>
          </button>
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
            {selectedDepartment} Departments ({filteredMetrics.length})
          </span>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="space-y-6">
        {filteredMetrics.map((dept, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-sm">
                  {dept.department.slice(0, 3).toUpperCase()}
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">{dept.department} Department</h2>
                  <p className="text-xs text-slate-400">
                    Capacity: {dept.occupiedBeds}/{dept.bedCapacity} Active Beds ({dept.occupancyRate}% Occupancy)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Accreditation Risk:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    dept.riskScore > 75
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : dept.riskScore > 50
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {dept.riskScore}/100 ({dept.riskCategory})
                </span>
              </div>
            </div>

            {/* Metrics Subgrid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Pathway Conformance"
                value={dept.pathwayConformance}
                unit="%"
                target=">= 90%"
                statusColor={dept.pathwayConformance < 80 ? 'red' : 'emerald'}
                icon={FileCheck}
                subtitle="Clinical Care Adherence"
              />

              <MetricCard
                title="Avg Waiting Time"
                value={dept.avgWaitingTime}
                unit="min"
                target="< 30 min"
                statusColor={dept.avgWaitingTime > 40 ? 'red' : 'cyan'}
                icon={Clock}
                subtitle="Triage to Doctor"
              />

              <MetricCard
                title="HAI Infection Rate"
                value={dept.infectionRate}
                unit="/ 1000"
                target="< 2.0"
                statusColor={dept.infectionRate > 2.5 ? 'red' : 'emerald'}
                icon={Syringe}
                subtitle="Infections per 1000 Bed Days"
              />

              <MetricCard
                title="Staffing Level"
                value={dept.staffingLevel}
                unit="%"
                target=">= 85%"
                statusColor={dept.staffingLevel < 80 ? 'amber' : 'emerald'}
                icon={Users}
                subtitle={`Nurse-to-Patient: 1:${Math.round(1 / dept.nurseToPatientRatio)}`}
              />
            </div>

            {/* Clinical Quality Secondary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Incident Reports</span>
                <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">
                  {dept.incidentCount} incidents/mo
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Medication Error Rate</span>
                <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">
                  {dept.medicationErrorRate}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">30-Day Readmission</span>
                <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">
                  {dept.readmissionRate30Day}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">Hand Hygiene Adherence</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  {dept.handHygieneCompliance}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIAssistant currentDepartment={selectedDepartment === 'All' ? 'ICU' : selectedDepartment} />

      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="telemetry"
        defaultDept={targetDept}
        onDataSaved={fetchMetrics}
      />
    </div>
  );
};

export default MetricsDashboard;
