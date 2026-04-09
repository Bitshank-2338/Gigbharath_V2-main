import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { UserRole } from '../types';
import { getDb } from './firestore';

export interface WorkerTrustQuotient {
  score: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  breakdown: {
    profileStrength: number;
    identityVerification: number;
    gigHistory: number;
    ratingPerformance: number;
    responseTime: number;
  };
}

export interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole.FREELANCER;
  city: string;
  title: string;
  skills: string[];
  bio?: string;
  avatarUrl?: string;
  verified: boolean;
  trustQuotient: WorkerTrustQuotient;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const COLLECTION_NAME = 'workerProfiles';

const getWorkerProfilesRef = () => collection(getDb(), COLLECTION_NAME);

export const workerProfilesRepository = {
  async upsertWorkerProfile(profile: WorkerProfile): Promise<void> {
    const profileRef = doc(getWorkerProfilesRef(), profile.id);

    await setDoc(
      profileRef,
      {
        ...profile,
        role: UserRole.FREELANCER,
        updatedAt: serverTimestamp(),
        createdAt: profile.createdAt ?? serverTimestamp()
      },
      { merge: true }
    );
  },

  async getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    const profileRef = doc(getWorkerProfilesRef(), workerId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as WorkerProfile;
  },

  async listWorkersByCity(city: string, take = 25): Promise<WorkerProfile[]> {
    const q = query(
      getWorkerProfilesRef(),
      where('city', '==', city),
      orderBy('trustQuotient.score', 'desc'),
      limit(take)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as WorkerProfile);
  },

  async updateTrustQuotient(workerId: string, trustQuotient: WorkerTrustQuotient): Promise<void> {
    const profileRef = doc(getWorkerProfilesRef(), workerId);

    await updateDoc(profileRef, {
      trustQuotient,
      updatedAt: serverTimestamp()
    });
  }
};
