
import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, User, Users, Menu, Bell, Search, ShieldCheck, LogOut, LayoutDashboard, CreditCard, Cpu, IndianRupee, Check, Grid, Home, Wallet, MessageSquare, Layout, AlertTriangle } from 'lucide-react';
import { UserRole, User as UserType, Notification } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentRole: UserRole | null;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRole, isLoggedIn, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if(isLoggedIn) {
        // Fetch fresh user data to ensure avatar/name updates are reflected
        const user = api.auth.getCurrentUser();
        setCurrentUser(user);
        
        // Fetch Notifications
        if (user) {
            const list = api.notifications.getAll(user.id);
            setNotifications(list);
            setUnreadCount(api.notifications.getUnreadCount(user.id));
        }
    }
  }, [isLoggedIn, location]); 

  // Close notification dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setIsNotifOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: Notification) => {
      api.notifications.markAsRead(notif.id);
      
      // Update local state immediately for UI response
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsNotifOpen(false);

      if (notif.link) {
          navigate(notif.link);
      }
  };

  const handleMarkAllRead = () => {
      if (currentUser) {
          api.notifications.markAllAsRead(currentUser.id);
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
      }
  };

  const isActive = (path: string) => {
      const isCurrent = location.pathname === path;
      const baseClass = "px-3 py-1.5 flex items-center gap-2 rounded-lg transition-all pointer-events-auto duration-200";
      
      if (isCurrent) {
          return `${baseClass} text-sky-600 font-bold bg-sky-50 shadow-sm border border-sky-200 ring-2 ring-sky-500/10`;
      }
      return `${baseClass} text-gray-500 hover:text-gray-900 hover:bg-gray-100`;
  };

  const getLogoLink = () => {
    if (!isLoggedIn) return "/";
    switch (currentRole) {
        case UserRole.FREELANCER: return "/find-work";
        case UserRole.EMPLOYER: return "/company-dashboard";
        case UserRole.ADMIN: return "/admin";
        default: return "/";
    }
  };

  const getProfileLink = () => {
      if (currentRole === UserRole.EMPLOYER) return "/company-profile";
      if (currentRole === UserRole.FREELANCER) return "/freelancer-profile";
      return "/dashboard";
  };

  // Strict Navigation Links Logic
  const renderNavLinks = () => {
    if (!isLoggedIn) return null;

    if (currentRole === UserRole.FREELANCER) {
      return (
        <>
          <Link to="/dashboard" className={isActive('/dashboard')}><Home size={16}/> Home</Link>
          <Link to="/find-work" className={isActive('/find-work')}><Briefcase size={16}/> Find Work</Link>
          <Link to="/my-projects" className={isActive('/my-projects')}><Layout size={16}/> My Projects</Link>
          <Link to="/teams" className={isActive('/teams')}><Users size={16}/> My Teams</Link>
          <Link to="/chats" className={isActive('/chats')}><MessageSquare size={16}/> Chats</Link>
          <Link to="/pricing" className={isActive('/pricing')}><CreditCard size={16}/> Plans</Link>
        </>
      );
    }

    if (currentRole === UserRole.EMPLOYER) {
      return (
        <>
          <Link to="/company-dashboard" className={isActive('/company-dashboard')}>
              <Grid size={16} /> Command Center
          </Link>
          <Link to="/find-talent" className={isActive('/find-talent')}>
              <Search size={16} /> Find Talent
          </Link>
          <Link to="/active-gigs" className={isActive('/active-gigs')}>
              <Briefcase size={16} /> My Gigs
          </Link>
          <Link to="/chats" className={isActive('/chats')}>
              <MessageSquare size={16} /> Chats
          </Link>
          <Link to="/wallet" className={isActive('/wallet')}>
              <Wallet size={16} /> Wallet
          </Link>
        </>
      );
    }

    if (currentRole === UserRole.ADMIN) {
      return (
        <>
           <Link to="/admin" className={isActive('/admin')}>Overview</Link>
           <Link to="/admin/tickets" className={isActive('/admin/tickets')}>
              <AlertTriangle size={16} /> Issues & Tickets
           </Link>
        </>
      );
    }

    return null;
  };

  // Notification Icon Helper
  const getNotificationIcon = (type: string) => {
      switch (type) {
          case 'SQUAD_INVITE': return <Users size={16} className="text-orange-400" />;
          case 'PAYMENT': return <IndianRupee size={16} className="text-green-400" />;
          case 'SECURITY': return <ShieldCheck size={16} className="text-blue-400" />;
          default: return <Bell size={16} className="text-gray-400" />;
      }
  };

  // Format Time Helper
  const timeAgo = (dateStr: string) => {
      const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
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

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm h-16 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to={getLogoLink()} className="flex items-center gap-2 group pointer-events-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-orange-500 p-[2px] shadow-sm group-hover:shadow-md transition-all">
                  <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                    <Cpu size={20} className="text-sky-400" />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight flex items-baseline">
                  <span className="text-sky-600">G</span>
                  <div className="relative px-[1px]">
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sky-600 font-bold text-lg leading-none">^</span>
                      <span className="text-sky-600">i</span>
                  </div>
                  <span className="text-sky-600">g</span>
                  <span className="text-sky-600">s</span>
                  <span className="text-orange-500">Bharat</span>
                </span>
            </Link>
            {isLoggedIn && currentRole && (
                <span className={`ml-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border hidden sm:inline-block shadow-sm ${
                    currentRole === UserRole.FREELANCER ? 'bg-sky-100 text-sky-700 border-sky-200' :
                    currentRole === UserRole.EMPLOYER ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-red-100 text-red-700 border-red-200'
                }`}>
                    {currentRole}
                </span>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {renderNavLinks()}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && currentUser ? (
              <>
                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
                
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="text-gray-500 hover:text-gray-700 relative p-1 transition-colors outline-none pointer-events-auto"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-[110] transform origin-top-right transition-all animate-fade-in-up">
                            <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors pointer-events-auto">
                                        Mark all read <Check size={10} />
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer group flex gap-3 pointer-events-auto ${!notif.read ? 'bg-gray-800/30' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-gray-600 transition-colors">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!notif.read ? 'text-white font-semibold' : 'text-gray-400'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <span className="text-[10px] text-gray-600 mt-1 block">
                                                {timeAgo(notif.timestamp)}
                                            </span>
                                        </div>
                                        {!notif.read && (
                                            <div className="mt-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-2">
                  <Link to={getProfileLink()} className="flex items-center gap-3 group pointer-events-auto">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] group-hover:text-primary-600 transition-colors">
                            {currentUser.name}
                        </p>
                        {currentRole === UserRole.FREELANCER && (
                            <p className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 rounded inline-block">TQ: {currentUser.tqScore}</p>
                        )}
                    </div>
                    <img 
                        src={currentUser.avatarUrl || "https://ui-avatars.com/api/?name=" + currentUser.name}
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-gray-200 object-cover shadow-sm group-hover:ring-2 group-hover:ring-primary-100 transition-all" 
                    />
                  </Link>
                  <button 
                    onClick={onLogout}
                    className="ml-2 text-gray-400 hover:text-red-600 transition-colors pointer-events-auto"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
                <div className="text-sm text-gray-500 italic">Secure Gateway</div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isLoggedIn && (
            <div className="md:hidden flex items-center gap-4 ml-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 pointer-events-auto">
                    <Menu size={24} />
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-[120]">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            {renderNavLinks()}
            <Link 
                to={getProfileLink()}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 pointer-events-auto"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                My Profile
            </Link>
            <div className="border-t border-gray-100 my-2 pt-2">
                 <button 
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} 
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 pointer-events-auto"
                >
                  <LogOut size={16} /> Sign Out
                </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
