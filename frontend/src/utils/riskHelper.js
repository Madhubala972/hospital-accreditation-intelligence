export const getRiskColor = (categoryOrScore) => {
  if (typeof categoryOrScore === 'number') {
    if (categoryOrScore > 80) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (categoryOrScore > 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    if (categoryOrScore > 30) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  }

  const cat = String(categoryOrScore || '').toUpperCase();
  switch (cat) {
    case 'CRITICAL':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'HIGH':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'MODERATE':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'LOW':
    default:
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  }
};

export const getRiskBadge = (categoryOrScore) => {
  if (typeof categoryOrScore === 'number') {
    if (categoryOrScore > 80) return { label: 'CRITICAL', color: 'bg-red-500 text-white' };
    if (categoryOrScore > 60) return { label: 'HIGH', color: 'bg-orange-500 text-white' };
    if (categoryOrScore > 30) return { label: 'MODERATE', color: 'bg-amber-500 text-slate-900' };
    return { label: 'LOW', color: 'bg-emerald-500 text-slate-900' };
  }

  const cat = String(categoryOrScore || '').toUpperCase();
  switch (cat) {
    case 'CRITICAL':
      return { label: 'CRITICAL', color: 'bg-red-500 text-white' };
    case 'HIGH':
      return { label: 'HIGH', color: 'bg-orange-500 text-white' };
    case 'MODERATE':
      return { label: 'MODERATE', color: 'bg-amber-500 text-slate-900' };
    case 'LOW':
    default:
      return { label: 'LOW', color: 'bg-emerald-500 text-slate-900' };
  }
};
