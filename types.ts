
export enum UserRole {
  FREELANCER = 'FREELANCER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export type SubscriptionTier = 'Free' | 'Rising' | 'Elite';
export type SubscriptionStatus = 'Active' | 'Pending' | 'Expired';

export type TQTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type NotificationType = 'SQUAD_INVITE' | 'PAYMENT' | 'SECURITY' | 'SYSTEM' | 'OFFER' | 'GIG_HIRE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  data?: any; 
}

export interface TQBreakdown {
  profileStrength: number; 
  identityVerification: number; 
  emailVerificationBonus: number;
  gigHistory: number; 
  ratingPerformance: number; 
  responseTime: number; 
}

export interface CorporateTrustBreakdown {
  paymentVelocity: number;
  escrowHealth: number;
  disputeRatio: number;
  workerSentiment: number;
}

export interface WorkMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'link';
  caption?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  youtube?: string;
  instagram?: string;
  behance?: string;
  website?: string;
}

export interface Milestone {
  id: string;
  title: string;
  status: 'Pending' | 'In Review' | 'Completed';
  dueDate: string;
  amount: number;
  submission?: {
    submittedAt: string;
    summary: string;
    links: string[];
    attachments: {
      name: string;
      type: 'image' | 'video';
    }[];
  };
  aiReview?: {
    verdict: 'approved' | 'changes-requested';
    summary: string;
    strengths: string[];
    missingItems: string[];
    employerChecklist: string[];
    reviewedAt: string;
  };
  employerReview?: {
    status: 'approved' | 'changes-requested';
    notes?: string;
    reviewedAt: string;
  };
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string; 
  userTag?: string; 
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  
  tqScore: number;
  tqTier: TQTier;
  tqBreakdown: TQBreakdown;
  
  skills: string[];
  location: string;
  title: string;
  bio: string;
  verified: boolean;
  joinedAt: string;
  lastSeen?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  headline?: string;
  website?: string;
  address?: string; 
  phone?: string;
  
  legalName?: string;
  aadhaarMasked?: string;
  eshramId?: string;
  panNumber?: string;
  videoKycUrl?: string; 
  videoKycVerified?: boolean;
  yearsExperience?: number;
  localReferenceContact?: string; 
  upiId?: string;
  bankDetails?: string; 
  pincode?: string;
  antiAbandonmentPolicy?: boolean;
  microInsuranceOptIn?: boolean;
  portfolioUrl?: string; 
  socialLinks?: SocialLinks;
  workGallery?: WorkMedia[];
  hourlyRate?: number; 

  registeredBusinessName?: string;
  gstin?: string;
  udyamRegistration?: string;
  pocName?: string;
  pocDesignation?: string;
  officialEmail?: string;
  walletBalance?: number;
  industry?: string;
  corporateTrustScore?: number; 
  corporateTrustBreakdown?: CorporateTrustBreakdown;
  avgPayoutTime?: string;
  verificationSuccessRate?: number;

  completedGigsCount?: number;
  averageRating?: number;
  avgResponseDelayHours?: number;
  emailVerified?: boolean;
  aadharVerified?: boolean;
  verificationSubmitted?: boolean;
  verificationSubmittedAt?: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  type: 'Fixed' | 'Hourly';
  postedBy: string; 
  postedById: string; 
  skillsRequired: string[];
  deadline: string;
  isTeamAllowed: boolean;
  minTQ: number;
  status: 'Open' | 'In Progress' | 'Completed';
  paymentStatus?: 'Unpaid' | 'Paid' | 'Escrowed'; 
  createdAt: string;
  assignedTo?: string;
  assignedToName?: string;
  completedAt?: string;
  clientRating?: number;
  clientFeedback?: string;
  milestones?: Milestone[];
}

export interface Bid {
  id: string;
  gigId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerTQ: number;
  amount: number;
  days: number;
  proposal: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  bidDate: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatRoom {
  id: string;
  participants: string[]; // User IDs
  participantDetails: {
    id: string;
    name: string;
    avatarUrl: string;
    role: UserRole;
    online: boolean;
  }[];
  lastMessage?: string;
  lastMessageTimestamp?: string;
  projectId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Leader' | 'Member';
  verified: boolean;
  specialty?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  specialization?: string; 
  location?: string; 
  leaderId: string;
  memberIds: string[];
  members?: TeamMember[]; 
  teamTQ: number;
  completedProjects: number;
  rating: number;
  topSkills: string[];
  isPrivate?: boolean; 
  synergyScore?: number; 
  status?: 'Available' | 'On_Gig'; 
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string; 
  amount: number; 
  period: string;
  target: 'Freelancer' | 'Employer';
  features: string[];
  isPopular?: boolean;
  tier: SubscriptionTier;
  commission: string;
}

export interface CertificationTrack {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirements: string[];
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Certified';
  tqBoost: number;
}

export interface AdminStats {
  totalUsers: number;
  totalGigs: number;
  activeContracts: number;
  totalRevenue: number;
  verificationQueue: number;
}

export interface Dispute {
  id: string;
  gigId: string;
  gigTitle: string;
  raisedBy: string;
  raisedById: string;
  roomId?: string; // Linked Chat Room
  reason: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userName: string;
  planSelected: SubscriptionTier;
  amount: number;
  utrNumber: string;
  proofImageUrl: string; 
  status: 'Reviewing' | 'Approved' | 'Rejected';
  createdAt: string;
}