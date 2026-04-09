
import { User, UserRole, Notification, Gig, Bid, Team, ChatRoom, ChatMessage, Task, Dispute, SubscriptionRequest, Milestone, NotificationType, TQBreakdown, TQTier } from '../types';
import { MOCK_FREELANCERS, SUBSCRIPTION_PLANS } from './mockData';

const KEYS = {
  USERS: 'gigbharat_users_v2', // Incremented version to ensure fresh seed with passwords
  GIGS: 'gigbharat_gigs',
  BIDS: 'gigbharat_bids',
  TEAMS: 'gigbharat_teams',
  NOTIFICATIONS: 'gigbharat_notifications',
  CHATS: 'gigbharat_chats',
  MESSAGES: 'gigbharat_messages',
  TASKS: 'gigbharat_tasks',
  DISPUTES: 'gigbharat_disputes',
  SUBSCRIPTIONS: 'gigbharat_subscriptions',
  CURRENT_USER: 'gigbharat_current_user'
};

const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Ignore storage write failures to avoid crashing initial render.
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch {
            // Ignore storage delete failures.
        }
    }
};

// Helper to get from local storage
const get = <T>(key: string): T[] => {
    const data = safeStorage.getItem(key);
    if (!data) return [];
    try {
        return JSON.parse(data) as T[];
    } catch {
        safeStorage.removeItem(key);
        return [];
    }
};

// Helper to set to local storage
const set = (key: string, data: any[]) => {
    safeStorage.setItem(key, JSON.stringify(data));
};

// Initialize Mock Data
const initialize = () => {
    if (!safeStorage.getItem(KEYS.USERS)) {
    // Only seed the System Admin
    const users: User[] = [
      {
        id: 'admin1',
        name: 'System Admin',
        email: 'admin@gigbharat.com',
        password: 'admin123', // Default secure password for seed admin
        role: UserRole.ADMIN,
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin',
        tqScore: 0,
        tqTier: 'Bronze',
        tqBreakdown: { profileStrength: 0, identityVerification: 0, emailVerificationBonus: 0, gigHistory: 0, ratingPerformance: 0, responseTime: 0 },
        skills: [],
        location: 'Delhi',
        title: 'Administrator',
        bio: 'System Administrator',
        verified: true,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        subscriptionTier: 'Free',
        subscriptionStatus: 'Active'
      } as User
    ];
    set(KEYS.USERS, users);
  }
  
    if (!safeStorage.getItem(KEYS.GIGS)) {
      set(KEYS.GIGS, []);
  }

  // Clear or initialize empty disputes array to remove fake data
    if (!safeStorage.getItem(KEYS.DISPUTES)) {
      set(KEYS.DISPUTES, []);
  }
};

initialize();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getTQTier = (score: number): TQTier => {
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 50) return 'Silver';
    return 'Bronze';
};

const calculateProfileStrength = (user: Partial<User>): number => {
    let score = 0;

    if (user.title?.trim()) score += 3;
    if (user.bio?.trim()) score += 4;
    if (user.location?.trim()) score += 2;
    if ((user.skills?.length || 0) >= 3) score += 5;
    if (user.portfolioUrl?.trim() || user.website?.trim()) score += 3;
    if (user.workGallery && user.workGallery.length > 0) score += 2;
    if (user.phone?.trim() || user.address?.trim()) score += 1;

    return clamp(score, 0, 20);
};

const calculateIdentityVerification = (user: Partial<User>): number => {
    if (user.verified) return 10;

    let score = 0;
    if (user.aadhaarMasked?.trim() || user.aadharVerified) score += 4;
    if (user.panNumber?.trim()) score += 2;
    if (user.videoKycUrl?.trim()) score += 2;
    if (user.eshramId?.trim() || user.gstin?.trim() || user.udyamRegistration?.trim()) score += 2;

    return clamp(score, 0, 10);
};

const calculateGigHistory = (user: Partial<User>): number => {
    const completedGigs = user.completedGigsCount ?? 0;

    if (completedGigs >= 15) return 40;
    if (completedGigs >= 10) return 34;
    if (completedGigs >= 6) return 26;
    if (completedGigs >= 3) return 18;
    if (completedGigs >= 1) return 10;
    return 0;
};

const calculateEmailVerificationBonus = (user: Partial<User>): number => {
    return user.emailVerified ? 10 : 0;
};

