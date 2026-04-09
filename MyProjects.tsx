
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { Gig, UserRole, User, ChatMessage, ChatRoom, Milestone, Task, TaskStatus } from '../types';
import { 
  Briefcase, Clock, IndianRupee, MessageSquare, ExternalLink, 
  ShieldCheck, Layout, X, Send, Paperclip, 
  CheckCircle, Zap, Shield, ArrowLeft, Medal, Trophy, MoreVertical, Terminal, Lock, Loader, Sparkles, Cpu, Eye, AlertTriangle,
  Minimize2, Maximize2, ShieldAlert, UploadCloud, Plus, Calendar, ListTodo, Trash2, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TQBadge from '../components/TQBadge';

const ProjectWorkspace: React.FC<{ project: Gig; onClose: () => void }> = ({ project: initialProject, onClose }) => {
  const [project, setProject] = useState<Gig>(initialProject);
  const [client, setClient] = useState<User | null>(null);
  const currentUser = useMemo(() => api.auth.getCurrentUser(), []);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');

  // UI States
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState<'idle' | 'scanning' | 'verifying' | 'submitted'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<string[]>([]);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [isFinalReviewActive, setIsFinalReviewActive] = useState(false);

  useEffect(() => {
    const foundClient = api.users.getById(project.postedById);
    if (foundClient) setClient(foundClient);

    // If project milestones are somehow missing (e.g. from older data), inject defaults
    if (!project.milestones || project.milestones.length === 0) {
        const defaultMilestones: Milestone[] = [
            { id: 'm1', title: 'Project Initiation & Setup', status: 'Completed', dueDate: new Date().toISOString(), amount: Math.floor(project.budget * 0.2) },
            { id: 'm2', title: 'Execution Phase', status: 'Pending', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), amount: Math.floor(project.budget * 0.8) }
        ];
        setProject(prev => ({ ...prev, milestones: defaultMilestones }));
    }

    if (currentUser && foundClient) {
      const activeRoom = api.chats.getOrCreateRoom(currentUser.id, foundClient.id, {
        name: foundClient.name,
        role: foundClient.role,
        avatarUrl: foundClient.avatarUrl
      }, project.id);
      setRoom(activeRoom);
      setMessages(api.chats.getMessages(activeRoom.id));
    }

    // Load tasks
    setTasks(api.tasks.getByProject(project.id));

    const timer = setTimeout(() => setIsInitializing(false), 1200);

    const unsubscribe = api.chats.subscribe((msg) => {
      if (room && msg.roomId === room.id) {
                setMessages(api.chats.getMessages(room.id));
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [project.postedById, project.id, currentUser, room?.id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !room) return;
    api.chats.sendMessage(room.id, currentUser.id, currentUser.name, newMessage);
        setMessages(api.chats.getMessages(room.id));
    setNewMessage('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.dueDate) return;
    
    const task = api.tasks.create({
        projectId: project.id,
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        assignedTo: currentUser?.id
    });
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', dueDate: '' });
    setShowAddTask(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
      api.tasks.updateStatus(taskId, status);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const handleDeleteTask = (taskId: string) => {
      api.tasks.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleRequestRelease = () => {
    if (!currentUser || !room) return;
    
    // Find first pending milestone to submit
    const pendingMilestone = project.milestones?.find(m => m.status === 'Pending');
    
    // If no pending milestones, we are requesting final admin disbursement
    if (!pendingMilestone) {
        const allCompleted = project.milestones?.every(m => m.status === 'Completed');
        if (allCompleted) {
            setShowReleaseConfirm(true);
            return;
        }
        alert("No milestones available for review.");
        return;
    }

    setShowReleaseConfirm(true);
  };

  const confirmRelease = () => {
    if (!currentUser || !room) return;
    
    const pendingMilestone = project.milestones?.find(m => m.status === 'Pending');
    const isFinalSubmission = !pendingMilestone && project.milestones?.every(m => m.status === 'Completed');

    setShowReleaseConfirm(false);
    setIsSubmitting(true);
    setSubmissionPhase('scanning');
    
    const initialLogs = isFinalSubmission 
        ? ['Initializing Admin Final Review Protocol...', 'Aggregating all phase deliverables...']
        : ['Initializing GigBharat AI Auditor...', 'Connecting to repository mirrors...'];
    
    setAiAnalysis(initialLogs);

    // Sequence Simulation
    setTimeout(() => {
        const nextLogs = isFinalSubmission
            ? ['✓ Phase 1-3 validation matches', '✓ Escrow balance verified: LOCKED']
            : ['✓ GitHub/GitLab integration verified', '✓ Branch "production" checksum match: OK'];
        setAiAnalysis(prev => [...prev, ...nextLogs]);
        setSubmissionPhase('verifying');
    }, 1500);

    setTimeout(() => {
        const securityLogs = isFinalSubmission
            ? ['✓ Final compliance check PASSED', '✓ Transmitting request to Platform Admin...']
            : ['✓ Linting & Security check passed (0 vulnerabilities)', '✓ AI Delta Check: Work aligns 98.4% with project scope'];
        setAiAnalysis(prev => [...prev, ...securityLogs]);
    }, 3000);

    setTimeout(() => {
        setSubmissionPhase('submitted');
        
        if (isFinalSubmission) {
            // Logic for Admin Review after all milestones done
            api.gigs.requestFinalDisbursement(project.id);
            setIsFinalReviewActive(true);
            api.chats.sendMessage(room.id, currentUser.id, currentUser.name, `FINAL_DISBURSEMENT_REQUEST: All phases are 100% complete. Transmitting mission report to platform administration for escrow release.`);
            
            setTimeout(() => {
                api.chats.sendMessage(room.id, 'ai-auditor', 'GigBharat AI', "ADMIN_PROTOCOL_ENGAGED: Final review packet received. Disbursement scheduled for manual admin sign-off.");
            }, 1000);
        } else if (pendingMilestone) {
            // Normal milestone submission
            api.gigs.updateMilestone(project.id, pendingMilestone.id, 'In Review');
            const updatedGigs = api.gigs.getById(project.id);
            if (updatedGigs) setProject(updatedGigs);
            api.chats.sendMessage(room.id, currentUser.id, currentUser.name, `DEPLOYMENT_COMPLETE: Submitting deliverables for "${pendingMilestone.title}" review.`);
            
            setTimeout(() => {
                api.chats.sendMessage(room.id, 'ai-auditor', 'GigBharat AI', "SYNC_STATUS: AI workspace release initiated. Freelancer must upload phase deliverables. Employer review starts only after AI validation passes.");
            }, 1000);
        }

        setIsSubmitting(false);
    }, 4500);
  };

  if (isInitializing) {
      return (
          <div className="fixed inset-0 z-[1000] bg-[#0a0a0c] flex flex-col items-center justify-center text-blue-500 font-mono">
              <Terminal size={48} className="mb-4 animate-pulse" />
              <div className="text-xs uppercase tracking-[0.5em]">Initializing Secure Workspace...</div>
              <div className="mt-8 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
              </div>
              <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
          </div>
      );
  }

  if (!client) return null;

  const inReviewCount = project.milestones?.filter(m => m.status === 'In Review').length || 0;
  const completedCount = project.milestones?.filter(m => m.status === 'Completed').length || 0;
  const totalCount = project.milestones?.length || 0;
  const nextPendingMilestone = project.milestones?.find(m => m.status === 'Pending');
  const allMilestonesDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0a0c] flex flex-col animate-fade-in font-mono overflow-hidden text-gray-300">
      
      {/* Confirmation Modal */}
      {showReleaseConfirm && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                <div className={`${allMilestonesDone ? 'bg-orange-600/10' : 'bg-blue-600/10'} p-6 border-b border-gray-800 flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${allMilestonesDone ? 'bg-orange-600/20 text-orange-400' : 'bg-blue-600/20 text-blue-400'}`}>
                        {allMilestonesDone ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{allMilestonesDone ? 'Final Payout' : 'Initialize Release'}</h3>
                        <p className="text-xs text-gray-500">Security Protocol Verification Required</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {allMilestonesDone 
                            ? `Requesting final escrow disbursement for MISSION: ${project.title}. This will trigger an official Admin review.`
                            : `Initializing the release process for "${nextPendingMilestone?.title}" will trigger the GigBharat AI Audit.`}
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 space-y-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Cpu size={12}/> Automated Protocol
                        </p>
                        <ul className="text-[11px] text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {allMilestonesDone ? 'Mission deliverable aggregation' : 'Repository integrity scan'}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {allMilestonesDone ? 'Final compliance audit' : 'AI project scope alignment check'}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {allMilestonesDone ? 'Transmit request to platform admin' : 'Client notification & review request'}
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-3">
                    <button 
                        onClick={() => setShowReleaseConfirm(false)}
                        className="flex-1 py-3 bg-transparent hover:bg-gray-800 text-gray-400 text-xs font-bold rounded uppercase tracking-widest transition-colors"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={confirmRelease}
                        className={`flex-2 px-8 py-3 text-white text-xs font-bold rounded uppercase tracking-widest transition-all shadow-lg active:scale-95 ${allMilestonesDone ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}
                    >
                        Confirm {allMilestonesDone ? 'Disbursement' : 'Release'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* AI Submission Overlay */}
      {submissionPhase !== 'idle' && submissionPhase !== 'submitted' && (
        <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-gray-950 border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <Cpu className="animate-spin-slow" size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-widest uppercase">{allMilestonesDone ? 'Admin Disbursement Audit' : 'GigBharat AI Auditor'}</h3>
                        <p className="text-blue-500 text-[10px] font-bold uppercase animate-pulse">{allMilestonesDone ? 'Transmitting Final Mission Packet' : 'Running Integrity Scan v4.0.2'}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-8 h-40 overflow-y-auto custom-scrollbar font-mono text-xs">
                    {aiAnalysis.map((line, idx) => (
                        <div key={idx} className="flex gap-3 text-blue-400/80">
                            <span className="text-blue-600">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            <span>{line}</span>
                        </div>
                    ))}
                    {submissionPhase === 'scanning' && <div className="animate-pulse text-blue-300">_</div>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Loader className="animate-spin text-blue-500" size={16} />
                        <span className="text-xs text-gray-500 uppercase font-bold">Verification protocol in progress...</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6 shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white bg-gray-900 border border-gray-800 rounded-md group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-8 w-px bg-gray-800"></div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Zap size={14} className="text-blue-400" /> MISSION: {project.title}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">OPERATIONAL_ID: {project.id.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Protocol Secured</span>
           </div>
           <div className="text-right hidden sm:block">
             <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Budget Lock</div>
             <div className="text-sm font-bold text-white">₹{project.budget.toLocaleString()}</div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className={`transition-all duration-300 border-r border-gray-800 bg-gray-950 overflow-y-auto flex flex-col scroll-smooth custom-scrollbar ${isChatMinimized ? 'w-full lg:w-[calc(100%-4rem)]' : 'w-full lg:w-1/3'}`}>
           <div className="p-6 border-b border-gray-800 flex gap-2">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
              >
                  Mission Info
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
              >
                  Task Board <span className="bg-gray-800 px-1.5 rounded text-[8px]">{tasks.length}</span>
              </button>
           </div>

           <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {activeTab === 'info' ? (
                    <>
                        <div className="relative p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 group overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Shield size={100} /></div>
                            <h3 className="text-[10px] font-extrabold text-gray-500 tracking-[0.2em] uppercase mb-4">Client Integrity Scan</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img src={client.avatarUrl || `https://ui-avatars.com/api/?name=${client.name}`} className="w-14 h-14 rounded-lg border-2 border-gray-800 shadow-lg object-cover" />
                                <div>
                                    <h4 className="text-base font-bold text-white">{client.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                    <TQBadge score={client.tqScore} size="sm" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{client.userTag}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Gigs Completed</p>
                                    <p className="text-xl font-bold text-white">{client.completedGigsCount || 42}</p>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Success Rate</p>
                                    <p className="text-xl font-bold text-blue-400">98%</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-extrabold text-gray-400 tracking-[0.2em] uppercase mb-4 flex items-center justify-between">
                                <span>Operational Milestones</span>
                                <span className="text-blue-500">PHASE {completedCount}/{totalCount} DONE</span>
                            </h3>
                            <div className="space-y-3">
                                {project.milestones?.map((m) => (
                                    <div key={m.id} className={`p-4 rounded-lg border flex justify-between items-center transition-all ${
                                    m.status === 'Completed' ? 'bg-green-500/5 border-green-500/20' :
                                    m.status === 'In Review' ? 'bg-orange-500/5 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]' :
                                    'bg-gray-900 border-gray-800'
                                    }`}>
                                    <div>
                                        <p className={`text-xs font-bold ${m.status === 'Completed' ? 'text-green-500' : 'text-white'}`}>{m.title}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Due {new Date(m.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400">₹{m.amount.toLocaleString()}</p>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                            m.status === 'Completed' ? 'text-green-500' :
                                            m.status === 'In Review' ? 'text-orange-500' : 'text-gray-500'
                                        }`}>{m.status}</span>
                                    </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border-2 border-dashed border-gray-800 bg-gray-900/30">
                            {isFinalReviewActive ? (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded bg-orange-600/10 text-orange-400 border border-orange-600/20">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Admin Review</h4>
                                            <p className="text-[10px] text-gray-500">Official Disbursement Verification</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-orange-600 w-full animate-pulse"></div>
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase text-center tracking-widest">Status: FINAL_ESCROW_SIGN_OFF</p>
                                </div>
                            ) : (inReviewCount > 0 ? (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                            <Eye size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">In Review</h4>
                                            <p className="text-[10px] text-gray-500">AI Verified • Awaiting Client Sign-off</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-orange-500 w-3/4 animate-pulse"></div>
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase text-center tracking-widest">Status: PENDING_EMPLOYER_REVIEW</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <ShieldCheck size={20} className="text-green-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Escrow Active</h4>
                                            <p className="text-[10px] text-gray-500">Asset lock verified by GigBharat</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleRequestRelease}
                                        className={`w-full py-3 text-white text-[10px] font-bold rounded uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group cursor-pointer ${allMilestonesDone ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                                        {allMilestonesDone ? 'Request Final Payout' : 'Request Payment Release'}
                                    </button>
                                </>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">Project Roadmap</h3>
                            <button 
                                onClick={() => setShowAddTask(true)}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {showAddTask && (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-fade-in-up">
                                <form onSubmit={handleAddTask} className="space-y-3">
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Task Title"
                                        className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                    <textarea 
                                        placeholder="Description (Optional)"
                                        className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500 resize-none h-16"
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            required
                                            type="date"
                                            className="flex-1 bg-gray-950 border border-gray-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500"
                                            value={newTask.dueDate}
                                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                        />
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded uppercase hover:bg-blue-500">Deploy</button>
                                        <button type="button" onClick={() => setShowAddTask(false)} className="px-3 py-2 bg-gray-800 text-gray-400 text-[10px] font-bold rounded uppercase hover:bg-gray-700">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            {tasks.length > 0 ? tasks.map(task => (
                                <div key={task.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 group hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleUpdateTaskStatus(task.id, task.status === 'Done' ? 'Todo' : 'Done')}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-700 hover:border-blue-500'}`}
                                            >
                                                {task.status === 'Done' && <CheckCircle size={14} />}
                                            </button>
                                            <h4 className={`text-sm font-bold ${task.status === 'Done' ? 'text-gray-600 line-through' : 'text-white'}`}>{task.title}</h4>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {task.description && (
                                        <p className="text-[11px] text-gray-500 mb-3 ml-8 leading-relaxed">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between ml-8 pt-3 border-t border-gray-800/50">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                            <Calendar size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                        <select 
                                            className="bg-gray-950 border border-gray-800 rounded text-[9px] font-bold text-gray-400 uppercase py-0.5 px-1 outline-none cursor-pointer hover:border-blue-500"
                                            value={task.status}
                                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-gray-900/20 rounded-xl border border-dashed border-gray-800">
                                    <ListTodo size={32} className="mx-auto text-gray-800 mb-2" />
                                    <p className="text-xs text-gray-600 uppercase font-bold">No tasks deployed yet.</p>
                                    <button onClick={() => setShowAddTask(true)} className="text-[10px] text-blue-500 hover:underline mt-2 uppercase font-bold tracking-widest">+ Initialize First Task</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
           </div>
        </div>

        {/* Chat Area */}
        <div className={`transition-all duration-300 flex flex-col bg-[#0d0d0f] relative ${isChatMinimized ? 'w-full h-16 lg:w-16 lg:h-full' : 'flex-1'}`}>
           <div className={`px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-10 transition-all duration-300 ${isChatMinimized ? 'lg:flex-col lg:justify-start lg:gap-8 lg:py-8 lg:px-0' : ''}`}>
              <div className={`flex items-center gap-3 ${isChatMinimized ? 'lg:flex-col lg:gap-2' : ''}`}>
                 <div className="relative">
                    <img src={client.avatarUrl || `https://ui-avatars.com/api/?name=${client.name}`} className="w-8 h-8 rounded border border-gray-700" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d0f]"></div>
                 </div>
                 {!isChatMinimized && (
                   <div>
                      <p className="text-xs font-bold text-white">{client.name}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Presence detected</p>
                   </div>
                 )}
              </div>
              <div className={`flex items-center gap-2 ${isChatMinimized ? 'lg:flex-col' : ''}`}>
                <button 
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                  title={isChatMinimized ? "Restore Chat" : "Minimize Chat"}
                >
                  {isChatMinimized ? (
                    <div className="lg:rotate-90"><Maximize2 size={16} /></div>
                  ) : (
                    <Minimize2 size={16} />
                  )}
                </button>
                {!isChatMinimized && <button className="p-2 text-gray-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>}
              </div>
           </div>

           {!isChatMinimized && (
             <>
               <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth custom-scrollbar">
                  <div className="text-center mb-8">
                     <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">Secure Peer Channel Established</span>
                  </div>
                  {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`max-w-[85%] flex flex-col ${msg.senderId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                           <div className={`px-4 py-3 rounded-xl text-sm font-mono relative ${
                              msg.senderId === 'ai-auditor' ? 'bg-gray-800/80 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' :
                              msg.senderId === currentUser?.id ? 'bg-blue-600 text-white border border-blue-500 shadow-xl' : 'bg-gray-900 text-gray-300 border border-gray-800'
                           }`}>
                              {msg.senderId === 'ai-auditor' && <Sparkles size={10} className="inline mr-2 mb-1" />}
                              {msg.text}
                           </div>
                           <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-widest">
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                     </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-4 bg-gray-950 border-t border-gray-800 z-10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-800 bg-gray-900 focus-within:border-blue-500/50 transition-all">
                     <button type="button" className="p-2 text-gray-500 hover:text-blue-400"><Paperclip size={20} /></button>
                     <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-white placeholder-gray-700 outline-none"
                        placeholder="Enter command or sync update..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                     />
                     <button type="submit" disabled={!newMessage.trim() || submissionPhase === 'scanning'} className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white rounded shadow-lg transition-all">
                        <Send size={18} />
                     </button>
                  </form>
               </div>
             </>
           )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Gig[]>([]);
  const [activeProject, setActiveProject] = useState<Gig | null>(null);
  const currentUser = useMemo(() => api.auth.getCurrentUser(), []);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const allGigs = api.gigs.getAll();
      const squad = api.teams.getMySquad(currentUser.id);
      
      const myActiveGigs = allGigs.filter(g => 
        (g.assignedTo === currentUser.id || (squad && g.assignedTo === squad.id)) && 
        g.status === 'In Progress'
      );
      setProjects(myActiveGigs);
    }
  }, [currentUser]);

  const handleOpenChat = (project: Gig) => {
    navigate('/chats', { 
      state: { 
        participantId: project.postedById, 
        participantName: project.postedBy,
        participantRole: UserRole.EMPLOYER
      } 
    });
  };

  const handleOpenSubmit = (projectId: string) => {
    window.open(`${window.location.origin}/#/review-submission/${projectId}`, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="text-primary-600" /> My Active Projects
          </h1>
          <p className="text-gray-500 mt-2">Manage and track your ongoing contracts and mission-critical work.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.length > 0 ? projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
               <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">In Progress</span>
                        <span className="text-xs text-gray-400 font-medium">Started {new Date(project.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
                     <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
                     
                     <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                           <Briefcase size={16} className="text-gray-400" />
                           <span className="font-medium text-gray-700">{project.postedBy}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                           <Clock size={16} className="text-gray-400" />
                           <span className="font-medium text-gray-700">Deadline: {project.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                           <IndianRupee size={16} className="text-green-600" />
                           <span className="font-bold text-green-700">{project.budget.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center md:w-56">
                            <button onClick={() => handleOpenChat(project)} className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 border border-sky-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-900/20 active:scale-95 transition-all whitespace-nowrap">
                        <MessageSquare size={18} /> Open Chat
                     </button>
                     <button onClick={() => setActiveProject(project)} className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap">
                        <ExternalLink size={18} /> View Workspace
                     </button>
                     <button onClick={() => handleOpenSubmit(project.id)} className="flex items-center justify-center gap-2 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap">
                        <UploadCloud size={18} /> Submit Work Sample
                     </button>
                  </div>
               </div>
               
               <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest">
                     <ShieldCheck size={14} className="text-green-500" /> Escrow Protected
                  </div>
               </div>
            </div>
          )) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <Briefcase size={64} className="mx-auto text-gray-200 mb-6" />
               <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Projects</h3>
               <p className="text-gray-500 mb-8 max-w-sm mx-auto">Land your first gig to access the secure collaborative workspace.</p>
               <Link to="/find-work" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-xl">Browse Gigs</Link>
            </div>
          )}
        </div>
      </div>

      {activeProject && <ProjectWorkspace project={activeProject} onClose={() => setActiveProject(null)} />}
    </div>
  );
};

export default MyProjects;
