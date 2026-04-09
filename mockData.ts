
import { UserRole, PricingPlan } from '../types';

export const MOCK_TEAMS = [];

export const SUBSCRIPTION_PLANS: PricingPlan[] = [
  {
    id: 'p1',
    name: 'Free',
    price: '₹0',
    amount: 0,
    period: '/mo',
    target: 'Freelancer',
    tier: 'Free',
    commission: '10%',
    features: ['10% Commission', 'Standard Visibility', 'Basic TQ Badge', '5 Bids per month']
  },
  {
    id: 'p2',
    name: 'Rising',
    price: '₹299',
    amount: 299,
    period: '/mo',
    target: 'Freelancer',
    tier: 'Rising',
    commission: '5%',
    features: ['5% Commission', 'Priority Listing', 'Pro Badge', '20 Bids per month', 'Team Access'],
    isPopular: true
  },
  {
    id: 'p3',
    name: 'Elite',
    price: '₹999',
    amount: 999,
    period: '/mo',
    target: 'Freelancer',
    tier: 'Elite',
    commission: '0%',
    features: ['0% Commission', 'Platinum TQ Badge', 'Unlimited Bids', 'Dedicated Manager']
  },
  // Employer Plans (Kept simple for now as prompt focused on Freelancer)
  {
    id: 'p4',
    name: 'Starter',
    price: 'Free',
    amount: 0,
    period: 'Forever',
    target: 'Employer',
    tier: 'Free',
    commission: '0%',
    features: ['Post 1 Gig', 'Basic Search']
  },
  {
    id: 'p5',
    name: 'Enterprise',
    price: '₹4,999',
    amount: 4999,
    period: '/mo',
    target: 'Employer',
    tier: 'Elite',
    commission: '0%',
    features: ['Unlimited Gigs', 'Access to Teams', 'Advanced Filtering', 'Dedicated Account Manager'],
    isPopular: true
  }
];

export const CERTIFICATION_TRACKS = [
  {
    id: 'c1',
    name: 'Full Stack Developer',
    description: 'Validate your expertise in MERN stack development.',
    status: 'Not Started',
    requirements: ['Pass React Assessment', 'Pass Node.js Assessment', 'Complete 1 Project'],
    tqBoost: 15
  },
  {
    id: 'c2',
    name: 'UI/UX Designer',
    description: 'Prove your skills in user interface and experience design.',
    status: 'In Progress',
    requirements: ['Portfolio Review', 'Figma Assessment'],
    tqBoost: 10
  }
];

export const ADMIN_STATS = {
  totalUsers: 1250,
  totalGigs: 340,
  activeContracts: 85,
  totalRevenue: 1500000,
  verificationQueue: 12
};

export const MOCK_FREELANCERS = [
  {
    id: 'f1',
    name: 'Rahul Sharma',
    role: 'Frontend Developer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=random',
    tqScore: 85,
    skills: ['React', 'TypeScript', 'Tailwind']
  },
  {
    id: 'f2',
    name: 'Priya Patel',
    role: 'UX Designer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Patel&background=random',
    tqScore: 92,
    verified: true,
    skills: ['Figma', 'Adobe XD', 'User Research']
  },
  {
    id: 'f3',
    name: 'Amit Singh',
    role: 'Backend Developer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Amit+Singh&background=random',
    tqScore: 78,
    skills: ['Node.js', 'PostgreSQL', 'Docker']
  },
  {
    id: 'f4',
    name: 'Sneha Gupta',
    role: 'Full Stack',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=random',
    tqScore: 88,
    verified: true,
    skills: ['MERN', 'Next.js', 'AWS']
  }
];