const calculateRatingPerformance = (user: Partial<User>): number => {
    const rating = user.averageRating ?? 0;
    if (rating <= 0) return 0;
    return clamp(Math.round((rating / 5) * 20), 0, 20);
};

const calculateResponseTime = (user: Partial<User>): number => {
    const delayHours = user.avgResponseDelayHours;

    if (delayHours === undefined || delayHours === null) return 4;
    if (delayHours <= 1) return 10;
    if (delayHours <= 3) return 8;
    if (delayHours <= 12) return 6;
    if (delayHours <= 24) return 4;
    if (delayHours <= 48) return 2;
    return 0;
};

const calculateTrustQuotient = (user: Partial<User>): Pick<User, 'tqScore' | 'tqTier' | 'tqBreakdown'> => {
    const tqBreakdown: TQBreakdown = {
        profileStrength: calculateProfileStrength(user),
        identityVerification: calculateIdentityVerification(user),
        emailVerificationBonus: calculateEmailVerificationBonus(user),
        gigHistory: calculateGigHistory(user),
        ratingPerformance: calculateRatingPerformance(user),
        responseTime: calculateResponseTime(user)
    };

    const tqScore = clamp(
        tqBreakdown.profileStrength +
        tqBreakdown.identityVerification +
        tqBreakdown.emailVerificationBonus +
        tqBreakdown.gigHistory +
        tqBreakdown.ratingPerformance +
        tqBreakdown.responseTime,
        0,
        100
    );

    return {
        tqScore,
        tqTier: getTQTier(tqScore),
        tqBreakdown
    };
};

const normalizeUserTrust = (user: User): User => {
    if (user.role === UserRole.ADMIN) return user;
    return {
        ...user,
        ...calculateTrustQuotient(user)
    };
};

const getMeaningfulKeywords = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !['with', 'from', 'that', 'this', 'have', 'will', 'into', 'your'].includes(word));

const buildMilestoneAiReview = (gig: Gig, milestone: Milestone, summary: string, attachments: { name: string; type: 'image' | 'video' }[], links: string[]) => {
    const summaryText = `${summary} ${links.join(' ')} ${attachments.map(item => item.name).join(' ')}`.toLowerCase();
    const employerChecklist = Array.from(new Set([
        ...gig.skillsRequired.slice(0, 4),
        ...getMeaningfulKeywords(milestone.title).slice(0, 3)
    ])).slice(0, 5);

    const matchedChecklist = employerChecklist.filter(item => summaryText.includes(item.toLowerCase()));
    const missingItems = employerChecklist.filter(item => !summaryText.includes(item.toLowerCase()));
    const strengths: string[] = [];

    if (summary.trim().length >= 80) strengths.push('Submission summary clearly explains the work completed.');
    if (attachments.length >= 2) strengths.push('Multiple deliverable files were attached for validation.');
    if (links.length > 0) strengths.push('Supporting links were included for employer verification.');
    if (matchedChecklist.length >= Math.min(2, employerChecklist.length || 1)) strengths.push('Key employer requirements are referenced in the submission notes.');

    const passed = summary.trim().length >= 80 && attachments.length > 0 && matchedChecklist.length >= Math.min(2, Math.max(1, employerChecklist.length));

    return {
        verdict: passed ? 'approved' as const : 'changes-requested' as const,
        summary: passed
            ? 'AI review passed. Deliverables appear aligned with the milestone scope and are ready for employer verification.'
            : 'AI review found missing or weak coverage against the employer requirements. The freelancer should revise and resubmit before employer review.',
        strengths,
        missingItems: passed ? [] : [
            ...(summary.trim().length < 80 ? ['Add a clearer completion summary describing exactly what was delivered.'] : []),
            ...(attachments.length === 0 ? ['Attach at least one deliverable file for proof of work.'] : []),
            ...missingItems.map(item => `Show evidence for requirement: ${item}`)
        ].slice(0, 5),
        employerChecklist,
        reviewedAt: new Date().toISOString()
    };
};

const persistCurrentUserIfNeeded = (user: User) => {
    const currentUser = api.auth.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
        safeStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
};

