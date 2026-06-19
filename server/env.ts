import fs from 'fs';
import path from 'path';

export interface BackendEnv {
  NODE_ENV: string;
  ALLOW_DUMMY_AUTH: boolean;
  hasFirebaseConfig: boolean;
  projectId: string | null;
}

/**
 * Validates the backend runtime environment, checking dummy auth gating,
 * Firebase config status, and initialization capability.
 */
export function validateBackendEnv(): BackendEnv {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const ALLOW_DUMMY_AUTH = process.env.ALLOW_DUMMY_AUTH === 'true';

  let hasFirebaseConfig = false;
  let projectId: string | null = null;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      projectId = config.projectId || config.firebaseProjectId || null;
      if (projectId) {
        hasFirebaseConfig = true;
      }
    }
  } catch (error) {
    console.warn("Could not read firebase-applet-config.json", error);
  }

  // Validation warnings/logs
  if (NODE_ENV === 'production') {
    if (!hasFirebaseConfig) {
      console.warn("WARNING: Running in production but firebase-applet-config.json is missing or invalid. Firebase ID Token verification will fail.");
    }
  } else {
    if (ALLOW_DUMMY_AUTH) {
      console.log("INFO: ALLOW_DUMMY_AUTH is enabled. 'dummy-token' is permitted for development/testing.");
    }
  }

  return {
    NODE_ENV,
    ALLOW_DUMMY_AUTH,
    hasFirebaseConfig,
    projectId,
  };
}
