import React, { useState, useEffect } from 'react';
import analyticsApi from '../services/analyticsApi';
import Loader from '../components/Loader';
import AIAssistant from '../components/AIAssistant';
import { FileText, Printer, Download, ShieldCheck, AlertOctagon, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getExecutiveReport();
        if (res.data.success) {
          setReport(res.data.report);
        }
      } catch (err) {
        console.error('Error fetching executive report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="p-8">
        <Loader message="Compiling executive accreditation intelligence report..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Accreditation Intelligence Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official executive intelligence dossier compiled for hospital board and accreditation auditors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 print:border-slate-300 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400 print:text-blue-600" />
              <h2 className="text-xl font-black text-white print:text-slate-900 tracking-tight">
                {report.hospitalName}
              </h2>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Accreditation Intelligence & Decision-Support Synthesis
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1">
            <p>
              Report Ref: <strong className="font-mono text-cyan-400 print:text-blue-600">{report.reportId}</strong>
            </p>
            <p>Audit Period: <strong className="text-slate-200 print:text-slate-800">{report.period}</strong></p>
            <p>Generated: <strong className="text-slate-200 print:text-slate-800">{formatDate(report.generatedAt)}</strong></p>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-slate-50 print:border-slate-200 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 print:text-blue-600">
            Executive Summary
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white print:text-slate-900">
                Composite Accreditation Risk: {report.overallStatus.category} ({report.overallStatus.score}/100)
              </h3>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed max-w-2xl">
                {report.overallStatus.summary}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl font-extrabold font-mono text-red-400 print:text-red-600 block">
                {report.overallStatus.score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500">
                Risk Index
              </span>
            </div>
          </div>
        </div>

        {/* Department Risk Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
            Departmental Risk Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Risk Score</th>
                  <th className="py-2.5 px-3 text-center">Conformance</th>
                  <th className="py-2.5 px-3 text-center">Avg Wait Time</th>
                  <th className="py-2.5 px-3 text-center">Infection Rate</th>
                  <th className="py-2.5 px-3 text-center">Risk Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {report.departmentalBreakdown.map((d, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-bold text-slate-100 print:text-slate-900">{d.department}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-400 print:text-blue-600">
                      {d.overallRiskScore}/100
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300 print:text-slate-700">
                      {d.telemetry?.pathwayConformance || 75}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300 print:text-slate-700">
                      {d.telemetry?.avgWaitingTime || 40}m
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300 print:text-slate-700">
                      {d.telemetry?.infectionRate || 2.0} / 1000
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-[10px] uppercase text-red-400 print:text-red-600">
                        {d.riskCategory}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Process Deviations & Accreditation Violations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deviations */}
          <div className="space-y-2 p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Process Mining Deviation Summary
            </h4>
            <div className="space-y-2 text-xs">
              {report.processMiningHighlights.deviationsDetected.map((dev, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-red-400 print:text-red-600 block">{dev.activity}</span>
                  <span className="text-slate-400 print:text-slate-600 text-[11px] block mt-0.5">{dev.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standards Breaches */}
          <div className="space-y-2 p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              NABH & JCI Standard Breaches
            </h4>
            <div className="space-y-2 text-xs">
              {report.accreditationViolations.map((v, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-200">
                  <span className="font-bold text-cyan-400 print:text-blue-600 block">[{v.standardId}] {v.title}</span>
                  <span className="text-amber-400 print:text-amber-600 text-[11px] block mt-0.5">Status: {v.status} • Impact: {v.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Executive Recommendations */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
            <span>Priority Executive Recommendations for Hospital Board</span>
          </h4>

          <div className="space-y-2 text-xs">
            {report.executiveRecommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-slate-50 print:border-slate-200 text-slate-200 print:text-slate-800 flex items-start space-x-3"
              >
                <span className="font-bold text-cyan-400 print:text-blue-600 font-mono text-sm">{i + 1}.</span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
};

export default Reports;
