import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import AlertCard from '../components/AlertCard';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import { AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Filter, PlusCircle } from 'lucide-react';

const severityFilters = ['All', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
const statusFilters = ['All', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];

const Alerts = ({ selectedDepartment = 'All' }) => {
  const [alerts, setAlerts] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAlerts();
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await analyticsApi.updateAlertStatus(alertId, newStatus);
      setAlerts((prev) =>
        prev.map((a) => ((a._id === alertId || a.id === alertId) ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Error updating alert status:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchDept = selectedDepartment === 'All' || a.department.toLowerCase() === selectedDepartment.toLowerCase();
    const matchSev = selectedSeverity === 'All' || a.severity === selectedSeverity;
    const matchStat = selectedStatus === 'All' || a.status === selectedStatus;
    return matchDept && matchSev && matchStat;
  });

  if (loading) {
    return (
      <div className="p-8">
        <Loader message="Loading active accreditation alerts and anomaly notifications..." />
      </div>
    );
  }

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Accreditation Alerts & Anomaly Feed
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated warnings triggered by process conformance drops, ICU surge saturation, and benchmark deficits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Create Alert</span>
          </button>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
            {criticalCount} CRITICAL • {activeCount} ACTIVE
          </div>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Refresh Alert Stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg text-xs">
        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400">Severity:</span>
          <div className="flex items-center space-x-1">
            {severityFilters.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeverity(s)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedSeverity === s
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400">Status:</span>
          <div className="flex items-center space-x-1">
            {statusFilters.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert._id || alert.id}
              alert={alert}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
            No active alerts matching the selected filters.
          </div>
        )}
      </div>

      <AIAssistant currentDepartment={selectedDepartment === 'All' ? 'ICU' : selectedDepartment} />

      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="alerts"
        defaultDept={selectedDepartment === 'All' ? 'Emergency' : selectedDepartment}
        onDataSaved={fetchAlerts}
      />
    </div>
  );
};

export default Alerts;
