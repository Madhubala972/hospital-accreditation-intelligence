import React, { useState, useEffect } from 'react';
import benchmarkApi from '../services/benchmarkApi';
import BenchmarkCard from '../components/BenchmarkCard';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import DataEntryModal from '../components/DataEntryModal';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Award, TrendingDown, ShieldAlert, Globe, PlusCircle } from 'lucide-react';

const PeerBenchmark = ({ selectedDepartment = 'All' }) => {
  const [benchmarks, setBenchmarks] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      const [benchRes, radarRes] = await Promise.all([
        benchmarkApi.getBenchmarks(selectedDepartment),
        benchmarkApi.getRadar(),
      ]);

      if (benchRes.data.success) setBenchmarks(benchRes.data.benchmarks || []);
      if (radarRes.data.success) setRadarData(radarRes.data.radarData || []);
    } catch (err) {
      console.error('Error fetching benchmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, [selectedDepartment]);

  if (loading) {
    return (
      <div className="p-8">
        <Loader message="Fetching healthcare quality peer benchmarks and radar indicators..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Live External Peer Benchmark Radar
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance analysis against regional and national hospital quality registries (CMS, CDC NHSN, NABH).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ Update Peer Benchmark</span>
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            Department: <strong>{selectedDepartment}</strong>
          </div>
        </div>
      </div>

      {/* Radar Chart & Benchmark Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart Visualizer (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Multivariate Benchmark Radar</h3>
            <span className="text-xs text-slate-500">Scale: Performance Index</span>
          </div>

          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius={110}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#475569" fontSize={10} />
                <Radar
                  name="Your Hospital"
                  dataKey="yourHospital"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Peer Average"
                  dataKey="peerAverage"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />
                <Radar
                  name="National Benchmark"
                  dataKey="nationalBenchmark"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Benchmark Gap Strategic Impact Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Accreditation Impact of Gaps</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a hospital metric lags regional peer averages by more than 10%, it automatically adds a risk penalty to the NABH/JCI composite scoring engine.
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400 block font-medium">Critical ICU Gap:</span>
                <span className="font-bold text-red-400 font-mono text-sm mt-0.5 block">
                  -13.0% below Peer Sepsis Conformance
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400 block font-medium">Emergency Door-to-Doctor Gap:</span>
                <span className="font-bold text-red-400 font-mono text-sm mt-0.5 block">
                  -18.0 min delay vs national target
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-slate-300">
            Source Data is validated against public health quality registries. Local offline fallback data is currently active.
          </div>
        </div>
      </div>

      {/* Benchmark Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Individual Quality Indicators & Percentile Rankings ({benchmarks.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benchmarks.map((b, idx) => (
            <BenchmarkCard key={idx} benchmark={b} />
          ))}
        </div>
      </div>

      <AIAssistant currentDepartment={selectedDepartment === 'All' ? 'ICU' : selectedDepartment} />

      <DataEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab="benchmarks"
        defaultDept={selectedDepartment === 'All' ? 'Emergency' : selectedDepartment}
        onDataSaved={fetchBenchmarkData}
      />
    </div>
  );
};

export default PeerBenchmark;
