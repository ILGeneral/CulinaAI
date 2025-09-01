import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
apiKey: "AIzaSyBEbYISbd1UbET0gKieI6tyxHHVxmoOaL4",
authDomain: "culina-6ddb1.firebaseapp.com",
projectId: "culina-6ddb1",
storageBucket: "culina-6ddb1.firebasestorage.app",
messagingSenderId: "288800555838",
appId: "1:288800555838:web:f057568109075fa8db626f",
measurementId: "G-Q4KCQXLBGT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)