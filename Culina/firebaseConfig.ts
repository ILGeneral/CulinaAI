import { Platform } from 'react-native'
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'
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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Auth with proper persistence on native (Expo Go) and web
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })

export const db = getFirestore(app)
export const storage = getStorage(app)