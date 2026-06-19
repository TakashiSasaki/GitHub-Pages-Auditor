import fs from 'fs';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
initializeApp({ projectId: config.projectId || config.firebaseProjectId });
const db = getFirestore(undefined, config.firestoreDatabaseId);

async function run() {
  try {
    const docRef = db.collection('test').doc('test-doc');
    await docRef.set({ hello: 'world' });
    console.log("Success! set doc");
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}
run();
