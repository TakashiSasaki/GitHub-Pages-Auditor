import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

let firestoreDatabaseId: string | undefined = undefined;
try {
  if (fs.existsSync('./firebase-applet-config.json')) {
    const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
    firestoreDatabaseId = config.firestoreDatabaseId;
  }
} catch (e) {
  // Ignore
}

function getDb() {
  if (firestoreDatabaseId) {
    return getFirestore(firestoreDatabaseId);
  }
  return getFirestore();
}

// githubPagesAuditorV1/{environment}/users/{uid}/githubTokens/main
// githubPagesAuditorV1/{environment}/anonymousSessions/{uid}/githubTokens/main

export async function savePatToFirestore(uid: string, isAnonymous: boolean, pat: string) {
  const db = getDb();
  
  const basePath = isAnonymous 
    ? `githubPagesAuditorV1/${ENVIRONMENT}/anonymousSessions/${uid}`
    : `githubPagesAuditorV1/${ENVIRONMENT}/users/${uid}`;

  const tokenRef = db.doc(`${basePath}/githubTokens/main`);
  
  await tokenRef.set({
    uid,
    token: pat,
    tokenStorageVersion: 'v1',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // For anonymous, let's also ensure the session has an expiration
  if (isAnonymous) {
    const sessionRef = db.doc(basePath);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    await sessionRef.set({
      anonymousUid: uid,
      expiresAt: expiresAt.toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
}

export async function getPatFromFirestore(uid: string, isAnonymous: boolean): Promise<string | null> {
  const db = getDb();

  const basePath = isAnonymous 
    ? `githubPagesAuditorV1/${ENVIRONMENT}/anonymousSessions/${uid}`
    : `githubPagesAuditorV1/${ENVIRONMENT}/users/${uid}`;

  const tokenRef = db.doc(`${basePath}/githubTokens/main`);
  const docSnap = await tokenRef.get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data();
  if (data && data.token) {
    return data.token;
  }

  return null;
}

export async function deletePatFromFirestore(uid: string, isAnonymous: boolean) {
  const db = getDb();
  
  const basePath = isAnonymous 
    ? `githubPagesAuditorV1/${ENVIRONMENT}/anonymousSessions/${uid}`
    : `githubPagesAuditorV1/${ENVIRONMENT}/users/${uid}`;

  const tokenRef = db.doc(`${basePath}/githubTokens/main`);
  await tokenRef.delete();
}
