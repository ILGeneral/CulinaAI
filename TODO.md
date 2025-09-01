# Firebase Initialization Fix

## Problem
Firebase is being initialized multiple times causing "Firebase: Error (auth/already-initialized)" error.

## Root Cause
- `firebaseConfig.ts` initializes Firebase app and exports services
- `authPersistence.ts` also initializes Firebase app separately
- When components import from both files, Firebase gets initialized twice

## Solution
Modify `authPersistence.ts` to use the already initialized Firebase app from `firebaseConfig.ts` instead of creating a new one.

## Steps
- [x] Update `authPersistence.ts` to import and reuse the Firebase app from `firebaseConfig.ts`
- [x] Remove duplicate `initializeApp` call in `authPersistence.ts`
- [x] Export `app` from `firebaseConfig.ts`
- [x] Fix import errors in affected files (RecipeGenerator.tsx, onboarding.tsx, Settings.tsx)
- [x] Simplify Firebase Auth initialization to avoid "class definition" error
- [x] Test the fix by running the app
