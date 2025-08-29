import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBEbYISbd1UbET0gKieI6tyxHHVxmoOaL4',
  authDomain: 'culina-6ddb1.firebaseapp.com',
  projectId: 'culina-6ddb1',
  // ...other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);