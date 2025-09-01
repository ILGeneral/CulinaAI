import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

// Get Firebase Auth instance from the already initialized app
export const auth = getAuth(app);
