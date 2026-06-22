import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getUserSettingDocPath, getEnvironmentName } from './firestorePaths';
import { createAnonymousSessionExpiration } from './anonymousSessionLifecycle';

/**
 * Saves the last visited path to Firestore or localStorage for the given user.
 */
export async function saveLastPath(uid: string, isAnonymous: boolean, path: string): Promise<void> {
  if (!uid || !path) return;
  
  if (!isFirebaseConfigured) {
    try {
      localStorage.setItem(`mock_gpa_pref_lastPath_${uid}`, path);
    } catch (e) {
      console.warn('Failed to save last path to localStorage:', e);
    }
    return;
  }

  try {
    const env = getEnvironmentName(import.meta.env.MODE);
    const docPath = getUserSettingDocPath(env, uid, isAnonymous, 'navigation');
    const docRef = doc(db, docPath);
    const now = new Date();
    const payload: any = {
      lastPath: path,
      updatedAt: serverTimestamp()
    };

    if (isAnonymous) {
      payload.createdAt = now.toISOString();
      payload.expiresAt = createAnonymousSessionExpiration(now).toISOString();
      payload.lastSeenAt = now.toISOString();
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (e) {
    console.warn('Failed to save last path to Firestore:', e);
  }
}

/**
 * Retrieves the last visited path from Firestore or localStorage for the given user.
 */
export async function getLastPath(uid: string, isAnonymous: boolean): Promise<string | null> {
  if (!uid) return null;
  
  if (!isFirebaseConfigured) {
    try {
      return localStorage.getItem(`mock_gpa_pref_lastPath_${uid}`) || null;
    } catch (e) {
      return null;
    }
  }

  try {
    const env = getEnvironmentName(import.meta.env.MODE);
    const docPath = getUserSettingDocPath(env, uid, isAnonymous, 'navigation');
    const docRef = doc(db, docPath);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().lastPath) {
      return docSnap.data().lastPath;
    }
  } catch (e) {
    console.warn('Failed to read last path from Firestore:', e);
  }
  return null;
}

