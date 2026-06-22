import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { getGithubTokenDocPath, getEnvironmentName, getUserSettingDocPath } from './lib/firestorePaths';
import { createAnonymousSessionExpiration } from './lib/anonymousSessionLifecycle';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  hasStoredPat: boolean;
  savePatToFirestore: (pat: string) => Promise<void>;
  getStoredPat: () => Promise<string | null>;
  getStoredTokenType: () => Promise<'classic' | 'fine_grained' | 'unknown' | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStoredPat, setHasStoredPat] = useState(false);

  const getDocRef = (uid: string, isAnonymous: boolean) => {
    if (!isFirebaseConfigured) return null;
    const env = getEnvironmentName(import.meta.env.MODE);
    const fullPath = getGithubTokenDocPath(env, uid, isAnonymous);
    return doc(db, fullPath);
  };

  const getStoredPat = async (): Promise<string | null> => {
    if (!user) return null;
    if (!isFirebaseConfigured) {
      return localStorage.getItem(`mock_gpa_pat_${user.uid}`) || null;
    }
    try {
      const docRef = getDocRef(user.uid, user.isAnonymous);
      if (!docRef) return null;
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().token) {
        return docSnap.data().token;
      }
    } catch(e: any) {
      const isOffline = e instanceof Error && (e.message.includes('offline') || e.message.includes('unavailable') || e.message.includes('Failed to get document'));
      if (isOffline) {
        console.warn("Could not fetch PAT from Firestore because the client is offline. Falling back to in-memory/uncached state.");
      } else {
        console.error("Failed to fetch PAT from Firestore:", e);
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Load mock session from local storage if available
      const stored = localStorage.getItem('mock_gpa_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mockUser = {
            ...parsed,
            getIdToken: async () => 'dummy-token'
          };
          setUser(mockUser as any);
        } catch (e) {
          localStorage.removeItem('mock_gpa_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setHasStoredPat(false);
      return;
    }
    const checkPatStatus = async () => {
      const pat = await getStoredPat();
      setHasStoredPat(!!pat);
    };
    checkPatStatus();
  }, [user]);

  const savePatToFirestore = async (pat: string) => {
    if (!user) throw new Error('Must be logged in');
    
    // First validate with backend using either a valid Firebase token or dummy-token fallback
    let token = 'dummy-token';
    if (isFirebaseConfigured) {
      token = await user.getIdToken();
    }
    
    const res = await fetch('/api/pat/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pat: pat.trim() })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.details || errData.error || 'Failed to validate PAT');
    }

    if (!isFirebaseConfigured) {
      const derivedType = pat.startsWith('github_pat_') ? 'fine_grained' : (pat.startsWith('ghp_') ? 'classic' : 'unknown');
      localStorage.setItem(`mock_gpa_pat_${user.uid}`, pat.trim());
      localStorage.setItem(`mock_gpa_token_type_${user.uid}`, derivedType);
      setHasStoredPat(true);
      return;
    }

    // Since validation succeeded, save directly to Firestore
    try {
      const now = new Date();
      const docRef = getDocRef(user.uid, user.isAnonymous);
      if (!docRef) throw new Error('Firestore was requested but ref is null</h4>');
      const tokenPayload: any = {
        token: pat,
        updatedAt: serverTimestamp()
      };

      if (user.isAnonymous) {
        tokenPayload.createdAt = now.toISOString();
        tokenPayload.expiresAt = createAnonymousSessionExpiration(now).toISOString();
        tokenPayload.lastSeenAt = now.toISOString();
      }

      await setDoc(docRef, tokenPayload);

      // Save token metadata as a separate non-secret document under user settings
      const env = getEnvironmentName(import.meta.env.MODE);
      const metadataPath = getUserSettingDocPath(env, user.uid, user.isAnonymous, 'tokenMetadata');
      const metadataDocRef = doc(db, metadataPath);
      const derivedType = pat.startsWith('github_pat_') ? 'fine_grained' : (pat.startsWith('ghp_') ? 'classic' : 'unknown');
      const metadataPayload: any = {
        tokenType: derivedType,
        updatedAt: serverTimestamp()
      };

      if (user.isAnonymous) {
        metadataPayload.createdAt = now.toISOString();
        metadataPayload.expiresAt = createAnonymousSessionExpiration(now).toISOString();
        metadataPayload.lastSeenAt = now.toISOString();
      }

      await setDoc(metadataDocRef, metadataPayload);

      setHasStoredPat(true);
    } catch (e: any) {
      console.error("Failed to save to Firestore:", e);
      throw new Error("Failed to save to Firestore: " + e.message);
    }
  };

  const getStoredTokenType = async (): Promise<'classic' | 'fine_grained' | 'unknown' | null> => {
    if (!user) return null;
    if (!isFirebaseConfigured) {
      return (localStorage.getItem(`mock_gpa_token_type_${user.uid}`) as any) || null;
    }
    try {
      const env = getEnvironmentName(import.meta.env.MODE);
      const metadataPath = getUserSettingDocPath(env, user.uid, user.isAnonymous, 'tokenMetadata');
      const docRef = doc(db, metadataPath);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().tokenType) {
        return docSnap.data().tokenType;
      }
    } catch (e: any) {
      const isOffline = e instanceof Error && (e.message.includes('offline') || e.message.includes('unavailable') || e.message.includes('Failed to get document'));
      if (isOffline) {
        console.warn("Could not fetch token metadata because the client is offline.");
      } else {
        console.error("Failed to fetch token metadata:", e);
      }
    }
    return null;
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: 'mock-google-user',
        isAnonymous: false,
        displayName: 'Google Demo User',
        email: 'demo@example.com'
      };
      localStorage.setItem('mock_gpa_user', JSON.stringify(mockUser));
      const mockUserObj = {
        ...mockUser,
        getIdToken: async () => 'dummy-token'
      };
      setUser(mockUserObj as any);
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInAsGuest = async () => {
    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: 'anonymous-guest',
        isAnonymous: true,
        displayName: 'Guest User',
        email: null
      };
      localStorage.setItem('mock_gpa_user', JSON.stringify(mockUser));
      const mockUserObj = {
        ...mockUser,
        getIdToken: async () => 'dummy-token'
      };
      setUser(mockUserObj as any);
      return;
    }
    await signInAnonymously(auth);
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem('mock_gpa_user');
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, logout, hasStoredPat, savePatToFirestore, getStoredPat, getStoredTokenType }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

