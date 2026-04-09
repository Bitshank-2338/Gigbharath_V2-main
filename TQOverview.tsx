import React from 'react';
import { User, TQBreakdown, TQTier } from '../types';
import { Shield, Zap, Star, Clock, UserCheck, HelpCircle, Trophy } from 'lucide-react';

interface TQOverviewProps {
  user: User;
}

const TIER_CONFIG: Record<TQTier, { color: string, bg: string, next: string, threshold: number }> = {
  Bronze: { color: 'text-amber-700', bg: 'bg-amber-100', next: 'Silver', threshold: 50 },
  Silver: { color: 'text-slate-600', bg: 'bg-slate-200', next: 'Gold', threshold: 75 },
  Gold: { color: 'text-yellow-600', bg: 'bg-yellow-100', next: 'Platinum', threshold: 90 },
  Platinum: { color: 'text-violet-600', bg: 'bg-violet-100', next: 'Max Level', threshold: 101 }
};

const CircularProgress = ({ score, tier }: { score: number, tier: TQTier }) => {
  const config = TIER_CONFIG[tier];
  
  // Create conic gradient for the progress
  const gradient = `conic-gradient(currentColor ${score}%, #e5e7eb ${score}% 100%)`;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Ring */}
      <div 
        className={`w-full h-full rounded-full ${config.color}`} 
        style={{ background: gradient }}
      ></div>
      
      {/* Inner Circle (White Mask) */}
      <div className="absolute w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
         <span className={`text-4xl font-extrabold ${config.color}`}>{score}</span>
         <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">TQ Score</span>
      </div>
    </div>
  );
};

const BreakdownItem = ({ icon: Icon, label, score, max, colorClass }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon size={16} className={colorClass} />
      </div>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`} 
          style={{ width: `${(score / max) * 100}%` }}
        ></div>
      </div>
      <span className="text-xs font-bold text-gray-600 w-8 text-right">{score}/{max}</span>
    </div>
  </div>
);

const TQOverview: React.FC<TQOverviewProps> = ({ user }) => {
  const { tqScore, tqTier, tqBreakdown } = user;
  const config = TIER_CONFIG[tqTier || 'Bronze'];
  const nextTierPoints = config.threshold - tqScore;
  const isMax = tqTier === 'Platinum';

  // Default breakdown if undefined (for safety)
  const breakdown = tqBreakdown || {
    profileStrength: 0,
    identityVerification: 0,
    emailVerificationBonus: 0,
    gigHistory: 0,
    ratingPerformance: 0,
    responseTime: 0
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-primary-600" /> Trust Quotient
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${config.bg} ${config.color}`}>
            <Trophy size={12} /> {tqTier} Tier
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Left: Circular Progress */}
        <div className="flex flex-col items-center">
            <CircularProgress score={tqScore} tier={tqTier || 'Bronze'} />
            
            <div className="mt-4 text-center">
                {!isMax ? (
                    <p className="text-xs text-gray-500">
                        <span className="font-bold text-gray-900">{nextTierPoints} pts</span> to {config.next}
                    </p>
                ) : (
                    <p className="text-xs font-bold text-indigo-600">Elite Status Achieved</p>
                )}
            </div>
        </div>

        {/* Right: Breakdown */}
        <div className="flex-1 w-full">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Score Breakdown</h4>
            
            <BreakdownItem 
                icon={UserCheck} 
                label="Profile Strength" 
                score={breakdown.profileStrength} 
                max={20} 
                colorClass="text-blue-500" 
            />
            <BreakdownItem 
                icon={Shield} 
                label="Identity Verification" 
                score={breakdown.identityVerification} 
                max={10} 
                colorClass="text-green-500" 
            />
            <BreakdownItem 
              icon={Shield} 
              label="Email Verified Bonus" 
              score={breakdown.emailVerificationBonus} 
              max={10} 
              colorClass="text-emerald-500" 
            />
            <BreakdownItem 
                icon={Clock} 
                label="Gig History" 
                score={breakdown.gigHistory} 
                max={40} 
                colorClass="text-purple-500" 
            />
            <BreakdownItem 
                icon={Star} 
                label="Rating Performance" 
                score={breakdown.ratingPerformance} 
                max={20} 
                colorClass="text-yellow-500" 
            />
            <BreakdownItem 
                icon={Zap} 
                label="Response Time" 
                score={breakdown.responseTime} 
                max={10} 
                colorClass="text-red-500" 
            />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
             <HelpCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
             <p className="text-xs text-gray-500 leading-relaxed">
               Your TQ Score is recalculated automatically when you complete gigs or update your profile.
               Verification only strengthens the identity component, so new users do not jump to high tiers automatically.
                <span className="font-medium text-gray-700"> Note:</span> You cannot edit this score manually.
             </p>
          </div>
      </div>
    </div>
  );
};

export default TQOverview;