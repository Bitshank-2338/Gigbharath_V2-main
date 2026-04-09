
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Send, Paperclip, MoreVertical, ShieldCheck, Check, CheckCheck, MessageSquare, ArrowLeft, Zap, AlertTriangle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { UserRole, ChatRoom, ChatMessage } from '../types';

const Chats: React.FC = () => {
  const currentUser = useMemo(() => api.auth.getCurrentUser(), []);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Load Rooms
  const refreshRooms = () => {
    if (currentUser) {
      setRooms(api.chats.getRooms(currentUser.id));
    }
  };

  const refreshMessages = (roomId: string) => {
    setMessages(api.chats.getMessages(roomId));
  };

  useEffect(() => {
    refreshRooms();

    // Handle Incoming context from other pages
    const state = location.state as { participantId?: string; participantName?: string; participantRole?: UserRole } | null;
    if (state?.participantId && currentUser) {
      const room = api.chats.getOrCreateRoom(currentUser.id, state.participantId, {
        name: state.participantName,
        role: state.participantRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${state.participantName}&background=random`
      });
      refreshRooms();
      setSelectedRoom(room);
    }

    // Subscribe to "real-time" updates
    const unsubscribe = api.chats.subscribe((msg) => {
      if (selectedRoom && msg.roomId === selectedRoom.id) {
        refreshMessages(selectedRoom.id);
      }
      refreshRooms();
    });

    return () => unsubscribe();
  }, [currentUser, location.state, selectedRoom?.id]);

  useEffect(() => {
    if (selectedRoom) {
      refreshMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedRoom) return;
    
    api.chats.sendMessage(selectedRoom.id, currentUser.id, currentUser.name, newMessage);
    refreshMessages(selectedRoom.id);
    refreshRooms();
    setNewMessage('');
  };

  const handleReportSubmit = () => {
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    
    // Create actual dispute ticket
    if (selectedRoom) {
        // Try to get gig details if project linked, otherwise generic
        let gigTitle = 'General Chat Report';
        let gigId = 'general';
        
        if (selectedRoom.projectId) {
            const gig = api.gigs.getById(selectedRoom.projectId);
            if (gig) {
                gigTitle = gig.title;
                gigId = gig.id;
            }
        }

        api.disputes.create({
            gigId: gigId,
            gigTitle: gigTitle,
            reason: reportReason,
            raisedBy: currentUser?.name || 'Anonymous',
            raisedById: currentUser?.id,
            status: 'Open',
            roomId: selectedRoom.id // Pass room ID so admin can view logs
        });
    }

    setTimeout(() => {
        setIsSubmittingReport(false);
        setIsReportModalOpen(false);
        setReportReason('');
        alert("Report submitted successfully. A ticket has been created in the Admin Control Center.");
    }, 1000);
  };

  const filteredRooms = rooms.filter(r => {
    const partner = r.participantDetails.find(p => p.id !== currentUser?.id);
    return partner?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPartner = (room: ChatRoom) => room.participantDetails.find(p => p.id !== currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-fade-in h-[calc(100vh-6rem)] relative">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex h-full">
        
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Conversations</h1>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search peers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-sky-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
            {filteredRooms.length > 0 ? filteredRooms.map(room => {
              const partner = getPartner(room);
              return (
                <div 
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 flex gap-3 cursor-pointer transition-colors group ${selectedRoom?.id === room.id ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={partner?.avatarUrl} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
                    {partner?.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold truncate text-gray-900">{partner?.name}</h3>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {room.lastMessageTimestamp ? new Date(room.lastMessageTimestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <p className="text-xs truncate font-mono text-gray-500 mt-0.5">
                      {room.lastMessage || 'SECURE_CHANNEL_ESTABLISHED'}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-gray-400 italic text-sm">No conversations found.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col bg-[#f8f9fa]">
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedRoom(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900"><ArrowLeft size={20} /></button>
                <img src={getPartner(selectedRoom)?.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{getPartner(selectedRoom)?.name}</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span> Active Sync
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> Encrypted
                </div>
                <button 
                    onClick={() => setIsReportModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-sky-600 rounded-lg transition-colors"
                    title="Report Issue"
                >
                    <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`max-w-[80%] flex flex-col ${msg.senderId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 px-4 rounded-2xl text-sm shadow-sm font-sans ${
                      msg.senderId === currentUser?.id ? 'bg-sky-600 text-white border border-sky-700 rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                      {msg.senderId === currentUser?.id && (
                        <span className="text-sky-500"><CheckCheck size={12} /></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 px-4 focus-within:border-sky-400 transition-all">
                <button type="button" className="p-2 text-gray-400 hover:text-sky-600"><Paperclip size={20} /></button>
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none text-gray-900"
                  placeholder="Type a secure message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-sky-600 hover:bg-sky-700 border border-sky-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl shadow-lg active:scale-95">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-sky-500 border border-gray-100">
              <MessageSquare size={48} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Hub</h2>
            <p className="text-gray-500 max-w-sm">Select a verified peer channel to start a live encrypted conversation.</p>
            <div className="mt-8 flex gap-4">
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 text-xs font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> End-to-End Encrypted
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="bg-red-50 px-6 py-4 flex justify-between items-center border-b border-red-100">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle size={20} /> Report Issue
                    </h3>
                    <button 
                        onClick={() => setIsReportModalOpen(false)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Please describe the issue with this conversation or user. This report will be encrypted and sent to Trust & Safety.
                    </p>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32 resize-none"
                            placeholder="Describe the issue (e.g., abusive language, scam attempt)..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsReportModalOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReportSubmit}
                            disabled={!reportReason.trim() || isSubmittingReport}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
