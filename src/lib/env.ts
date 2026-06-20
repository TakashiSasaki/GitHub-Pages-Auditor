import firebaseConfig from '../../firebase-applet-config.json';

export interface FrontendEnvValidation {
  valid: boolean;
  missingFields: string[];
}

/**
 * Validates the loaded Firebase Configuration from the environment's applet config.
 */
export function validateFirebaseConfigObject(config: any): FrontendEnvValidation {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields: string[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, missingFields: ['Config is missing or not a valid object'] };
  }

  const hasVal = (val: any) => typeof val === 'string' && val.trim() !== '' && !val.includes('PLACEHOLDER') && !val.includes('YOUR-');

  for (const field of required) {
    const value = config[field as keyof typeof config];
    if (!hasVal(value)) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

export function validateFrontendFirebaseConfig(): FrontendEnvValidation {
  return validateFirebaseConfigObject(firebaseConfig);
}
