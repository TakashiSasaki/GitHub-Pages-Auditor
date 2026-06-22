import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Use import.meta.glob to optionally import the config without breaking the build if missing
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const firebaseConfig = (configs['../../firebase-applet-config.json'] as any)?.default;

const hasVal = (val: any) => typeof val === 'string' && val.trim() !== '' && !val.includes('PLACEHOLDER') && !val.includes('YOUR-');

export const isFirebaseConfigured = !!(firebaseConfig && 
  hasVal(firebaseConfig.apiKey) && 
  hasVal(firebaseConfig.projectId) && 
  hasVal(firebaseConfig.appId));

let app: any = null;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId;
    db = getFirestore(app, dbId);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { app, db, auth };