export const api = {
  auth: {
    getCurrentUser: (): User | null => {
            const stored = safeStorage.getItem(KEYS.CURRENT_USER);
            if (!stored) return null;
            try {
                return normalizeUserTrust(JSON.parse(stored) as User);
            } catch {
                safeStorage.removeItem(KEYS.CURRENT_USER);
                return null;
            }
    },
    login: (email: string, password: string, role: UserRole): User => {
      const users = get<User>(KEYS.USERS);
      
      // 1. Find the User
      const user = users.find(u => u.email === email && u.role === role);
      
      // 2. Handle Case where User is Not Found
      if (!user) {
         throw new Error("User not found. Please create an account.");
      }

      if (!user.password) {
          throw new Error('This account uses Google sign-in. Continue with Google to access it.');
      }

      // 3. Strict Logic Check: Verify Password
      // Note: In a real Node.js backend, use: await bcrypt.compare(password, user.password)
      if (user.password !== password) {
          throw new Error("Invalid Credentials");
      }
      
      // 4. Update state (Simulate Token Generation / Session Start)
      user.lastSeen = new Date().toISOString();
      const index = users.findIndex(u => u.id === user!.id);
      if (index !== -1) {
                    users[index] = normalizeUserTrust(user);
          set(KEYS.USERS, users);
      }

                        safeStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[index]));
            return users[index];
    },
    loginWithGoogle: (data: { email: string; name: string; role: UserRole; avatarUrl?: string; emailVerified?: boolean }): User => {
        const users = get<User>(KEYS.USERS);
        const existingIndex = users.findIndex(u => u.email === data.email && u.role === data.role);

        if (existingIndex !== -1) {
            const updatedUser = normalizeUserTrust({
                ...users[existingIndex],
                name: data.name || users[existingIndex].name,
                avatarUrl: data.avatarUrl || users[existingIndex].avatarUrl,
                emailVerified: data.emailVerified || users[existingIndex].emailVerified,
                lastSeen: new Date().toISOString()
            });

            users[existingIndex] = updatedUser;
            set(KEYS.USERS, users);
            safeStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));
            return updatedUser;
        }

        const newUser: User = normalizeUserTrust({
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            email: data.email,
            password: undefined,
            role: data.role,
            avatarUrl: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
            tqScore: 0,
            tqTier: 'Bronze',
            tqBreakdown: { profileStrength: 0, identityVerification: 0, emailVerificationBonus: 0, gigHistory: 0, ratingPerformance: 0, responseTime: 0 },
            skills: [],
            location: '',
            title: '',
            bio: '',
            verified: false,
            emailVerified: Boolean(data.emailVerified),
            joinedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            subscriptionTier: 'Free',
            subscriptionStatus: 'Active',
            walletBalance: 0,
            userTag: `#${data.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'GBR'}${Math.floor(Math.random() * 1000)}`,
            corporateTrustScore: 0,
            corporateTrustBreakdown: { paymentVelocity: 0, escrowHealth: 0, disputeRatio: 0, workerSentiment: 0 },
            verificationSubmitted: false,
            verificationSubmittedAt: undefined,
        });

        users.push(newUser);
        set(KEYS.USERS, users);
        safeStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
        return newUser;
    },
    register: (data: any): User => {
        const users = get<User>(KEYS.USERS);
        
        // Check if user already exists
        if (users.find(u => u.email === data.email && u.role === data.role)) {
            throw new Error("User already exists with this role.");
        }

        const newUser: User = normalizeUserTrust({
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            email: data.email,
            password: data.password, // Storing password for verification
            role: data.role,
            avatarUrl: `https://ui-avatars.com/api/?name=${data.name}`,
            tqScore: 0,
            tqTier: 'Bronze',
            tqBreakdown: { profileStrength: 0, identityVerification: 0, emailVerificationBonus: 0, gigHistory: 0, ratingPerformance: 0, responseTime: 0 },
            skills: [],
            location: '',
            title: '',
            bio: '',
            verified: false,
            joinedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            subscriptionTier: 'Free',
            subscriptionStatus: 'Active',
            walletBalance: 0,
            userTag: `#${data.name.toUpperCase().substr(0,3)}${Math.floor(Math.random()*1000)}`,
            corporateTrustScore: 0,
            corporateTrustBreakdown: { paymentVelocity: 0, escrowHealth: 0, disputeRatio: 0, workerSentiment: 0 },
            verificationSubmitted: false,
            verificationSubmittedAt: undefined,
        });
        users.push(newUser);
        set(KEYS.USERS, users);
                safeStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
        return newUser;
    },
    logout: () => {
            safeStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  users: {
    getAll: () => get<User>(KEYS.USERS).map(normalizeUserTrust),
    getById: (id: string) => {
        const user = get<User>(KEYS.USERS).find(u => u.id === id);
        return user ? normalizeUserTrust(user) : undefined;
    },
    getAllFreelancers: () => get<User>(KEYS.USERS).filter(u => u.role === UserRole.FREELANCER).map(normalizeUserTrust),
    updateProfile: (id: string, updates: Partial<User>) => {
        const users = get<User>(KEYS.USERS);
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = normalizeUserTrust({ ...users[index], ...updates });
            set(KEYS.USERS, users);
            persistCurrentUserIfNeeded(users[index]);
            return users[index];
        }
        throw new Error('User not found');
    },
    findByUniqueId: (uniqueId: string) => { // username#tag format approx logic
        // For simplicity, just matching name or tag
        const users = get<User>(KEYS.USERS);
        return users.find(u => u.userTag === uniqueId || `${u.name}#${u.userTag}` === uniqueId);
    }
  },
  notifications: {
      getAll: (userId: string) => get<Notification>(KEYS.NOTIFICATIONS).filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      getUnreadCount: (userId: string) => get<Notification>(KEYS.NOTIFICATIONS).filter(n => n.userId === userId && !n.read).length,
      create: (notif: Partial<Notification>) => {
          const list = get<Notification>(KEYS.NOTIFICATIONS);
          const newNotif = {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString(),
              read: false,
              ...notif
          } as Notification;
          list.push(newNotif);
          set(KEYS.NOTIFICATIONS, list);
          return newNotif;
      },
      markAsRead: (id: string) => {
          const list = get<Notification>(KEYS.NOTIFICATIONS);
          const index = list.findIndex(n => n.id === id);
          if(index !== -1) {
              list[index].read = true;
              set(KEYS.NOTIFICATIONS, list);
          }
      },
      markAllAsRead: (userId: string) => {
          const list = get<Notification>(KEYS.NOTIFICATIONS);
          const updated = list.map(n => n.userId === userId ? { ...n, read: true } : n);
          set(KEYS.NOTIFICATIONS, updated);
      }
  },
  gigs: {
      getAll: () => get<Gig>(KEYS.GIGS),
      getById: (id: string) => get<Gig>(KEYS.GIGS).find(g => g.id === id),
      getHistory: (userId: string) => {
          // For freelancers: gigs they completed
          // For employers: gigs they posted and are completed
          const gigs = get<Gig>(KEYS.GIGS);
          return gigs.filter(g => (g.assignedTo === userId || g.postedById === userId) && g.status === 'Completed');
      },
      create: (gig: Partial<Gig>) => {
          const list = get<Gig>(KEYS.GIGS);
          const newGig = {
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
              status: 'Open',
              minTQ: 0,
              isTeamAllowed: false,
              skillsRequired: [],
              paymentStatus: 'Unpaid',
              milestones: [],
              ...gig
          } as Gig;
          list.push(newGig);
          set(KEYS.GIGS, list);
          return newGig;
      },
      updateMilestone: (gigId: string, milestoneId: string, status: string) => {
          const list = get<Gig>(KEYS.GIGS);
          const gig = list.find(g => g.id === gigId);
          if (gig && gig.milestones) {
              const ms = gig.milestones.find(m => m.id === milestoneId);
              if (ms) ms.status = status as any;
              set(KEYS.GIGS, list);
          }
      },
      submitMilestoneDeliverables: (gigId: string, payload: { summary: string; links: string[]; attachments: { name: string; type: 'image' | 'video' }[]; }) => {
          const gigs = get<Gig>(KEYS.GIGS);
          const gigIndex = gigs.findIndex(g => g.id === gigId);
          if (gigIndex === -1) throw new Error('Gig not found');

          const gig = gigs[gigIndex];
          const milestone = gig.milestones?.find(m => m.status === 'Pending');
          if (!milestone) throw new Error('No pending milestone found');

          milestone.submission = {
              submittedAt: new Date().toISOString(),
              summary: payload.summary,
              links: payload.links,
              attachments: payload.attachments
          };

          const aiReview = buildMilestoneAiReview(gig, milestone, payload.summary, payload.attachments, payload.links);
          milestone.aiReview = aiReview;
          milestone.employerReview = undefined;
          milestone.status = aiReview.verdict === 'approved' ? 'In Review' : 'Pending';

          gigs[gigIndex] = gig;
          set(KEYS.GIGS, gigs);
          return { gig, milestone, aiReview };
      },
      reviewMilestoneSubmission: (gigId: string, milestoneId: string, decision: 'approved' | 'changes-requested', notes?: string) => {
          const gigs = get<Gig>(KEYS.GIGS);
          const gigIndex = gigs.findIndex(g => g.id === gigId);
          if (gigIndex === -1) throw new Error('Gig not found');

          const milestone = gigs[gigIndex].milestones?.find(m => m.id === milestoneId);
          if (!milestone) throw new Error('Milestone not found');

          milestone.employerReview = {
              status: decision,
              notes,
              reviewedAt: new Date().toISOString()
          };
          milestone.status = decision === 'approved' ? 'Completed' : 'Pending';

          set(KEYS.GIGS, gigs);
          return gigs[gigIndex];
      },
      requestFinalDisbursement: (gigId: string) => {
          // In real app, sends request to admin
          console.log("Final disbursement requested for", gigId);
      },
      hireTalent: (gigId: string, bidId: string) => {
          const gigs = get<Gig>(KEYS.GIGS);
          const bids = get<Bid>(KEYS.BIDS);
          const gigIndex = gigs.findIndex(g => g.id === gigId);
          const bid = bids.find(b => b.id === bidId);

          if (gigIndex !== -1 && bid) {
              gigs[gigIndex].status = 'In Progress';
              gigs[gigIndex].assignedTo = bid.freelancerId;
              gigs[gigIndex].assignedToName = bid.freelancerName;
              // Initialize default milestones if none
              if (!gigs[gigIndex].milestones || gigs[gigIndex].milestones?.length === 0) {
                  gigs[gigIndex].milestones = [
                      { id: Math.random().toString(36), title: 'Phase 1: Mobilization', status: 'Pending', dueDate: new Date(Date.now() + 86400000*3).toISOString(), amount: Math.floor(gigs[gigIndex].budget * 0.3) },
                      { id: Math.random().toString(36), title: 'Phase 2: Completion', status: 'Pending', dueDate: gigs[gigIndex].deadline, amount: Math.floor(gigs[gigIndex].budget * 0.7) }
                  ];
              }
              set(KEYS.GIGS, gigs);
              
              // Notify freelancer
              api.notifications.create({
                  userId: bid.freelancerId,
                  type: 'GIG_HIRE',
                  title: 'You have been hired!',
                  message: `Congratulations! You have been hired for "${gigs[gigIndex].title}".`,
                  link: '/my-projects'
              });
          }
      },
      settlePayment: (gigId: string) => {
          const list = get<Gig>(KEYS.GIGS);
          const index = list.findIndex(g => g.id === gigId);
          if (index !== -1) {
              list[index].paymentStatus = 'Paid';
              set(KEYS.GIGS, list);
              
              // Update wallet balances (Mock)
              const gig = list[index];
              if (gig.assignedTo) {
                  const users = get<User>(KEYS.USERS);
                  const freelancerIdx = users.findIndex(u => u.id === gig.assignedTo);
                  if (freelancerIdx !== -1) {
                      users[freelancerIdx].walletBalance = (users[freelancerIdx].walletBalance || 0) + gig.budget;
                      set(KEYS.USERS, users);
                  }
              }
          }
      }
  },
  bids: {
      getByGigId: (gigId: string) => get<Bid>(KEYS.BIDS).filter(b => b.gigId === gigId),
      create: (bid: Partial<Bid>) => {
          const list = get<Bid>(KEYS.BIDS);
          const currentUser = api.auth.getCurrentUser();
          if (!currentUser) throw new Error("Not logged in");

          const newBid = {
              id: Math.random().toString(36).substr(2, 9),
              freelancerId: currentUser.id,
              freelancerName: currentUser.name,
              freelancerTQ: currentUser.tqScore,
              status: 'Pending',
              bidDate: new Date().toISOString(),
              ...bid
          } as Bid;
          list.push(newBid);
          set(KEYS.BIDS, list);
          
          // Notify employer
          const gig = api.gigs.getById(newBid.gigId);
          if (gig) {
              api.notifications.create({
                  userId: gig.postedById,
                  type: 'OFFER',
                  title: 'New Bid Received',
                  message: `${currentUser.name} placed a bid on "${gig.title}".`,
                  link: '/active-gigs'
              });
          }
          return newBid;
      }
  },
  teams: {
      getAll: () => get<Team>(KEYS.TEAMS),
      getMySquad: (userId: string) => get<Team>(KEYS.TEAMS).find(t => t.memberIds.includes(userId) || t.leaderId === userId),
      create: (teamData: any) => {
          const list = get<Team>(KEYS.TEAMS);
          const currentUser = api.auth.getCurrentUser();
          if (!currentUser) throw new Error("Not logged in");
          
          const newTeam: Team = {
              id: Math.random().toString(36).substr(2, 9),
              name: teamData.name,
              specialization: teamData.specialization,
              location: teamData.location,
              leaderId: currentUser.id,
              memberIds: [currentUser.id, ...teamData.invitedMembers.map((m: User) => m.id)],
              members: [
                  { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl, role: 'Leader', verified: currentUser.verified },
                  ...teamData.invitedMembers.map((m: User) => ({ id: m.id, name: m.name, avatarUrl: m.avatarUrl, role: 'Member', verified: m.verified }))
              ],
              teamTQ: currentUser.tqScore, // Avg logic skipped for simplicity
              completedProjects: 0,
              rating: 0,
              topSkills: [teamData.specialization],
              synergyScore: 85,
              description: `Specialized in ${teamData.specialization}`
          };
          list.push(newTeam);
          set(KEYS.TEAMS, list);
          return newTeam;
      },
      update: (id: string, updates: Partial<Team>) => {
          const list = get<Team>(KEYS.TEAMS);
          const idx = list.findIndex(t => t.id === id);
          if (idx !== -1) {
              list[idx] = { ...list[idx], ...updates };
              set(KEYS.TEAMS, list);
              return list[idx];
          }
          throw new Error("Team not found");
      },
      removeMember: (teamId: string, memberId: string) => {
          const list = get<Team>(KEYS.TEAMS);
          const idx = list.findIndex(t => t.id === teamId);
          if (idx !== -1) {
              list[idx].memberIds = list[idx].memberIds.filter(id => id !== memberId);
              list[idx].members = list[idx].members?.filter(m => m.id !== memberId);
              set(KEYS.TEAMS, list);
              return list[idx];
          }
          throw new Error("Team not found");
      },
      delete: (teamId: string) => {
          const list = get<Team>(KEYS.TEAMS).filter(t => t.id !== teamId);
          set(KEYS.TEAMS, list);
      }
  },
  tasks: {
      getByProject: (projectId: string) => get<Task>(KEYS.TASKS).filter(t => t.projectId === projectId),
      create: (task: Partial<Task>) => {
          const list = get<Task>(KEYS.TASKS);
          const newTask = {
              id: Math.random().toString(36).substr(2, 9),
              status: 'Todo',
              createdAt: new Date().toISOString(),
              ...task
          } as Task;
          list.push(newTask);
          set(KEYS.TASKS, list);
          return newTask;
      },
      updateStatus: (taskId: string, status: string) => {
          const list = get<Task>(KEYS.TASKS);
          const t = list.find(task => task.id === taskId);
          if (t) t.status = status as any;
          set(KEYS.TASKS, list);
      },
      delete: (taskId: string) => {
          const list = get<Task>(KEYS.TASKS).filter(t => t.id !== taskId);
          set(KEYS.TASKS, list);
      }
  },
  chats: {
      getRooms: (userId: string) => get<ChatRoom>(KEYS.CHATS).filter(r => r.participants.includes(userId)),
      getOrCreateRoom: (userId: string, partnerId: string, partnerDetails: any, projectId?: string) => {
          const list = get<ChatRoom>(KEYS.CHATS);
          let room = list.find(r => r.participants.includes(userId) && r.participants.includes(partnerId) && (!projectId || r.projectId === projectId));
          
          if (!room) {
              const currentUser = api.auth.getCurrentUser();
              room = {
                  id: Math.random().toString(36).substr(2, 9),
                  participants: [userId, partnerId],
                  participantDetails: [
                      { id: userId, name: currentUser?.name || 'User', avatarUrl: currentUser?.avatarUrl || '', role: currentUser?.role || UserRole.FREELANCER, online: true },
                      { id: partnerId, name: partnerDetails.name, avatarUrl: partnerDetails.avatarUrl, role: partnerDetails.role, online: false }
                  ],
                  projectId
              };
              list.push(room);
              set(KEYS.CHATS, list);
          }
          return room;
      },
      getMessages: (roomId: string) => get<ChatMessage>(KEYS.MESSAGES).filter(m => m.roomId === roomId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      sendMessage: (roomId: string, senderId: string, senderName: string, text: string) => {
          const msgs = get<ChatMessage>(KEYS.MESSAGES);
          const newMsg = {
              id: Math.random().toString(36).substr(2, 9),
              roomId,
              senderId,
              senderName,
              text,
              timestamp: new Date().toISOString(),
              status: 'sent'
          } as ChatMessage;
          msgs.push(newMsg);
          set(KEYS.MESSAGES, msgs);

          // Update Room Last Message
          const rooms = get<ChatRoom>(KEYS.CHATS);
          const r = rooms.find(room => room.id === roomId);
          if (r) {
              r.lastMessage = text;
              r.lastMessageTimestamp = newMsg.timestamp;
              set(KEYS.CHATS, rooms);
          }
          
          // Trigger subscription callback if any (Simple Event Bus)
          window.dispatchEvent(new CustomEvent('chat-message', { detail: newMsg }));
      },
      subscribe: (callback: (msg: ChatMessage) => void) => {
          const handler = (e: any) => callback(e.detail);
          window.addEventListener('chat-message', handler);
          return () => window.removeEventListener('chat-message', handler);
      }
  },
  disputes: {
      getAll: () => get<Dispute>(KEYS.DISPUTES),
      create: (dispute: Partial<Dispute>) => {
          const list = get<Dispute>(KEYS.DISPUTES);
          const currentUser = api.auth.getCurrentUser();
          const newDispute = {
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date().toISOString(),
              raisedBy: currentUser?.name || 'Unknown',
              raisedById: currentUser?.id,
              status: 'Open',
              ...dispute
          } as Dispute;
          list.push(newDispute);
          set(KEYS.DISPUTES, list);
          return newDispute;
      },
      resolve: (id: string) => {
          const list = get<Dispute>(KEYS.DISPUTES);
          const index = list.findIndex(d => d.id === id);
          if (index !== -1) {
              list[index].status = 'Resolved';
              set(KEYS.DISPUTES, list);
              
              // Notify User about resolution
              const notifs = get<Notification>(KEYS.NOTIFICATIONS);
              notifs.push({
                  id: Math.random().toString(36).substr(2, 9),
                  userId: list[index].raisedById,
                  type: 'SYSTEM',
                  title: 'Issue Resolved',
                  message: `Your dispute regarding "${list[index].gigTitle}" has been resolved by the admin team.`,
                  timestamp: new Date().toISOString(),
                  read: false,
                  link: '#'
              });
              set(KEYS.NOTIFICATIONS, notifs);
          }
      }
  },
  subscriptions: {
      createRequest: (req: any) => {
          const list = get<SubscriptionRequest>(KEYS.SUBSCRIPTIONS);
          const currentUser = api.auth.getCurrentUser();
          const newReq = {
              id: Math.random().toString(36).substr(2, 9),
              userId: currentUser?.id,
              userName: currentUser?.name,
              createdAt: new Date().toISOString(),
              status: 'Reviewing',
              ...req
          } as SubscriptionRequest;
          list.push(newReq);
          set(KEYS.SUBSCRIPTIONS, list);
          
          // Update User status
          if (currentUser) {
              api.users.updateProfile(currentUser.id, { subscriptionStatus: 'Pending' });
          }
      }
  },
  ai: {
      getMatchmakingRecommendations: (specialization: string, location: string, excludeIds: string[]) => {
          // Mock recommendation logic
          const freelancers = get<User>(KEYS.USERS).filter(u => u.role === UserRole.FREELANCER && !excludeIds.includes(u.id));
          return freelancers.map(f => ({
              ...f,
              matchScore: Math.floor(Math.random() * 30) + 70 // Random 70-100 score
          })).sort((a,b) => b.matchScore - a.matchScore).slice(0, 5);
      }
  }
};
