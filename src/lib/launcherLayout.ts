import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getUserSettingDocPath } from './firestorePaths';

export interface LauncherLayoutDoc {
  schemaVersion: string;
  layoutMode: string;
  orderedSiteIds: string[];
  hiddenSiteIds: string[];
  updatedAt?: any;
}

export async function getLauncherLayout(uid: string, isAnonymous: boolean, env: string): Promise<LauncherLayoutDoc | null> {
  if (!env) throw new Error("Environment string must be explicitly provided");
  const path = getUserSettingDocPath(env, uid, isAnonymous, 'launcherLayout');
  try {
    const d = await getDoc(doc(db, path));
    if (d.exists()) {
      return d.data() as LauncherLayoutDoc;
    }
  } catch (e) {
    console.error("Failed to read launcher layout", e);
  }
  return null;
}

export async function saveLauncherLayout(uid: string, isAnonymous: boolean, orderedSiteIds: string[], env: string): Promise<void> {
  if (!env) throw new Error("Environment string must be explicitly provided");
  const path = getUserSettingDocPath(env, uid, isAnonymous, 'launcherLayout');
  const payload: LauncherLayoutDoc = {
    schemaVersion: 'github-pages-auditor.launcherLayout.v1',
    layoutMode: 'ordered_grid',
    orderedSiteIds,
    hiddenSiteIds: [],
    updatedAt: serverTimestamp()
  };

  // Throw errors here so the UI can catch and warn the user
  await setDoc(doc(db, path), payload);
}
