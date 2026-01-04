import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyATEghs2wYFg5cyR3q_WAucbTS8f-mjAaI',
  authDomain: 'lowkeyhigh-f578b.firebaseapp.com',
  projectId: 'lowkeyhigh-f578b',
  storageBucket: 'lowkeyhigh-f578b.firebasestorage.app',
  messagingSenderId: '685773732412',
  appId: '1:685773732412:web:4ff2adac3dd7b9abc82139',
  measurementId: 'G-WZVMZBTJGY'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

let analyticsPromise: Promise<void> | null = null;

const initAnalytics = () => {
  if (typeof window === 'undefined' || analyticsPromise) return analyticsPromise;
  analyticsPromise = isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      /* ignore analytics failures */
    });
  return analyticsPromise;
};

initAnalytics();

export { app, db };
