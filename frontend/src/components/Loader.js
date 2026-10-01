import React from 'react';
import { Activity } from 'lucide-react';

const Loader = ({ message = 'Loading intelligence telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <Activity className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide">{message}</p>
    </div>
  );
};

export default Loader;
