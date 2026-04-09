
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, DollarSign, Star, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, ShieldCheck, Search, Plus, MapPin, 
  MessageSquare, User as UserIcon, Settings, Layout, Zap, 
  BarChart2, X, Calendar, Users, ArrowRight, Wallet, CreditCard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { api } from '../../services/api';
import { User, Gig, UserRole } from '../../types';
import TQBadge from '../../components/TQBadge';

interface DashboardProps {
  role: UserRole;
  viewMode?: 'overview' | 'profile' | 'gigs' | 'wallet';
}

const Dashboard: React.FC<DashboardProps> = ({ role, viewMode = 'overview' }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeGigs, setActiveGigs] = useState<Gig[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Gig | null>(null);
  const [contractFreelancer, setContractFreelancer] = useState<User | null>(null);

  // Mock Data for Charts
  const spendingData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
    { name: 'Jul', amount: 3490 },
  ];

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const allGigs = api.gigs.getAll();
      let userGigs: Gig[] = [];
      if (role === UserRole.FREELANCER) {
        // Freelancer: assigned to me or applied
        // For dashboard summary, usually "In Progress" or "Completed"
        userGigs = api.gigs.getHistory(user.id); // This returns completed, let's get active ones too
        const active = allGigs.filter(g => g.assignedTo === user.id && g.status === 'In Progress');
        setActiveGigs(active);
      } else {
        // Employer: posted by me
        const myGigs = allGigs.filter(g => g.postedById === user.id);
        setActiveGigs(myGigs);
      }
    }
  }, [role]);

  // When a contract is selected, find the freelancer
  useEffect(() => {
    if (selectedContract && selectedContract.assignedTo) {
        const freelancer = api.users.getById(selectedContract.assignedTo);
        setContractFreelancer(freelancer || null);
    } else {
        setContractFreelancer(null);
    }
  }, [selectedContract]);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {viewMode === 'overview' && `Welcome back, ${currentUser.name}`}
                        {viewMode === 'profile' && 'Company Profile'}
                        {viewMode === 'gigs' && 'My Gigs'}
                        {viewMode === 'wallet' && 'Financial Overview'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {role === UserRole.EMPLOYER ? 'Manage your projects and talent.' : 'Track your gigs and performance.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {role === UserRole.EMPLOYER && (
                        <>
                            <button 
                                onClick={() => setActiveAction('analytics')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <BarChart2 size={16} /> Analytics
                            </button>
                            <Link 
                                to="/find-talent"
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-sm"
                            >
                                <Plus size={16} /> Post New Gig
                            </Link>
                        </>
                    )}
                     {role === UserRole.FREELANCER && (
                        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">TQ Score</p>
                                <div className="text-lg font-bold text-primary-600 leading-none">{currentUser.tqScore}</div>
                            </div>
                            <div className="h-8 w-px bg-gray-100"></div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Earnings</p>
                                <div className="text-lg font-bold text-gray-900 leading-none">₹{currentUser.walletBalance?.toLocaleString() || 0}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render specific view content or default overview */}
        
        {/* Analytics Modal */}
        {activeAction === 'analytics' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
                    <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2"><BarChart2 size={20} className="text-blue-400"/> Business Analytics</h3>
                        <button onClick={() => setActiveAction(null)}><X size={20} className="text-gray-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs font-bold text-gray-500 uppercase">Total Spend</p>
                                <p className="text-2xl font-extrabold text-gray-900 mt-1">₹{spendingData.reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs font-bold text-gray-500 uppercase">Active Contracts</p>
                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{activeGigs.length}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs font-bold text-gray-500 uppercase">Avg Time-to-Hire</p>
                                <p className="text-2xl font-extrabold text-gray-900 mt-1">3 Days</p>
                            </div>
                        </div>
                        <div className="h-80 w-full bg-white p-6 rounded-xl border border-gray-200">
                             <h4 className="font-bold text-gray-900 mb-6">Spending Analysis (YTD)</h4>
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                    <RechartsTooltip />
                                    <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSpend)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Contract Details Modal */}
        {selectedContract && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2"><Briefcase size={20} className="text-green-400"/> Contract Details</h3>
                        <button onClick={() => setSelectedContract(null)}><X size={20} className="text-gray-400 hover:text-white transition-colors"/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Left: Project Details */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{selectedContract.title}</h2>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <Calendar size={12}/> Posted {new Date(selectedContract.createdAt).toLocaleDateString()}
                                                <span className="text-gray-300">|</span>
                                                <span className="text-green-600 font-bold">ID: {selectedContract.id.toUpperCase()}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                            selectedContract.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                            selectedContract.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}>
                                            {selectedContract.status}
                                        </span>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-gray-600 mb-6">
                                        <p>{selectedContract.description}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Budget</p>
                                            <p className="text-lg font-bold text-gray-900">₹{selectedContract.budget.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</p>
                                            <p className={`text-lg font-bold ${selectedContract.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                                {selectedContract.paymentStatus || 'Unpaid'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle size={18} className="text-primary-600"/> Project Milestones
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedContract.milestones && selectedContract.milestones.length > 0 ? selectedContract.milestones.map((ms) => (
                                            <div key={ms.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{ms.title}</p>
                                                    <p className="text-xs text-gray-500">Due: {new Date(ms.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm text-gray-900">₹{ms.amount.toLocaleString()}</p>
                                                    <span className={`text-[10px] font-bold uppercase ${
                                                        ms.status === 'Completed' ? 'text-green-600' : 
                                                        ms.status === 'In Review' ? 'text-orange-500' : 'text-gray-400'
                                                    }`}>
                                                        {ms.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-500 italic">No specific milestones defined.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Freelancer Details */}
                            <div className="md:col-span-1 space-y-6">
                                {contractFreelancer ? (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                                        <div className="relative mb-4">
                                            <img 
                                                src={contractFreelancer.avatarUrl} 
                                                className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md object-cover" 
                                                alt={contractFreelancer.name}
                                            />
                                            {contractFreelancer.verified && (
                                                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
                                                    <ShieldCheck size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{contractFreelancer.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{contractFreelancer.headline || contractFreelancer.title}</p>
                                        
                                        <div className="mb-6">
                                            <TQBadge score={contractFreelancer.tqScore} size="md" />
                                        </div>

                                        <div className="w-full space-y-4 text-left border-t border-gray-100 pt-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Contact</p>
                                                <p className="text-sm text-gray-700 truncate">{contractFreelancer.email}</p>
                                                <p className="text-sm text-gray-700">{contractFreelancer.phone || 'Phone hidden'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                                                <p className="text-sm text-gray-700">{contractFreelancer.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {contractFreelancer.skills?.map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded font-bold">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate('/chats', { state: { participantId: contractFreelancer.id, participantName: contractFreelancer.name, participantRole: UserRole.FREELANCER } })}
                                            className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95"
                                        >
                                            <MessageSquare size={16} /> Message Freelancer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center">
                                        <Users size={32} className="mx-auto text-gray-400 mb-2"/>
                                        <p className="text-gray-500 text-sm">Freelancer details unavailable.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {viewMode === 'overview' && (
            <div className="space-y-8 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Gigs</p>
                            <p className="text-2xl font-bold text-gray-900">{activeGigs.filter(g => g.status === 'In Progress').length}</p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{api.gigs.getHistory(currentUser.id).length}</p>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{currentUser.averageRating || '5.0'}</p>
                        </div>
                     </div>
                </div>

                {/* Active Gigs List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Active Contracts</h3>
                        <Link to={role === UserRole.EMPLOYER ? '/active-gigs' : '/my-projects'} className="text-sm text-primary-600 font-bold hover:underline">View All</Link>
                    </div>
                    {activeGigs.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {activeGigs.map(gig => (
                                <div key={gig.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div onClick={() => setSelectedContract(gig)} className="cursor-pointer group">
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{gig.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {role === UserRole.EMPLOYER ? `Assigned to: ${gig.assignedToName || 'Pending'}` : `Posted by: ${gig.postedBy}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">₹{gig.budget.toLocaleString()}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {gig.status}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Quick Actions */}
                                    <div className="mt-4 flex gap-3">
                                        <button 
                                            onClick={() => setSelectedContract(gig)}
                                            className="text-xs font-bold text-gray-600 hover:text-primary-600 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-200 transition-all"
                                        >
                                            <Briefcase size={12} /> View Details
                                        </button>
                                        <button 
                                            onClick={() => navigate('/chats', { state: { 
                                                participantId: role === UserRole.EMPLOYER ? gig.assignedTo : gig.postedById, 
                                                participantName: role === UserRole.EMPLOYER ? gig.assignedToName : gig.postedBy, 
                                                participantRole: role === UserRole.EMPLOYER ? UserRole.FREELANCER : UserRole.EMPLOYER 
                                            }})}
                                            className="text-xs font-bold text-gray-600 hover:text-primary-600 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-200 transition-all"
                                        >
                                            <MessageSquare size={12} /> Chat
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Briefcase size={32} className="mx-auto text-gray-300 mb-2" />
                            <p>No active contracts at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* View Mode: Wallet */}
        {viewMode === 'wallet' && (
             <div className="space-y-8 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
                         <p className="text-gray-400 font-medium uppercase tracking-wider text-sm">Total Balance</p>
                         <h2 className="text-4xl font-bold mt-2 mb-6">₹{currentUser.walletBalance?.toLocaleString() || 0}</h2>
                         <div className="flex gap-4">
                             <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold text-sm transition-colors shadow-lg">Add Funds</button>
                             <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm transition-colors">Withdraw</button>
                         </div>
                     </div>
                     <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                         <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Methods</h3>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-6 bg-gray-800 rounded"></div>
                                     <span className="font-mono text-sm text-gray-700">•••• 4242</span>
                                 </div>
                                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Primary</span>
                             </div>
                             <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-primary-500 hover:text-primary-600 transition-colors">
                                 + Add New Method
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                         <h3 className="font-bold text-gray-900">Transaction History</h3>
                     </div>
                     <div className="p-8 text-center text-gray-500 italic">
                         No recent transactions found.
                     </div>
                 </div>
             </div>
        )}
        
        {/* View Mode: Gigs (Employer) */}
        {viewMode === 'gigs' && role === UserRole.EMPLOYER && (
             <div className="animate-fade-in">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-900">All Posted Gigs</h2>
                     <Link to="/find-talent" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700">Post New Gig</Link>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     {activeGigs.length > 0 ? (
                         <div className="divide-y divide-gray-100">
                             {activeGigs.map(gig => (
                                 <div key={gig.id} className="p-6 hover:bg-gray-50 transition-colors">
                                     <div className="flex justify-between items-center">
                                         <div>
                                             <h4 className="text-lg font-bold text-gray-900">{gig.title}</h4>
                                             <p className="text-sm text-gray-500">Posted on {new Date(gig.createdAt).toLocaleDateString()}</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-lg font-bold text-gray-900">₹{gig.budget.toLocaleString()}</p>
                                             <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                 gig.status === 'Open' ? 'bg-green-100 text-green-700' : 
                                                 gig.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                             }`}>{gig.status}</span>
                                         </div>
                                     </div>
                                     <div className="mt-4 flex gap-3">
                                         <button onClick={() => setSelectedContract(gig)} className="text-sm text-gray-600 hover:text-primary-600 font-bold underline">Manage</button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="p-12 text-center text-gray-500">No gigs found.</div>
                     )}
                 </div>
             </div>
        )}
        
        {/* View Mode: Profile (Company) */}
        {viewMode === 'profile' && role === UserRole.EMPLOYER && (
             <div className="animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                 <div className="flex items-start gap-6">
                     <img src={currentUser.avatarUrl} alt="Company Logo" className="w-24 h-24 rounded-2xl border-2 border-gray-100 shadow-md" />
                     <div>
                         <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                         <p className="text-gray-500">{currentUser.title || 'Company Account'}</p>
                         <div className="mt-4 flex gap-4">
                             <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                 <p className="text-xs text-gray-400 font-bold uppercase">Trust Score</p>
                                 <p className="text-xl font-bold text-green-600">{currentUser.corporateTrustScore || 85}/100</p>
                             </div>
                             <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                 <p className="text-xs text-gray-400 font-bold uppercase">Verified</p>
                                 <p className="text-xl font-bold text-blue-600">{currentUser.verified ? 'Yes' : 'Pending'}</p>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-4">Company Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                             <input type="text" disabled value={currentUser.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Industry</label>
                             <input type="text" disabled value={currentUser.industry || 'Technology'} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Email</label>
                             <input type="text" disabled value={currentUser.email} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                             <input type="text" disabled value={currentUser.location || 'India'} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700" />
                         </div>
                     </div>
                     <div className="mt-6 flex justify-end">
                         <button className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">Edit Profile</button>
                     </div>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
