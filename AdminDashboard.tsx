
import React, { useEffect, useState } from 'react';
import { Users, FileText, DollarSign, ShieldAlert, CheckCircle, XCircle, Activity, Search, AlertTriangle, MessageSquare, Filter, ChevronRight, Inbox, Clock, X, ArrowLeft, CreditCard, Calendar } from 'lucide-react';
import TQBadge from '../components/TQBadge';
import { Dispute, User, ChatMessage, Gig } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  viewMode?: 'overview' | 'tickets';
}

type AdminSection = 'overview' | 'users' | 'revenue' | 'gigs' | 'verification';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ viewMode = 'overview' }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allGigs, setAllGigs] = useState<Gig[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('All');
  
  // Chat Logs Modal State
  const [viewChatDispute, setViewChatDispute] = useState<Dispute | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
    const [selectedVerificationUser, setSelectedVerificationUser] = useState<User | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeGigs: 0,
    verificationQueue: 0
  });

  const timeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Just now';
      
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return "Just now";
  };

  const refreshData = () => {
    const allDisputes = api.disputes.getAll();
    setDisputes(allDisputes);

    const allUsersList = api.users.getAll();
    const sortedUsers = [...allUsersList].sort((a, b) => {
        const dateA = new Date(a.lastSeen || a.joinedAt).getTime();
        const dateB = new Date(b.lastSeen || b.joinedAt).getTime();
        return dateB - dateA;
    });
    // Filter out dummy/seed users if needed, or keep them for admin view
    const realUsers = sortedUsers.filter(u => !['admin1'].includes(u.id)); 
    setUsers(realUsers);

    const gigsList = api.gigs.getAll();
    setAllGigs(gigsList);

    const totalUsers = realUsers.length;
    const totalRevenue = gigsList
      .filter(g => g.paymentStatus === 'Paid')
      .reduce((sum, g) => sum + g.budget, 0);
    const activeGigsCount = gigsList.filter(g => g.status === 'Open' || g.status === 'In Progress').length;
    const verificationQueueCount = realUsers.filter(u => !u.verified && u.role === 'FREELANCER' && u.verificationSubmitted).length;

    setStats({
      totalUsers,
      totalRevenue,
      activeGigs: activeGigsCount,
      verificationQueue: verificationQueueCount
    });

    const recentActivities = [
        ...realUsers.map(u => ({ action: 'New User Joined', user: u.name, time: u.joinedAt })),
        ...gigsList.map(g => ({ action: 'New Gig Posted', user: g.postedBy, time: g.createdAt })),
        ...allDisputes.map(d => ({ action: 'Dispute Raised', user: `Gig: ${d.gigTitle}`, time: d.createdAt }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

    setActivities(recentActivities);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleResolve = (id: string) => {
      api.disputes.resolve(id);
      refreshData();
  };

  const handleVerifyUser = (userId: string) => {
      const updated = api.users.updateProfile(userId, {
          verified: true,
          aadharVerified: true,
          verificationSubmitted: false,
      });
      api.notifications.create({
          userId: updated.id,
          type: 'SECURITY',
          title: 'Verification approved',
          message: 'Your freelancer profile has been reviewed and approved by admin.',
          link: '/freelancer-profile'
      });
      setSelectedVerificationUser(null);
      refreshData();
      alert("User verified successfully. Trust Quotient has been recalculated based on profile quality, verification, and work history.");
  };

  const handleViewLogs = (dispute: Dispute) => {
      if (dispute.roomId) {
          const logs = api.chats.getMessages(dispute.roomId);
          setChatLogs(logs);
          setViewChatDispute(dispute);
      } else {
          alert("No linked chat room found for this issue.");
      }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDisputes = disputes.filter(d => 
    ticketFilter === 'All' ? true : d.status === ticketFilter
  );

  // Render Sub-Views
  const renderDetailView = () => {
      switch(activeSection) {
          case 'users':
              return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Users size={18} /> User Management
                          </h2>
                          <div className="relative">
                              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                              <input 
                                  type="text" 
                                  placeholder="Search users..." 
                                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                  <tr>
                                      <th className="px-6 py-3">User</th>
                                      <th className="px-6 py-3">Role</th>
                                      <th className="px-6 py-3">Joined</th>
                                      <th className="px-6 py-3">TQ Score</th>
                                      <th className="px-6 py-3">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {filteredUsers.map(user => (
                                      <tr key={user.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 flex items-center gap-3">
                                              <img src={user.avatarUrl} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                                              <div>
                                                  <p className="font-bold text-gray-900">{user.name}</p>
                                                  <p className="text-xs text-gray-500">{user.email}</p>
                                              </div>
                                          </td>
                                          <td className="px-6 py-3">
                                              <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'FREELANCER' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                  {user.role}
                                              </span>
                                          </td>
                                          <td className="px-6 py-3">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                          <td className="px-6 py-3"><TQBadge score={user.tqScore || 0} size="sm" /></td>
                                          <td className="px-6 py-3">
                                              {user.verified ? (
                                                  <span className="text-green-600 flex items-center gap-1 font-bold text-xs"><CheckCircle size={14}/> Verified</span>
                                              ) : (
                                                  <span className="text-gray-400 flex items-center gap-1 font-bold text-xs">Unverified</span>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              );
          case 'revenue':
              const paidGigs = allGigs.filter(g => g.paymentStatus === 'Paid');
              return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <DollarSign size={18} /> Revenue & Payment History
                          </h2>
                          <div className="text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                              Total Processed: ₹{stats.totalRevenue.toLocaleString()}
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                  <tr>
                                      <th className="px-6 py-3">Transaction For</th>
                                      <th className="px-6 py-3">Amount</th>
                                      <th className="px-6 py-3">Date</th>
                                      <th className="px-6 py-3">Payer</th>
                                      <th className="px-6 py-3">Payee</th>
                                      <th className="px-6 py-3">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {paidGigs.length > 0 ? paidGigs.map(gig => (
                                      <tr key={gig.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 font-medium text-gray-900">{gig.title}</td>
                                          <td className="px-6 py-3 font-bold text-gray-900">₹{gig.budget.toLocaleString()}</td>
                                          <td className="px-6 py-3">{gig.completedAt ? new Date(gig.completedAt).toLocaleDateString() : 'N/A'}</td>
                                          <td className="px-6 py-3">{gig.postedBy}</td>
                                          <td className="px-6 py-3">{gig.assignedToName || 'Unknown'}</td>
                                          <td className="px-6 py-3">
                                              <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 flex items-center w-fit gap-1">
                                                  <CheckCircle size={12} /> Settled
                                              </span>
                                          </td>
                                      </tr>
                                  )) : (
                                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payment records found.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              );
          case 'gigs':
              const activeGigsList = allGigs.filter(g => g.status === 'Open' || g.status === 'In Progress');
              return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <FileText size={18} /> Active Gigs Overview
                          </h2>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                  <tr>
                                      <th className="px-6 py-3">Gig Title</th>
                                      <th className="px-6 py-3">Budget</th>
                                      <th className="px-6 py-3">Posted By</th>
                                      <th className="px-6 py-3">Posted On</th>
                                      <th className="px-6 py-3">Status</th>
                                      <th className="px-6 py-3">Details</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {activeGigsList.length > 0 ? activeGigsList.map(gig => (
                                      <tr key={gig.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 font-medium text-gray-900">{gig.title}</td>
                                          <td className="px-6 py-3">₹{gig.budget.toLocaleString()}</td>
                                          <td className="px-6 py-3">{gig.postedBy}</td>
                                          <td className="px-6 py-3">{new Date(gig.createdAt).toLocaleDateString()}</td>
                                          <td className="px-6 py-3">
                                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                  gig.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                              }`}>
                                                  {gig.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-3 text-xs text-gray-500">
                                              {gig.assignedToName ? `Assigned to: ${gig.assignedToName}` : 'Accepting Bids'}
                                          </td>
                                      </tr>
                                  )) : (
                                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No active gigs found.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              );
          case 'verification':
              const pendingUsers = users.filter(u => !u.verified && u.role === 'FREELANCER' && u.verificationSubmitted);
              return (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <ShieldAlert size={18} /> Verification Queue
                          </h2>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                  <tr>
                                      <th className="px-6 py-3">User</th>
                                      <th className="px-6 py-3">Details</th>
                                      <th className="px-6 py-3">Submitted</th>
                                      <th className="px-6 py-3">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {pendingUsers.length > 0 ? pendingUsers.map(user => (
                                      <tr key={user.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 flex items-center gap-3">
                                              <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                              <div>
                                                  <p className="font-bold text-gray-900">{user.name}</p>
                                                  <p className="text-xs text-gray-500">{user.role}</p>
                                              </div>
                                          </td>
                                          <td className="px-6 py-3">
                                              <p className="text-xs">Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                                              <p className="text-xs">{user.email}</p>
                                          </td>
                                          <td className="px-6 py-3">
                                              <span className="text-xs bg-orange-50 px-2 py-1 rounded border border-orange-100 text-orange-700 font-bold">
                                                  {user.verificationSubmittedAt ? new Date(user.verificationSubmittedAt).toLocaleDateString() : 'Recently'}
                                              </span>
                                          </td>
                                          <td className="px-6 py-3">
                                              <div className="flex items-center gap-2">
                                                  <button 
                                                      onClick={() => setSelectedVerificationUser(user)}
                                                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors"
                                                  >
                                                      Review
                                                  </button>
                                                  <button 
                                                      onClick={() => handleVerifyUser(user.id)}
                                                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors"
                                                  >
                                                      Approve
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  )) : (
                                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No pending verifications.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
       {/* Top Header */}
       <div className="bg-gray-900 text-white pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <div className="flex items-center gap-4">
                 {activeSection !== 'overview' && (
                     <button 
                        onClick={() => setActiveSection('overview')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                     >
                         <ArrowLeft size={20} />
                     </button>
                 )}
                 <div>
                    <h1 className="text-3xl font-bold">Admin Control Center</h1>
                    <p className="text-gray-400 mt-2">
                        {viewMode === 'tickets' ? 'Manage Support Tickets & Disputes' : (activeSection === 'overview' ? 'Platform Overview & Moderation Queue' : `Viewing ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Details`)}
                    </p>
                 </div>
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          
          {viewMode === 'tickets' ? (
              /* Tickets & Issues View */
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                  <div className="px-6 py-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              <AlertTriangle className="text-red-500" /> Issues & Tickets
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                              Review reports raised by freelancers and employers.
                          </p>
                      </div>
                      <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setTicketFilter('All')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${ticketFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                              All
                          </button>
                          <button 
                            onClick={() => setTicketFilter('Open')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${ticketFilter === 'Open' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                              Open
                          </button>
                          <button 
                            onClick={() => setTicketFilter('Resolved')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${ticketFilter === 'Resolved' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                              Resolved
                          </button>
                      </div>
                  </div>

                  <div className="divide-y divide-gray-100 min-h-[400px]">
                      {filteredDisputes.length > 0 ? filteredDisputes.map((dispute) => (
                          <div key={dispute.id} className="p-6 hover:bg-gray-50 transition-colors group">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                  <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-3">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                              dispute.status === 'Open' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
                                          }`}>
                                              {dispute.status === 'Open' ? <AlertTriangle size={12} className="mr-1.5" /> : <CheckCircle size={12} className="mr-1.5" />}
                                              {dispute.status}
                                          </span>
                                          <span className="text-xs text-gray-400 font-mono font-medium">ID: {dispute.id.toUpperCase().substring(0,8)}</span>
                                          <span className="text-xs text-gray-300">•</span>
                                          <span className="text-xs text-gray-500 font-medium">{new Date(dispute.createdAt).toLocaleString()}</span>
                                      </div>
                                      <h3 className="text-lg font-bold text-gray-900 leading-tight">Issue reported regarding "{dispute.gigTitle}"</h3>
                                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm italic leading-relaxed">
                                          "{dispute.reason}"
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                                          <Users size={16} className="text-gray-400" /> Raised by <span className="font-bold text-gray-900">{dispute.raisedBy}</span>
                                      </div>
                                  </div>
                                  <div className="flex flex-row md:flex-col gap-2 min-w-[150px] justify-start">
                                      <button 
                                        onClick={() => handleViewLogs(dispute)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 text-xs transition-all shadow-sm"
                                      >
                                          <MessageSquare size={14} /> View Chat Logs
                                      </button>
                                      {dispute.status === 'Open' && (
                                          <button 
                                            onClick={() => handleResolve(dispute.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-xs transition-all shadow-md"
                                          >
                                              <CheckCircle size={14} /> Mark Resolved
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                              <Inbox size={48} className="mb-4 opacity-50" />
                              <p className="font-medium">No tickets found.</p>
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              /* Overview View */
              <>
                {/* Stats Cards - Clickable Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div 
                        onClick={() => setActiveSection('users')}
                        className={`bg-white rounded-xl shadow-lg p-6 flex items-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${activeSection === 'users' ? 'ring-2 ring-blue-500' : ''}`}
                    >
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => setActiveSection('revenue')}
                        className={`bg-white rounded-xl shadow-lg p-6 flex items-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${activeSection === 'revenue' ? 'ring-2 ring-green-500' : ''}`}
                    >
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => setActiveSection('gigs')}
                        className={`bg-white rounded-xl shadow-lg p-6 flex items-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${activeSection === 'gigs' ? 'ring-2 ring-purple-500' : ''}`}
                    >
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Gigs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeGigs.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => setActiveSection('verification')}
                        className={`bg-white rounded-xl shadow-lg p-6 flex items-center border-2 border-orange-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${activeSection === 'verification' ? 'ring-2 ring-orange-500' : ''}`}
                    >
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Verification Queue</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.verificationQueue}</p>
                        </div>
                    </div>
                </div>

                {/* Conditional Main Content */}
                {activeSection !== 'overview' ? (
                    renderDetailView()
                ) : (
                    <>
                        {/* Active Disputes Section (Preview) */}
                        {disputes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden mb-8 animate-fade-in">
                                <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                    <AlertTriangle size={18} /> Recent Disputes
                                </h2>
                                <button onClick={() => window.location.hash = '#/admin/tickets'} className="text-sm text-red-700 hover:text-red-900 font-bold flex items-center gap-1">
                                    View All <ChevronRight size={16} />
                                </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                {disputes.slice(0, 2).map((dispute) => (
                                    <div key={dispute.id} className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mb-2">
                                                    {dispute.status}
                                                </span>
                                                <h3 className="text-base font-semibold text-gray-900">Issue with: {dispute.gigTitle}</h3>
                                                <p className="text-sm text-gray-500">Raised by: <span className="font-medium text-gray-700">{dispute.raisedBy}</span> • {new Date(dispute.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mt-2 line-clamp-2">
                                            "{dispute.reason}"
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Users Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
                                <button onClick={() => setActiveSection('users')} className="text-sm text-primary-600 hover:underline font-bold">View All</button>
                            </div>
                            <div className="p-4 space-y-3">
                                {filteredUsers.slice(0, 5).length > 0 ? filteredUsers.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-gray-100" />
                                            <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                            </div>
                                        </div>
                                        <TQBadge score={user.tqScore || 0} size="sm" />
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">No users found.</div>
                                )}
                            </div>
                        </div>

                        {/* System Health / Logs */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity size={18} /> System Activity
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flow-root">
                                <ul className="-mb-8">
                                    {activities.length > 0 ? activities.map((item, idx) => (
                                        <li key={idx}>
                                        <div className="relative pb-8">
                                            {idx !== activities.length - 1 && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                                    <Activity size={14} className="text-gray-500" />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                    <p className="text-sm text-gray-500">{item.action} <span className="font-medium text-gray-900">{item.user}</span></p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time>{timeAgo(item.time)}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </li>
                                    )) : (
                                        <div className="text-center py-4 text-gray-500 text-sm">No recent system activity.</div>
                                    )}
                                </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
              </>
          )}

       </div>

       {/* Chat Logs Modal */}
       {viewChatDispute && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                   <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                       <div>
                           <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-white"/> Evidence Logs</h3>
                           <p className="text-[10px] text-gray-400">SESSION ID: {viewChatDispute.roomId || 'UNKNOWN'}</p>
                       </div>
                       <button onClick={() => setViewChatDispute(null)} className="text-gray-400 hover:text-white transition-colors">
                           <X size={20} />
                       </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                       {chatLogs.length > 0 ? chatLogs.map((msg) => (
                           <div key={msg.id} className={`flex flex-col ${msg.senderId === viewChatDispute.raisedById ? 'items-end' : 'items-start'}`}>
                               <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${msg.senderId === viewChatDispute.raisedById ? 'bg-blue-100 text-blue-900' : 'bg-white text-gray-800 border border-gray-200'}`}>
                                   <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>
                                   {msg.text}
                               </div>
                               <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleString()}</span>
                           </div>
                       )) : (
                           <div className="text-center text-gray-500 py-10 italic">No chat logs found for this session.</div>
                       )}
                   </div>
                   <div className="p-4 bg-white border-t border-gray-200 text-center">
                       <button onClick={() => setViewChatDispute(null)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors">
                           Close Review
                       </button>
                   </div>
               </div>
           </div>
       )}

       {selectedVerificationUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
                   <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                       <div>
                           <h3 className="font-bold text-lg text-gray-900">Freelancer Verification Review</h3>
                           <p className="text-xs text-gray-500 mt-1">Review submitted profile information before approving.</p>
                       </div>
                       <button onClick={() => setSelectedVerificationUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                   </div>

                   <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
                       <div className="space-y-6">
                           <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                               <div className="flex items-center gap-4">
                                   <img src={selectedVerificationUser.avatarUrl} alt={selectedVerificationUser.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
                                   <div>
                                       <h4 className="text-xl font-bold text-gray-900">{selectedVerificationUser.name}</h4>
                                       <p className="text-sm text-gray-500">{selectedVerificationUser.title || 'Freelancer'}</p>
                                       <p className="text-xs text-gray-400 mt-1">Submitted {selectedVerificationUser.verificationSubmittedAt ? new Date(selectedVerificationUser.verificationSubmittedAt).toLocaleString() : 'recently'}</p>
                                   </div>
                               </div>
                           </div>

                           <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                               <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Identity Details</h4>
                               <div className="space-y-3 text-sm">
                                   <div className="flex justify-between gap-4"><span className="text-gray-500">Aadhaar</span><span className="font-medium text-gray-900">{selectedVerificationUser.aadhaarMasked || 'Not provided'}</span></div>
                                   <div className="flex justify-between gap-4"><span className="text-gray-500">E-Shram ID</span><span className="font-medium text-gray-900">{selectedVerificationUser.eshramId || 'Not provided'}</span></div>
                                   <div className="flex justify-between gap-4"><span className="text-gray-500">PAN</span><span className="font-medium text-gray-900">{selectedVerificationUser.panNumber || 'Not provided'}</span></div>
                                   <div className="flex justify-between gap-4"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{selectedVerificationUser.phone || 'Not provided'}</span></div>
                                   <div className="flex justify-between gap-4"><span className="text-gray-500">UPI ID</span><span className="font-medium text-gray-900">{selectedVerificationUser.upiId || 'Not provided'}</span></div>
                               </div>
                           </div>
                       </div>

                       <div className="space-y-6">
                           <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                               <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Professional Information</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Headline</p><p className="font-medium text-gray-900">{selectedVerificationUser.headline || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Location</p><p className="font-medium text-gray-900">{selectedVerificationUser.location || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Years of Experience</p><p className="font-medium text-gray-900">{selectedVerificationUser.yearsExperience ?? 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Hourly Rate</p><p className="font-medium text-gray-900">{selectedVerificationUser.hourlyRate ? `₹${selectedVerificationUser.hourlyRate}/hr` : 'Not provided'}</p></div>
                                   <div className="md:col-span-2"><p className="text-xs text-gray-400 uppercase mb-1">Bio</p><p className="font-medium text-gray-900 whitespace-pre-line">{selectedVerificationUser.bio || 'Not provided'}</p></div>
                                   <div className="md:col-span-2"><p className="text-xs text-gray-400 uppercase mb-1">Skills</p><p className="font-medium text-gray-900">{selectedVerificationUser.skills?.length ? selectedVerificationUser.skills.join(', ') : 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Portfolio</p><p className="font-medium text-gray-900 break-all">{selectedVerificationUser.portfolioUrl || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Website</p><p className="font-medium text-gray-900 break-all">{selectedVerificationUser.website || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Address</p><p className="font-medium text-gray-900">{selectedVerificationUser.address || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Reference Contact</p><p className="font-medium text-gray-900">{selectedVerificationUser.localReferenceContact || 'Not provided'}</p></div>
                               </div>
                           </div>

                           <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                               <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Links & Current Trust</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Email</p><p className="font-medium text-gray-900 break-all">{selectedVerificationUser.email}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">LinkedIn</p><p className="font-medium text-gray-900 break-all">{selectedVerificationUser.socialLinks?.linkedin || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">GitHub</p><p className="font-medium text-gray-900 break-all">{selectedVerificationUser.socialLinks?.github || 'Not provided'}</p></div>
                                   <div><p className="text-xs text-gray-400 uppercase mb-1">Current TQ</p><p className="font-medium text-gray-900">{selectedVerificationUser.tqScore} ({selectedVerificationUser.tqTier})</p></div>
                               </div>
                           </div>
                       </div>
                   </div>

                   <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                       <button onClick={() => setSelectedVerificationUser(null)} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">
                           Close
                       </button>
                       <button onClick={() => handleVerifyUser(selectedVerificationUser.id)} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                           Approve Freelancer
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default AdminDashboard;
