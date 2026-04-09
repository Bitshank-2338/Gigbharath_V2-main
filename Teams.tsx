
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_TEAMS } from '../services/mockData';
import { Users, Star, Trophy, ArrowRight, PlusCircle, UserPlus, Search, Sparkles, MapPin, Lock, Globe, MessageCircle, ShieldCheck, Zap, Cpu, X, Copy, Check, Share2, Linkedin, Link as LinkIcon, AlertCircle, Briefcase, Settings, Sliders, ArrowLeft, Trash2, Save, AlertTriangle, Unlock, Send, Paperclip, MoreVertical, Layout, Clock, IndianRupee } from 'lucide-react';
import { api } from '../services/api';
import TQBadge from '../components/TQBadge';
import { User, Team, Gig } from '../types';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

const Teams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'dashboard' | 'settings' | 'projects' | 'project-details'>('join');
  const [currentUser] = useState(api.auth.getCurrentUser());
  const [isPrivate, setIsPrivate] = useState(false);
  const [mySquad, setMySquad] = useState<Team | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Gig[]>([]);
  const [selectedProject, setSelectedProject] = useState<Gig | null>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Create Squad Form State
  const [squadName, setSquadName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [invitedMembers, setInvitedMembers] = useState<User[]>([]);
  
  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // AI Matchmaker State
  const [isAiActive, setIsAiActive] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<(User & { matchScore: number })[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
      // Check if user already has a squad
      if(currentUser) {
          const squad = api.teams.getMySquad(currentUser.id);
          if (squad) {
              setMySquad(squad);
              if (activeTab === 'join') setActiveTab('dashboard'); // Redirect to dashboard if found
              
              // Only sync form state if we are in dashboard (to keep edit form in sync)
              if (activeTab === 'dashboard' || activeTab === 'settings' || activeTab === 'projects') {
                  setSquadName(squad.name);
                  setSpecialization(squad.specialization || '');
                  setLocation(squad.location || '');
                  setIsPrivate(squad.isPrivate || false);
              }

              // Fetch team projects
              const allGigs = api.gigs.getAll();
              const teamGigs = allGigs.filter(g => g.assignedTo === squad.id && g.status === 'In Progress');
              setOngoingProjects(teamGigs);
          }
      }
      setTeams(api.teams.getAll());
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (activeTab === 'project-details' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const toggleAiMatchmaker = () => {
      const newState = !isAiActive;
      setIsAiActive(newState);
      if (newState && (specialization || mySquad?.specialization)) {
          setIsAiLoading(true);
          // Simulate AI latency
          setTimeout(() => {
              const spec = specialization || mySquad?.specialization || '';
              const loc = location || mySquad?.location || '';
              const teamIds = mySquad ? mySquad.memberIds : [currentUser?.id || ''];
              // Add invited members to exclusion list if in creation mode
              if (!mySquad) invitedMembers.forEach(m => teamIds.push(m.id));

              const recs = api.ai.getMatchmakingRecommendations(spec, loc, teamIds);
              setAiRecommendations(recs);
              setIsAiLoading(false);
          }, 1500);
      }
  };

  const handleOpenInvite = () => {
    setSearchQuery('');
    setSearchResult(null);
    setSearchError('');
    setIsInviteModalOpen(true);
  };

  const handleVerifyUser = () => {
    if (!searchQuery.includes('#')) {
        setSearchError('Invalid format. Use Username#Tag (e.g. Arjun#BHARAT01)');
        return;
    }
    
    setIsVerifying(true);
    setSearchError('');
    setSearchResult(null);

    // Simulate Network Delay
    setTimeout(() => {
        const foundUser = api.users.findByUniqueId(searchQuery);
        if (foundUser) {
            // Prevent inviting self or duplicates
            const currentIds = mySquad ? mySquad.memberIds : [currentUser?.id || ''];
            if (!mySquad) invitedMembers.forEach(m => currentIds.push(m.id));

            if (currentIds.includes(foundUser.id)) {
                 setSearchError("User is already in the squad.");
            } else {
                setSearchResult(foundUser);
            }
        } else {
            setSearchError("User not found. Check the ID and try again.");
        }
        setIsVerifying(false);
    }, 1000);
  };

  const handleAddMember = (user: User) => {
    if (mySquad) {
        // In dashboard mode, this would invite them. For now we simulate adding
        alert(`Invitation sent to ${user.name}!`);
        setIsInviteModalOpen(false);
    } else {
        // In creation mode
        setInvitedMembers([...invitedMembers, user]);
        setIsInviteModalOpen(false);
    }
    // Reset Search
    setSearchQuery('');
    setSearchResult(null);
  };

  const handleInitializeSquad = () => {
      if(!squadName || !specialization) {
          alert("Please fill in Squad Name and Specialization");
          return;
      }
      
      const newTeam = api.teams.create({
          name: squadName,
          specialization,
          location,
          invitedMembers
      });
      
      setMySquad(newTeam);
      setActiveTab('dashboard');
  };

  const handleCopyLink = () => {
    const mockLink = `https://gigsbharat.com/join/${Math.random().toString(36).substr(2, 8)}`;
    navigator.clipboard.writeText(mockLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const handleOpenProject = (project: Gig) => {
    setSelectedProject(project);
    setActiveTab('project-details');
    // Load mock chat history
    setChatMessages([
        {
            id: '1',
            senderId: 'client-1',
            senderName: project.postedBy,
            senderAvatar: `https://ui-avatars.com/api/?name=${project.postedBy}&background=random`,
            text: `Hi ${mySquad?.name}, excited to get started on this project!`,
            timestamp: '09:00 AM',
            isMe: false
        },
        {
            id: '2',
            senderId: currentUser?.id || 'me',
            senderName: currentUser?.name || 'Me',
            senderAvatar: currentUser?.avatarUrl || '',
            text: 'Hello! Our squad is ready. We have reviewed the requirements.',
            timestamp: '09:15 AM',
            isMe: true
        }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
        id: Date.now().toString(),
        senderId: currentUser?.id || 'me',
        senderName: currentUser?.name || 'Me',
        senderAvatar: currentUser?.avatarUrl || '',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
    };

    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
  };

  // --- Settings View State & Handlers ---
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const handleUpdateSquad = () => {
      if (!mySquad) return;
      try {
          const updated = api.teams.update(mySquad.id, {
              name: squadName,
              specialization,
              location,
              isPrivate
          });
          setMySquad(updated);
          alert("Squad settings updated successfully!");
      } catch (e) {
          alert("Failed to update squad.");
      }
  };

  const handleRemoveMember = () => {
      if (!mySquad || !memberToRemove) return;
      try {
          const updated = api.teams.removeMember(mySquad.id, memberToRemove);
          setMySquad(updated);
          setMemberToRemove(null);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDeleteSquad = () => {
      if (!mySquad || deleteConfirmation !== 'DELETE') return;
      api.teams.delete(mySquad.id);
      setMySquad(undefined);
      setActiveTab('join');
      setDeleteConfirmation('');
  };

  const renderSettings = () => {
      if (!mySquad) return null;
      const isOnGig = mySquad.status === 'On_Gig';

      return (
          <div className="max-w-4xl mx-auto animate-fade-in pb-12">
              <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <ArrowLeft size={24} className="text-gray-600" />
                  </button>
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900">Squad Settings</h1>
                      <p className="text-gray-500 text-sm">Manage roster, privacy and danger zone</p>
                  </div>
                  {isOnGig && (
                      <div className="ml-auto flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg border border-orange-200 text-sm font-bold animate-pulse">
                          <Lock size={16} /> Active Gig Lock
                      </div>
                  )}
              </div>

              {/* General Info */}
              <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6 mb-8 border border-gray-800">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
                      <Settings size={20} className="text-orange-500" />
                      <h3 className="font-bold">General Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Squad Name</label>
                          <input 
                              type="text" 
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                              value={squadName}
                              onChange={(e) => setSquadName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Specialization</label>
                          <input 
                              type="text" 
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                              value={specialization}
                              onChange={(e) => setSpecialization(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Base Location</label>
                          <input 
                              type="text" 
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                          />
                      </div>
                      
                      {/* Privacy Toggle */}
                      <div className="col-span-2 flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                              {isPrivate ? <Lock className="text-orange-500" size={24} /> : <Globe className="text-green-400" size={24} />}
                              <div>
                                  <p className="font-bold text-sm">{isPrivate ? 'Private Squad' : 'Public Squad'}</p>
                                  <p className="text-xs text-gray-400">{isPrivate ? 'Only invitees can join via ID#Code' : 'Visible in squad marketplace'}</p>
                              </div>
                          </div>
                          <button 
                              onClick={() => setIsPrivate(!isPrivate)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-orange-500' : 'bg-gray-600'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>
                  </div>
                  
                  <div className="mt-6 text-right">
                      <button 
                          onClick={handleUpdateSquad}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                      >
                          <Save size={16} /> Save Changes
                      </button>
                  </div>
              </div>

              {/* Member Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Users size={20} className="text-gray-500" /> Roster Management
                  </h3>
                  <div className="space-y-4">
                      {mySquad.members?.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                  <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full" />
                                  <div>
                                      <p className="font-bold text-sm text-gray-900">{member.name} {member.id === currentUser?.id && '(You)'}</p>
                                      <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                                  </div>
                              </div>
                              {member.role !== 'Leader' && (
                                  <button 
                                      onClick={() => setMemberToRemove(member.id)}
                                      disabled={isOnGig}
                                      className={`p-2 rounded-lg transition-colors ${isOnGig ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                      title={isOnGig ? 'Cannot remove members during active gig' : 'Remove Member'}
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Danger Zone */}
              <div className="border-2 border-red-100 bg-red-50/50 rounded-xl p-6">
                  <h3 className="text-red-700 font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} /> Danger Zone
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                      Once you delete a squad, there is no going back. Please be certain.
                  </p>
                  
                  {isOnGig ? (
                      <div className="bg-white p-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                          <Lock size={16} /> Squad Deletion Disabled: Active Gig in Progress
                      </div>
                  ) : (
                      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                          <div className="w-full sm:w-auto flex-grow max-w-md">
                              <label className="block text-xs font-bold text-red-400 uppercase mb-1">Type DELETE to confirm</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-red-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                  placeholder="DELETE"
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                              />
                          </div>
                          <button 
                              onClick={handleDeleteSquad}
                              disabled={deleteConfirmation !== 'DELETE'}
                              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
                          >
                              Delete Squad
                          </button>
                      </div>
                  )}
              </div>

              {/* Remove Member Confirmation Modal */}
              {memberToRemove && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in-up">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                              <AlertTriangle size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Remove Member?</h3>
                          <p className="text-sm text-center text-gray-500 mb-6">
                              Are you sure? Removing a member will notify them and may significantly affect your Squad Synergy Score.
                          </p>
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => setMemberToRemove(null)}
                                  className="flex-1 py-2 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                  Cancel
                              </button>
                              <button 
                                  onClick={handleRemoveMember}
                                  className="flex-1 py-2 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                              >
                                  Remove
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderDashboard = () => {
      if (!mySquad) return null;

      // Calculate empty slots
      const members = mySquad.members || [];
      const emptySlots = 4 - members.length;

      return (
          <div className="max-w-6xl mx-auto animate-fade-in">
              {/* Dashboard Header */}
              <div className="bg-gray-900 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Cpu size={120} />
                  </div>
                  <div className="relative z-10">
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <h2 className="text-3xl font-bold">{mySquad.name}</h2>
                                  {mySquad.status === 'On_Gig' ? (
                                      <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono px-2 py-1 rounded flex items-center gap-1">
                                          <Lock size={10} /> ON GIG
                                      </span>
                                  ) : (
                                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-mono px-2 py-1 rounded">
                                          ACTIVE
                                      </span>
                                  )}
                              </div>
                              <p className="text-gray-400 flex items-center gap-2">
                                  <Briefcase size={16} /> {mySquad.specialization}
                                  <span className="mx-2">•</span>
                                  <MapPin size={16} /> {mySquad.location}
                              </p>
                          </div>
                          <div className="text-right">
                               <div className="text-4xl font-bold text-orange-400">{mySquad.synergyScore}%</div>
                               <div className="text-sm text-gray-500 uppercase tracking-wider">Synergy Score</div>
                          </div>
                      </div>
                      
                      <div className="mt-8 flex gap-4">
                          <button 
                              onClick={() => setActiveTab('settings')}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                          >
                              <Settings size={16} /> Squad Settings
                          </button>
                          <button 
                             onClick={toggleAiMatchmaker}
                             className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border transition-all ${isAiActive ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-800 border-gray-700 text-purple-400 hover:bg-gray-700'}`}
                          >
                              <Sparkles size={16} /> {isAiActive ? 'Matchmaker Active' : 'Find Members with AI'}
                          </button>
                      </div>
                  </div>
              </div>

              {/* AI Recommendations Section */}
              {isAiActive && (
                  <div className="mb-8 animate-fade-in-up">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Sparkles className="text-purple-600" size={20} /> Recommended for You
                          </h3>
                          <span className="text-xs text-gray-500">Based on Skill Gap & Location</span>
                      </div>
                      
                      {isAiLoading ? (
                          <div className="flex justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                      ) : (
                          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                              {aiRecommendations.length > 0 ? aiRecommendations.map(rec => (
                                  <div key={rec.id} className="min-w-[280px] bg-white rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                                      <div className="flex items-center gap-3 mb-3">
                                          <img src={rec.avatarUrl} alt={rec.name} className="w-12 h-12 rounded-full border border-gray-200" />
                                          <div>
                                              <p className="font-bold text-gray-900 text-sm">{rec.name}</p>
                                              <p className="text-xs text-gray-500">{rec.userTag}</p>
                                          </div>
                                          <div className="ml-auto text-center">
                                              <span className="block text-lg font-bold text-green-600">{rec.matchScore}%</span>
                                              <span className="text-[10px] text-gray-400">Match</span>
                                          </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mb-3">
                                          {rec.skills.slice(0, 3).map(skill => (
                                              <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill}</span>
                                          ))}
                                      </div>
                                      <button 
                                        onClick={() => handleAddMember(rec)}
                                        className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 py-2 rounded-lg text-sm font-bold transition-colors"
                                      >
                                          Invite to Squad
                                      </button>
                                  </div>
                              )) : (
                                  <div className="w-full text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                      No perfect matches found nearby. Try expanding criteria.
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              )}

              {/* Members Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Users size={20} className="text-gray-500" /> Squad Roster
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {members.map(member => (
                          <div key={member.id} className="bg-white border rounded-xl p-4 flex flex-col items-center text-center relative group hover:border-blue-200 transition-colors">
                              {member.role === 'Leader' && (
                                  <div className="absolute top-2 right-2 text-orange-500">
                                      <Star size={16} fill="currentColor" />
                                  </div>
                              )}
                              <img src={member.avatarUrl} alt={member.name} className="w-20 h-20 rounded-full border-4 border-gray-50 mb-3" />
                              <h4 className="font-bold text-gray-900">{member.name}</h4>
                              <p className="text-xs text-gray-500 mb-3">{member.role}</p>
                              {member.verified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                                      <ShieldCheck size={10} /> Verified
                                  </span>
                              )}
                          </div>
                      ))}

                      {/* Empty Slots */}
                      {[...Array(emptySlots)].map((_, i) => (
                          <div 
                              key={`empty-${i}`} 
                              onClick={handleOpenInvite}
                              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-primary-400 transition-all group min-h-[200px]"
                          >
                              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <PlusCircle size={24} className="text-gray-400 group-hover:text-primary-500" />
                              </div>
                              <h4 className="font-bold text-gray-500 group-hover:text-primary-600">Invite Member</h4>
                              <p className="text-xs text-gray-400">Empty Slot</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderJoinTab = () => {
    // Only show join tab content if we are not in dashboard mode
    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 opacity-50 blur-xl"></div>
                    <div className="bg-white p-6 rounded-full shadow-xl relative z-10 border border-blue-50">
                        <Trophy size={64} className="text-blue-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-100 p-2 rounded-full border border-white shadow-sm z-20">
                        <MapPin size={24} className="text-green-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No squads are active in your area yet</h2>
                <p className="text-gray-500 mb-8 max-w-md">Be the pioneer! Create the first specialized squad in your region and attract high-value enterprise gigs.</p>
                <button 
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-700 hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1"
                >
                    <PlusCircle size={20} /> Start a Squad
                </button>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
                <div key={team.id} className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-xl border border-gray-800 hover:border-gray-700 transition-all group relative">
                    {/* Dark Tech Card Header */}
                    <div className="p-5 border-b border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Cpu size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{team.name}</h3>
                                {team.synergyScore && (
                                    <div className="flex items-center gap-1 bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded border border-gray-700 text-xs font-mono text-green-400">
                                        <Zap size={12} fill="currentColor" /> {team.synergyScore}% Syn
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 font-medium flex items-center gap-1">
                                {team.specialization || 'General Squad'}
                            </p>
                        </div>
                    </div>

                    {/* Members Grid (Bento Style) */}
                    <div className="p-5">
                         <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider mb-3">
                             <span>Squad Roster</span>
                             <span>{team.members?.length || 0}/4 Active</span>
                         </div>
                         
                         <div className="space-y-3">
                             {/* Leader Slot */}
                             {team.members?.filter(m => m.role === 'Leader').map(leader => (
                                 <div key={leader.id} className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg border border-orange-500/30">
                                     <div className="relative">
                                         <img src={leader.avatarUrl} alt={leader.name} className="w-10 h-10 rounded-full border-2 border-orange-500" />
                                         <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700">
                                             <Star size={10} className="text-orange-500" fill="currentColor" />
                                         </div>
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-orange-100">{leader.name}</p>
                                         <p className="text-[10px] text-orange-400 uppercase tracking-wide">Squad Leader</p>
                                     </div>
                                     {leader.verified && <ShieldCheck size={14} className="ml-auto text-blue-400" />}
                                 </div>
                             ))}

                             {/* Members Slots */}
                             <div className="flex -space-x-2 pl-2">
                                 {team.members?.filter(m => m.role === 'Member').map((member, i) => (
                                     <img 
                                        key={i} 
                                        src={member.avatarUrl} 
                                        alt={member.name} 
                                        className="w-8 h-8 rounded-full border-2 border-gray-900 ring-2 ring-blue-500/20" 
                                        title={member.name}
                                    />
                                 ))}
                                 {[...Array(Math.max(0, 3 - (team.members?.filter(m => m.role === 'Member').length || 0)))].map((_, i) => (
                                     <div key={`empty-${i}`} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-700 bg-gray-800/50 flex items-center justify-center text-gray-600">
                                         <PlusCircle size={12} />
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-gray-950/50 border-t border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} /> {team.location || 'Remote'}
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                                <MessageCircle size={16} />
                            </button>
                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderCreateTab = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="text-orange-400" size={20} /> Squad Assembly
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Form your elite team to unlock enterprise projects.</p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">AI Synergy Check</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-3/4 animate-pulse"></div>
                                </div>
                                <span className="text-xs font-bold text-green-400">Good</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-8">
                {/* Squad Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2">
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Squad Name</label>
                         <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                            placeholder="e.g. The Pixel Architects"
                            value={squadName}
                            onChange={e => setSquadName(e.target.value)}
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Specialization</label>
                         <div className="relative">
                            <Briefcase size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. MERN Stack Dev"
                                value={specialization}
                                onChange={e => setSpecialization(e.target.value)}
                            />
                         </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Base Location</label>
                         <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Bangalore (or Remote)"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                         </div>
                    </div>
                </div>

                {/* Member Grid */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex justify-between">
                        <span>Squad Formation ({invitedMembers.length + 1}/4)</span>
                        <button onClick={toggleAiMatchmaker} className="text-primary-600 cursor-pointer hover:underline text-[10px] flex items-center gap-1 font-bold">
                            <Sparkles size={10} /> {isAiActive ? 'AI Matchmaker Active' : 'Enable AI Matchmaker'}
                        </button>
                    </label>

                    {/* AI Recommendations inside Create Flow */}
                    {isAiActive && (
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                             <h4 className="text-xs font-bold text-purple-700 uppercase mb-3 flex items-center gap-2"><Sparkles size={12}/> AI Candidates for {specialization || 'your squad'}</h4>
                             {isAiLoading ? (
                                 <div className="text-center py-4 text-purple-500 text-xs">Scanning candidate database...</div>
                             ) : (
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                                    {aiRecommendations.map(rec => (
                                        <div key={rec.id} className="min-w-[150px] bg-white p-3 rounded-lg border border-purple-200 shadow-sm flex flex-col items-center">
                                            <img src={rec.avatarUrl} className="w-10 h-10 rounded-full mb-2" />
                                            <p className="text-xs font-bold text-center truncate w-full">{rec.name}</p>
                                            <p className="text-[10px] text-green-600 font-bold mb-2">{rec.matchScore}% Match</p>
                                            <button onClick={() => handleAddMember(rec)} className="w-full bg-purple-600 text-white text-[10px] py-1 rounded">Add</button>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Slot 1: Leader (You) */}
                        <div className="aspect-square bg-orange-50 border-2 border-orange-200 rounded-xl flex flex-col items-center justify-center p-2 relative">
                            <div className="absolute top-2 right-2">
                                <Star size={14} className="text-orange-500 fill-orange-500" />
                            </div>
                            <img 
                                src={currentUser?.avatarUrl || "https://ui-avatars.com/api/?name=User"} 
                                alt="You" 
                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm mb-2"
                            />
                            <p className="text-xs font-bold text-gray-900 truncate w-full text-center">{currentUser?.name?.split(' ')[0]}</p>
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded font-bold mt-1">LEADER</span>
                        </div>

                        {/* Slots 2, 3, 4: Invited or Empty */}
                        {[0, 1, 2].map((idx) => {
                            const member = invitedMembers[idx];
                            if (member) {
                                return (
                                    <div key={member.id} className="aspect-square bg-white border-2 border-blue-200 rounded-xl flex flex-col items-center justify-center p-2 relative shadow-sm">
                                        <div className="absolute top-2 right-2">
                                            <button 
                                                onClick={() => setInvitedMembers(invitedMembers.filter(m => m.id !== member.id))}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <img 
                                            src={member.avatarUrl} 
                                            alt={member.name} 
                                            className="w-12 h-12 rounded-full border-2 border-blue-100 shadow-sm mb-2"
                                        />
                                        <p className="text-xs font-bold text-gray-900 truncate w-full text-center">{member.name?.split(' ')[0]}</p>
                                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold mt-1">MEMBER</span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div 
                                        key={`empty-${idx}`} 
                                        onClick={handleOpenInvite}
                                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-2 hover:bg-gray-100 hover:border-primary-300 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <PlusCircle size={20} className="text-gray-400 group-hover:text-primary-500" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 group-hover:text-primary-600">Invite</p>
                                        <p className="text-[10px] text-gray-400">Empty Slot</p>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 w-full md:w-auto bg-gray-50 p-2 rounded-lg">
                        <button 
                            onClick={() => setIsPrivate(false)}
                            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isPrivate ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Globe size={14} className="inline mr-1" /> Public
                        </button>
                        <button 
                            onClick={() => setIsPrivate(true)}
                            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isPrivate ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Lock size={14} className="inline mr-1" /> Private
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleInitializeSquad}
                        className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <Cpu size={18} /> Initialize Squad
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Layout className="text-primary-600" /> Squad Projects
            </h2>
            <p className="text-gray-500">Ongoing enterprise contracts for {mySquad?.name}</p>
        </div>

        {ongoingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ongoingProjects.map((project) => (
                    <div 
                        key={project.id} 
                        onClick={() => handleOpenProject(project)}
                        className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all cursor-pointer group flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{project.title}</h3>
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 uppercase tracking-widest">
                                In Progress
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow">{project.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Client</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{project.postedBy}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Budget</p>
                                <p className="text-sm font-bold text-primary-600 flex items-center justify-end gap-1">
                                    <IndianRupee size={12} /> {project.budget.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Deadline</p>
                                <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                    <Clock size={12} className="text-gray-400" /> {new Date(project.deadline).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right flex items-end justify-end">
                                <span className="text-xs font-bold text-primary-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Project <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Briefcase size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg">No Ongoing Projects</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Your squad's active contracts and collaborative projects will appear here once you are hired for a gig.</p>
                <button onClick={() => setActiveTab('join')} className="mt-6 text-primary-600 font-bold hover:underline">Browse Gig Marketplace</button>
            </div>
        )}
    </div>
  );

  const renderProjectDetails = () => {
      if (!selectedProject) return null;

      return (
          <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6 animate-fade-in overflow-hidden">
              {/* Sidebar: Project Info */}
              <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-bold transition-colors mb-2"
                  >
                      <ArrowLeft size={16} /> Back to Projects
                  </button>
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-widest inline-block mb-4">
                          Ongoing Project
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedProject.title}</h2>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{selectedProject.description}</p>
                      
                      <div className="space-y-4 pt-6 border-t border-gray-50">
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 font-bold uppercase">Budget</span>
                              <span className="text-sm font-bold text-primary-600">₹{selectedProject.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 font-bold uppercase">Deadline</span>
                              <span className="text-sm font-bold text-gray-900">{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 font-bold uppercase">Status</span>
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Active Development</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Client Representative</h3>
                      <div className="flex items-center gap-3">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${selectedProject.postedBy}&background=random`} 
                            className="w-10 h-10 rounded-full border border-gray-100" 
                          />
                          <div>
                              <p className="text-sm font-bold text-gray-900">{selectedProject.postedBy}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Product Manager</p>
                          </div>
                          <div className="ml-auto">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main: Chat in My Project */}
              <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                              <MessageCircle size={20} />
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900">Project Chat</h3>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">End-to-End Encrypted</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"><Search size={18} /></button>
                          <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                      </div>
                  </div>

                  {/* Message Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9fa] scroll-smooth">
                      {chatMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                          >
                              <div className={`flex gap-3 max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                  {!msg.isMe && (
                                    <img src={msg.senderAvatar} className="w-8 h-8 rounded-full border border-white shadow-sm mt-1 flex-shrink-0" />
                                  )}
                                  <div>
                                      {!msg.isMe && (
                                          <p className="text-[10px] font-bold text-gray-400 ml-1 mb-1">{msg.senderName}</p>
                                      )}
                                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                                          msg.isMe 
                                          ? 'bg-primary-600 text-white rounded-tr-none' 
                                          : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                      }`}>
                                          {msg.text}
                                      </div>
                                      <p className={`text-[9px] mt-1 text-gray-400 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                                          {msg.timestamp} {msg.isMe && '• Sent'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                      <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 px-3 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 transition-all">
                          <button type="button" className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                              <Paperclip size={20} />
                          </button>
                          <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
                            placeholder="Type a message to your client or squad..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                          />
                          <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2.5 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center"
                          >
                              <Send size={18} />
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-bold text-gray-900">Specialized Teams</h1>
              <p className="text-gray-500 mt-2">Hire pre-vetted squads or form your own elite unit.</p>
           </div>
           
           {/* Tab Switcher */}
           <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex overflow-x-auto hide-scrollbar">
                <button 
                    onClick={() => setActiveTab('join')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'join' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <UserPlus size={16} /> Browse Openings
                </button>
                {/* Dynamically show "Create" or "My Squad" */}
                {mySquad ? (
                    <>
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' || activeTab === 'settings' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Cpu size={16} /> My Squad
                        </button>
                        <button 
                            onClick={() => setActiveTab('projects')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'projects' || activeTab === 'project-details' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Layout size={16} /> My Projects
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'create' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <PlusCircle size={16} /> Create a Squad
                    </button>
                )}
           </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
            {activeTab === 'join' ? renderJoinTab() : (
                activeTab === 'dashboard' ? renderDashboard() : (
                    activeTab === 'settings' ? renderSettings() : (
                        activeTab === 'projects' ? renderProjectsTab() : (
                            activeTab === 'project-details' ? renderProjectDetails() : renderCreateTab()
                        )
                    )
                )
            )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
              {/* Glassmorphism Backdrop */}
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsInviteModalOpen(false)}></div>
              
              <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0 pointer-events-none">
                  <div className="pointer-events-auto inline-block align-bottom bg-gray-900 border border-gray-700 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full text-white">
                      
                      {/* Modal Header */}
                      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                             <UserPlus size={20} className="text-blue-500" /> Invite New Member
                          </h3>
                          <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                              <X size={20} />
                          </button>
                      </div>

                      <div className="p-6 space-y-6">
                          
                          {/* Search By ID Section */}
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Invite by Unique ID</label>
                              <div className="flex gap-2 relative">
                                  <div className="relative flex-grow">
                                      <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                                      <input 
                                          type="text"
                                          placeholder="Enter Username#Code (e.g. Rahul#IND1)"
                                          className="w-full bg-gray-800 border-2 border-blue-500/50 focus:border-blue-500 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyUser()}
                                      />
                                  </div>
                                  <button 
                                      onClick={handleVerifyUser}
                                      disabled={isVerifying || !searchQuery}
                                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                                  >
                                      {isVerifying ? <Sparkles size={16} className="animate-spin" /> : 'AI-Verify'}
                                  </button>
                              </div>
                              
                              {/* Search Error */}
                              {searchError && (
                                  <div className="mt-3 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                                      <AlertCircle size={16} /> {searchError}
                                  </div>
                              )}

                              {/* Search Result Card */}
                              {searchResult && (
                                  <div className="mt-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700 flex items-center justify-between animate-fade-in-up">
                                      <div className="flex items-center gap-3">
                                          <img src={searchResult.avatarUrl} alt={searchResult.name} className="w-12 h-12 rounded-full border border-gray-600" />
                                          <div>
                                              <p className="font-bold text-white text-sm">{searchResult.name}</p>
                                              <p className="text-xs text-gray-400">{searchResult.title || 'Freelancer'}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <TQBadge score={searchResult.tqScore} size="sm" />
                                              </div>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => handleAddMember(searchResult)}
                                          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                                          title="Add to Squad"
                                      >
                                          <UserPlus size={20} />
                                      </button>
                                  </div>
                              )}
                          </div>

                          <div className="border-t border-gray-800"></div>

                          {/* Invite via Link Section */}
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Invite via Link</label>
                                <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Link expires in 24h</span>
                              </div>
                              
                              <div className="flex gap-2">
                                  <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 px-3 py-2.5 text-gray-400 text-sm truncate font-mono">
                                      https://gigsbharat.com/join/sk29a...
                                  </div>
                                  <button 
                                      onClick={handleCopyLink}
                                      className={`flex-shrink-0 w-10 flex items-center justify-center rounded-lg border transition-all ${inviteLinkCopied ? 'bg-green-50 border-green-50 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                                  >
                                      {inviteLinkCopied ? <Check size={18} /> : <Copy size={18} />}
                                  </button>
                              </div>

                              {/* Social Share Icons */}
                              <div className="flex gap-4 mt-4 justify-center">
                                  <button className="flex flex-col items-center gap-1 group">
                                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                          <MessageCircle size={20} />
                                      </div>
                                      <span className="text-[10px] text-gray-500">WhatsApp</span>
                                  </button>
                                  <button className="flex flex-col items-center gap-1 group">
                                      <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                          <Share2 size={20} />
                                      </div>
                                      <span className="text-[10px] text-gray-500">Telegram</span>
                                  </button>
                                  <button className="flex flex-col items-center gap-1 group">
                                      <div className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                          <Linkedin size={20} />
                                      </div>
                                      <span className="text-[10px] text-gray-500">LinkedIn</span>
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Footer Note */}
                      <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-800">
                          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                              <AlertCircle size={12} /> Reminder: Squads are limited to 4 members.
                          </p>
                      </div>

                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Teams;
