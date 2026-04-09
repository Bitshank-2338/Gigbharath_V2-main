import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, Gig, UserRole } from '../types';
import { 
  Search, Filter, ShieldCheck, X, Briefcase, MapPin, IndianRupee, 
  Star, Linkedin, Github, Instagram, Youtube, Globe, Mail, Send, 
  Clock, Award, Medal, Zap, CheckCircle, FileText
} from 'lucide-react';
import TQBadge from '../components/TQBadge';
import TQOverview from '../components/TQOverview';

export interface ProfileModalProps {
  freelancer: User;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ freelancer, onClose }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Gig[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  useEffect(() => {
    // Fetch work history for the selected freelancer
    setHistory(api.gigs.getHistory(freelancer.id));
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [freelancer]);

  const handleSendOffer = () => {
    const employer = api.auth.getCurrentUser();
    if (!employer) return;

    setSending(true);
    // Simulate API delay
    setTimeout(() => {
      api.notifications.create({
        userId: freelancer.id,
        type: 'OFFER',
        title: 'New Direct Offer!',
        message: `${employer.name} has sent you a direct project proposal. View your gigs to respond.`,
        link: '/find-work'
      });
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 1000);
  };

  const handleOpenChat = () => {
    navigate('/chats', {
      state: {
        participantId: freelancer.id,
        participantName: freelancer.name,
        participantRole: UserRole.FREELANCER
      }
    });
  };

  const totalEarnings = history.reduce((sum, item) => sum + item.budget, 0);
  const hasHistory = history.length > 0;
  
  const avgRating = hasHistory 
    ? (history.reduce((sum, item) => sum + (item.clientRating || 0), 0) / history.length).toFixed(1) 
    : '0.0';

  const successRate = hasHistory ? "100%" : "0%";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        {/* Header/Cover */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-sky-600 via-indigo-600 to-primary-700 flex-shrink-0 flex items-end">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.2)_0%,_transparent_50%)]"></div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>
          
          <div className="relative w-full px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 z-10">
            <div className="relative group">
                <img 
                src={freelancer.avatarUrl || `https://ui-avatars.com/api/?name=${freelancer.name}`}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white/20 shadow-2xl object-cover bg-white/10 backdrop-blur-md transition-transform group-hover:scale-[1.02]"
                alt={freelancer.name}
                />
                {freelancer.verified && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg" title="Identity Verified">
                        <ShieldCheck size={18} />
                    </div>
                )}
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">{freelancer.name}</h2>
                <div className="flex justify-center gap-2">
                    <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-lg border border-white/10 backdrop-blur-md uppercase font-bold tracking-widest">{freelancer.userTag || '#GENESIS'}</span>
                    {!freelancer.verified && <span className="text-[10px] bg-amber-500/20 text-amber-100 px-2 py-1 rounded-lg border border-amber-500/30 backdrop-blur-md uppercase font-bold tracking-widest">Unverified</span>}
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <p className="text-sky-100 text-lg font-medium opacity-95">{freelancer.headline || freelancer.title || 'Freelancer'}</p>
                <div className="hidden sm:block w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                <p className="text-sky-200 text-sm flex items-center gap-1"><MapPin size={14} /> {freelancer.location || 'India'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content (Left/Center) */}
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary-600" /> Professional Bio
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {freelancer.bio || "This freelancer hasn't provided a detailed bio yet. Based on their TQ score and credentials, they demonstrate the necessary reliability for direct engagements."}
                </p>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Core Competencies</h3>
                <div className="flex flex-wrap gap-2.5">
                  {freelancer.skills?.map(skill => (
                    <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold border border-primary-100 transition-colors hover:bg-primary-100">
                      {skill}
                    </span>
                  ))}
                  {(!freelancer.skills || freelancer.skills.length === 0) && (
                      <p className="text-sm text-gray-400 italic">No skills tagged yet.</p>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-primary-600" /> Recent Portfolio
                </h3>
                {hasHistory ? (
                  <div className="space-y-4">
                    {history.slice(0, 3).map(gig => (
                      <div key={gig.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-all bg-white group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{gig.title}</h4>
                          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold">{gig.clientRating || '5.0'}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{gig.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Completed {new Date(gig.completedAt || '').toLocaleDateString()}</span>
                          <span className="text-sm font-bold text-gray-900">₹{gig.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Briefcase size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">New Talent: No public gig history yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">TQ Score reflects potential & verification</p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="sticky top-0 space-y-6">
                <TQOverview user={freelancer} />

                {/* Performance Summary */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Performance Insights</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">Total Earnings</span>
                      <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">₹{totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">Completed Gigs</span>
                      <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">{history.length || freelancer.completedGigsCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">Success Rate</span>
                      <span className={`font-extrabold px-2 py-1 rounded text-xs ${hasHistory ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                        {successRate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 group">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Avg Rating</span>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                        <Star size={14} className={`${hasHistory ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        <span className={`font-bold ${hasHistory ? 'text-gray-900' : 'text-gray-400'}`}>{avgRating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity & Compliance - NEW SECTION */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Identity & Compliance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2"><FileText size={14}/> Aadhaar Card</span>
                        {(freelancer.aadhaarMasked || freelancer.aadharVerified || freelancer.verified) ? (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10}/> Verified</span>
                        ) : (
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Pending</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2"><Briefcase size={14}/> E-Shram ID</span>
                        {freelancer.eshramId ? (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10}/> Verified</span>
                        ) : (
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Missing</span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSendOffer}
                    disabled={sending || sent}
                    className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${
                        sent ? 'bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                    }`}
                  >
                    {sending ? <Zap className="animate-spin" size={20} /> : (sent ? <CheckCircle size={20} /> : <Send size={20} />)}
                    {sending ? 'Processing...' : (sent ? 'Offer Transmitted!' : 'Send Direct Offer')}
                  </button>
                  <button 
                    onClick={handleOpenChat}
                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Mail size={18} className="text-gray-400" /> Private Chat
                  </button>
                </div>

                <div className="pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Network Presence</h4>
                  <div className="flex gap-2">
                    {freelancer.socialLinks?.linkedin && (
                      <a href={freelancer.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-[#0077b5]">
                        <Linkedin size={20} />
                      </a>
                    )}
                    {freelancer.socialLinks?.github && (
                      <a href={freelancer.socialLinks.github} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all text-[#333]">
                        <Github size={20} />
                      </a>
                    )}
                    {freelancer.website && (
                      <a href={freelancer.website} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-all text-primary-600">
                        <Globe size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FindTalent: React.FC = () => {
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minTQ, setMinTQ] = useState(0);
  const [selectedFreelancer, setSelectedFreelancer] = useState<User | null>(null);

  useEffect(() => {
    setFreelancers(api.users.getAllFreelancers());
  }, []);

  const filteredFreelancers = freelancers.filter(f => 
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (f.tqScore || 0) >= minTQ
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Top Talent</h1>
          <p className="text-gray-500 mt-2">Hire verified professionals based on their Talent Quotient (TQ) Score.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Search by skill or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                 <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Min TQ: {minTQ}</span>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={minTQ}
                   onChange={(e) => setMinTQ(parseInt(e.target.value))}
                   className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.length > 0 ? filteredFreelancers.map((freelancer) => (
            <div key={freelancer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all flex flex-col group">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <img 
                        src={freelancer.avatarUrl || `https://ui-avatars.com/api/?name=${freelancer.name}`} 
                        alt={freelancer.name} 
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform" 
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{freelancer.name}</h3>
                        <p className="text-xs text-primary-600 font-medium">{freelancer.headline || freelancer.title || 'Freelancer'}</p>
                      </div>
                   </div>
                   {freelancer.verified && <ShieldCheck className="text-primary-600" size={20} />}
                </div>

                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <div>
                     <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">TQ Score</div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-extrabold text-gray-900">{freelancer.tqScore}</span>
                        <TQBadge score={freelancer.tqScore || 0} size="sm" />
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Rating</div>
                     <div className="flex items-center justify-end gap-1 font-bold text-gray-900">
                       <Star size={14} className={`${freelancer.completedGigsCount && freelancer.completedGigsCount > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                       <span className={freelancer.completedGigsCount && freelancer.completedGigsCount > 0 ? 'text-gray-900' : 'text-gray-400'}>{freelancer.averageRating || (freelancer.completedGigsCount && freelancer.completedGigsCount > 0 ? '5.0' : '0.0')}</span>
                     </div>
                   </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {freelancer.skills?.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold uppercase tracking-tighter">
                      {skill}
                    </span>
                  ))}
                  {(freelancer.skills?.length || 0) > 4 && (
                    <span className="px-2 py-1 text-gray-400 text-[10px] font-bold">
                      +{(freelancer.skills?.length || 0) - 4} more
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 italic">
                  "{freelancer.bio || 'High performing talent ready for new challenges.'}"
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedFreelancer(freelancer)}
                  className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/10 active:scale-[0.98]"
                >
                  View Profile
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No matches found</h3>
                <p className="text-gray-500">Try adjusting your search terms or lowering the TQ requirement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Profile Modal */}
      {selectedFreelancer && (
        <ProfileModal 
          freelancer={selectedFreelancer} 
          onClose={() => setSelectedFreelancer(null)} 
        />
      )}
    </div>
  );
};

export default FindTalent;