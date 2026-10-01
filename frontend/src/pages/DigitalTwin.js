import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import SimulationChart from '../components/SimulationChart';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import { Cpu, Play, Sliders, RefreshCw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

const DigitalTwin = ({ selectedDepartment = 'ICU' }) => {
  const [dept, setDept] = useState(selectedDepartment === 'All' ? 'ICU' : selectedDepartment);

  // Parameter State
  const [targetOccupancy, setTargetOccupancy] = useState(100);
  const [patientVolume, setPatientVolume] = useState(650);
  const [nursesOnDuty, setNursesOnDuty] = useState(14);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(4);
  const [bedCapacity, setBedCapacity] = useState(30);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleRunSimulation = async (customParams = {}) => {
    try {
      setLoading(true);
      const payload = {
        scenarioName: `What-If Surge Simulation (${dept})`,
        department: dept,
        targetOccupancy: customParams.targetOccupancy || targetOccupancy,
        patientVolumePerDay: customParams.patientVolume || patientVolume,
        nursesOnDuty: customParams.nursesOnDuty || nursesOnDuty,
        doctorsOnDuty: customParams.doctorsOnDuty || doctorsOnDuty,
        bedCapacity: customParams.bedCapacity || bedCapacity,
        baselineOccupancy: 85,
        baselineVolume: 500,
        baselineNurses: 18,
        baselineDoctors: 5,
      };

      const res = await analyticsApi.runSimulation(payload);
      if (res.data.success) {
        setSimResult(res.data.result);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [dept]);

  const loadPreset = (presetType) => {
    if (presetType === 'icu_100_surge') {
      setTargetOccupancy(100);
      setPatientVolume(650);
      setNursesOnDuty(14);
      setDoctorsOnDuty(4);
      setBedCapacity(30);
      handleRunSimulation({ targetOccupancy: 100, patientVolume: 650, nursesOnDuty: 14, doctorsOnDuty: 4, bedCapacity: 30 });
    } else if (presetType === 'emergency_overcrowd') {
      setTargetOccupancy(95);
      setPatientVolume(800);
      setNursesOnDuty(12);
      setDoctorsOnDuty(5);
      setBedCapacity(45);
      handleRunSimulation({ targetOccupancy: 95, patientVolume: 800, nursesOnDuty: 12, doctorsOnDuty: 5, bedCapacity: 45 });
    } else if (presetType === 'optimal_staffing') {
      setTargetOccupancy(80);
      setPatientVolume(500);
      setNursesOnDuty(22);
      setDoctorsOnDuty(6);
      setBedCapacity(35);
      handleRunSimulation({ targetOccupancy: 80, patientVolume: 500, nursesOnDuty: 22, doctorsOnDuty: 6, bedCapacity: 35 });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              SimPy Digital Twin & What-If Operational Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate hospital patient queues, triage backlogs, and nurse workload constraints under variable demand.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadPreset('icu_100_surge')}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>ICU 100% Surge (Demo)</span>
          </button>
          <button
            onClick={() => loadPreset('optimal_staffing')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all"
          >
            Optimal Staffing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Simulation Control Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">What-If Simulation Parameters</h3>
          </div>

          <div className="space-y-5 text-xs">
            {/* Target Occupancy Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Target Bed Occupancy:</span>
                <span className="font-bold font-mono text-cyan-400 text-sm">{targetOccupancy}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={targetOccupancy}
                onChange={(e) => setTargetOccupancy(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50% (Low)</span>
                <span>85% (Baseline)</span>
                <span className="text-red-400 font-bold">100% (Surge)</span>
              </div>
            </div>

            {/* Daily Patient Volume Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Daily Patient Volume:</span>
                <span className="font-bold font-mono text-cyan-400 text-sm">{patientVolume} pts/day</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="25"
                value={patientVolume}
                onChange={(e) => setPatientVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>200</span>
                <span>500 (Norm)</span>
                <span>1000 (Severe)</span>
              </div>
            </div>

            {/* Active Nursing Staff Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Active Nurses on Duty:</span>
                <span className="font-bold font-mono text-cyan-400 text-sm">{nursesOnDuty} nurses</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={nursesOnDuty}
                onChange={(e) => setNursesOnDuty(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 (Shortage)</span>
                <span>18 (Standard)</span>
                <span>35 (Max)</span>
              </div>
            </div>

            {/* Attending Doctors Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Attending Physicians:</span>
                <span className="font-bold font-mono text-cyan-400 text-sm">{doctorsOnDuty} doctors</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={doctorsOnDuty}
                onChange={(e) => setDoctorsOnDuty(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>2</span>
                <span>5 (Standard)</span>
                <span>12</span>
              </div>
            </div>

            {/* Bed Capacity */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Physical Bed Capacity:</span>
                <span className="font-bold font-mono text-cyan-400 text-sm">{bedCapacity} beds</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleRunSimulation()}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{loading ? 'Running SimPy Queues...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Right 2 Columns: Live Results & Impact Chart */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-xl flex items-center justify-center">
              <Loader message="Running SimPy stochastic discrete-event simulation iterations..." />
            </div>
          ) : simResult ? (
            <SimulationChart simulationResult={simResult} department={dept} />
          ) : null}
        </div>
      </div>

      <AIAssistant currentDepartment={dept} />
    </div>
  );
};

export default DigitalTwin;
