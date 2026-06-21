import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// Use import.meta.glob to optionally import the config without breaking the build if missing
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const firebaseConfig = (configs['../../firebase-applet-config.json'] as any)?.default;

const dummyConfig = {
  apiKey: "dummy-api-key-placeholder",
  authDomain: "dummy-auth-domain-placeholder",
  projectId: "dummy-project-id-placeholder",
  appId: "dummy-app-id-placeholder",
  firestoreDatabaseId: "dummy-db-id"
};

const hasVal = (val: any) => typeof val === 'string' && val.trim() !== '' && !val.includes('PLACEHOLDER') && !val.includes('YOUR-');

const isValidConfig = firebaseConfig && 
  hasVal(firebaseConfig.apiKey) && 
  hasVal(firebaseConfig.projectId) && 
  hasVal(firebaseConfig.appId);

const configToUse = isValidConfig ? firebaseConfig : dummyConfig;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = initializeApp(configToUse);
  const dbId = configToUse.firestoreDatabaseId;
  db = getFirestore(app, dbId);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase initialization failed, falling back to dummy config:", e);
  app = initializeApp(dummyConfig);
  db = getFirestore(app, dummyConfig.firestoreDatabaseId);
  auth = getAuth(app);
}

export { app, db, auth };
