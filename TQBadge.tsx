import React from 'react';
import { ShieldCheck, Award, Star, Medal } from 'lucide-react';

interface TQBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const TQBadge: React.FC<TQBadgeProps> = ({ score, size = 'md' }) => {
  let colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
  let Icon = ShieldCheck;
  let label = 'Bronze';

  if (score >= 90) {
    colorClass = 'bg-violet-100 text-violet-700 border-violet-200';
    Icon = Medal;
    label = 'Platinum';
  } else if (score >= 75) {
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    Icon = Award;
    label = 'Gold';
  } else if (score >= 50) {
    colorClass = 'bg-slate-200 text-slate-700 border-slate-300';
    Icon = Star;
    label = 'Silver';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} />
      <span>{label}</span>
      <span className="font-bold border-l pl-1.5 ml-0.5 border-current opacity-75">{score}</span>
    </div>
  );
};

export default TQBadge;