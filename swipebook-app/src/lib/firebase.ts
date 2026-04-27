import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let _db: Database | null = null;

function initDb(): Database {
  if (!_db) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    _db = getDatabase(app);
  }
  return _db;
}

// Lazy proxy: defers getDatabase() until first use so Next.js build
// doesn't crash when NEXT_PUBLIC_* env vars are absent at build time.
export const db: Database = new Proxy({} as Database, {
  get(_, prop) {
    const realDb = initDb();
    const value = Reflect.get(realDb, prop, realDb);
    return typeof value === 'function' ? value.bind(realDb) : value;
  },
});
