<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GigsBharat Web App

This repository contains the Vite + React frontend for GigsBharat.

## Run Locally

Prerequisites: Node.js 20+

1. Install dependencies:
   `npm install`
2. Copy env template:
   `copy .env.example .env.local`
3. Fill Firebase values in `.env.local`.
4. Run the app:
   `npm run dev`

## Firestore Setup For Worker Profiles + Trust Quotient

This project now includes Firestore integration for worker profile storage.

Created files:
- `services/firestore.ts` - Firebase app + Firestore initialization
- `services/workerProfiles.ts` - typed repository for CRUD and TQ updates
- `firestore.rules` - baseline security rules (tighten as your auth model evolves)
- `.env.example` - required Firebase env variables

### 1) Create Firebase project and Firestore

1. Go to Firebase Console and create/select your project.
2. Create a Web App inside the project.
3. Enable Firestore Database in production mode.
4. Copy config values into `.env.local` using keys from `.env.example`.

### 2) Deploy Firestore rules

Use Firebase CLI to deploy `firestore.rules`:

`firebase deploy --only firestore:rules`

### 3) Data model

Collection: `workerProfiles`

Sample document shape:

```json
{
  "id": "worker_123",
  "name": "Priya Patil",
  "email": "priya@example.com",
  "role": "FREELANCER",
  "city": "Pune",
  "title": "Frontend Developer",
  "skills": ["React", "TypeScript"],
  "verified": true,
  "trustQuotient": {
    "score": 88,
    "tier": "Gold",
    "breakdown": {
      "profileStrength": 90,
      "identityVerification": 100,
      "gigHistory": 82,
      "ratingPerformance": 86,
      "responseTime": 80
    }
  }
}
```

### 4) Repository usage

```ts
import { workerProfilesRepository } from './services/workerProfiles';

await workerProfilesRepository.upsertWorkerProfile(profile);
const profile = await workerProfilesRepository.getWorkerProfile('worker_123');
const puneWorkers = await workerProfilesRepository.listWorkersByCity('Pune');
await workerProfilesRepository.updateTrustQuotient('worker_123', trustQuotient);
```
