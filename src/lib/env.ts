import firebaseConfig from '../../firebase-applet-config.json';

export interface FrontendEnvValidation {
  valid: boolean;
  missingFields: string[];
}

/**
 * Validates the loaded Firebase Configuration from the environment's applet config.
 */
export function validateFrontendFirebaseConfig(): FrontendEnvValidation {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields: string[] = [];

  if (!firebaseConfig || typeof firebaseConfig !== 'object') {
    return { valid: false, missingFields: ['firebase-applet-config.json is missing or not a valid JSON object'] };
  }

  for (const field of required) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}
