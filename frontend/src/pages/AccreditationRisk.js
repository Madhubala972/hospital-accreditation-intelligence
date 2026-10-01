import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import { Award, CheckCircle, AlertTriangle, XCircle, ShieldAlert, Filter, PlusCircle } from 'lucide-react';

const frameworks = ['All', 'NABH', 'JCI', 'The Joint Commission'];

const AccreditationRisk = ({ selectedDepartment = 'All' }) => {
  const [selectedFramework, setSelectedFramework] = useState('All');
  const [standards, setStandards] = useState([]);
  const [stats, setStats] = useState({ totalStandards: 0, compliantCount: 0, nonCompliantCount: 0, complianceRate: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStandards = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAccreditationStandards({
        framework: selectedFramework,
        department: selectedDepartment,
      });
      if (res.data.success) {
        setStandards(res.data.standards || []);
        setStats({
          totalStandards: res.data.totalStandards,
          compliantCount: res.data.compliantCount,
          nonCompliantCount: res.data.nonCompliantCount,
          complianceRate: res.data.complianceRate,
        });
      }
    } catch (err) {
      console.error('Error fetching standards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, [selectedFramework, selectedDepartment]);

  if (loading) {
    return (
      <div className="p-8">
        <Loader message="Loading accreditation standards compliance registry..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Accreditation Standards & Compliance Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated compliance mapping against NABH (Care of Patients, Infection Control), JCI (IPSG), and TJC frameworks.
          </p>
        </div>

        {/* Framework Filter & Data Entry */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Add / Update Standard</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
            {frameworks.map((fw) => (
              <button
                key={fw}
                onClick={() => setSelectedFramework(fw)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFramework === fw
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-semibold block">Total Monitored Standards</span>
          <span className="text-2xl font-extrabold font-mono text-white mt-1 block">
            {stats.totalStandards} Standards
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center">
          <span className="text-xs text-slate-400 font-semibold block">Compliant Indicators</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
            {stats.compliantCount} Compliant
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-red-500/30 text-center">
          <span className="text-xs text-slate-400 font-semibold block">Non-Compliant Breaches</span>
          <span className="text-2xl font-extrabold font-mono text-red-400 mt-1 block">
            {stats.nonCompliantCount} Non-Compliant
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-semibold block">Overall Compliance Rate</span>
          <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 block">
            {stats.complianceRate}%
          </span>
        </div>
      </div>

      {/* Standards Compliance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Accreditation Indicators Compliance Registry</h3>
          <span className="text-xs text-slate-500 font-mono">Framework: {selectedFramework}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/50">
              <tr>
                <th className="py-3 px-4">Standard Code</th>
                <th className="py-3 px-4">Category & Title</th>
                <th className="py-3 px-4 text-center">Accreditation Threshold</th>
                <th className="py-3 px-4 text-center">Current Value</th>
                <th className="py-3 px-4 text-center">Compliance Status</th>
                <th className="py-3 px-4">Recommended Corrective Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standards.map((s, idx) => {
                const isNonCompliant = s.complianceStatus === 'Non-Compliant' || s.complianceStatus === 'Sub-Optimal';
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {s.standardId}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        {s.framework} • {s.category}
                      </span>
                      <span className="font-semibold text-slate-100 block">{s.title}</span>
                      <span className="text-[11px] text-slate-400 block">{s.indicator}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                      {s.operator} {s.threshold} {s.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={isNonCompliant ? 'text-red-400' : 'text-emerald-400'}>
                        {s.currentValue} {s.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.complianceStatus === 'Compliant'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : s.complianceStatus === 'Sub-Optimal'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {s.complianceStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs leading-relaxed">
                      {s.correctiveAction || 'Maintain regular surveillance.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AIAssistant currentDepartment={selectedDepartment === 'All' ? 'ICU' : selectedDepartment} />

      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="standards"
        defaultDept={selectedDepartment === 'All' ? 'Emergency' : selectedDepartment}
        onDataSaved={fetchStandards}
      />
    </div>
  );
};

export default AccreditationRisk;
