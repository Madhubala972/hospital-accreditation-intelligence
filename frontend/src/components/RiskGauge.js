import React from 'react';
import { getRiskBadge } from '../utils/riskHelper';

const RiskGauge = ({ score = 50, category, size = 'md', showLabel = true }) => {
  const cleanScore = Math.min(100, Math.max(0, Number(score) || 0));
  const badge = getRiskBadge(category || cleanScore);

  // SVG Gauge Calculations (Semi-circle 180 degrees)
  // Radius = 80, Center = (100, 95)
  const radius = 75;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle length
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  // Angle in degrees (-180 to 0)
  const needleAngle = -180 + (cleanScore / 100) * 180;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />   {/* Green: Low */}
              <stop offset="35%" stopColor="#f59e0b" />  {/* Amber: Moderate */}
              <stop offset="65%" stopColor="#f97316" />  {/* Orange: High */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red: Critical */}
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />

          {/* Needle Pin Center */}
          <circle cx="100" cy="95" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Needle Arrow */}
          <g transform={`rotate(${needleAngle}, 100, 95)`} className="transition-transform duration-700 ease-out">
            <line
              x1="100"
              y1="95"
              x2="100"
              y2="32"
              stroke="#f8fafc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon points="100,24 96,34 104,34" fill="#38bdf8" />
          </g>
        </svg>

        {/* Center Score readout */}
        <div className="absolute bottom-0 text-center">
          <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {Math.round(cleanScore)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/100</span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${badge.color}`}
          >
            {badge.label} RISK
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskGauge;
