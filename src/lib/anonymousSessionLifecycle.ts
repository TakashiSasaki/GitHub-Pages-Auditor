/**
 * Anonymous Session Lifecycle Helper Module
 */

// Default anonymous session TTL: 7 days in milliseconds
export const ANONYMOUS_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Parses any date-like input safely into a Date object or returns null if invalid.
 */
export function parseExpirationTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }
  if (typeof timestamp === 'number') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  // If we receive a Firestore timestamp object { seconds, nanoseconds }
  if (timestamp && typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
    const d = new Date(timestamp.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Creates an expiration Date based on creation date and TTL.
 */
export function createAnonymousSessionExpiration(createdAt: Date | number | string): Date {
  const parsed = parseExpirationTimestamp(createdAt) || new Date();
  return new Date(parsed.getTime() + ANONYMOUS_SESSION_TTL_MS);
}

/**
 * Evaluates whether an anonymous session is expired.
 */
export function isAnonymousSessionExpired(now: Date | number | string, expiresAt: Date | number | string): boolean {
  const parsedNow = parseExpirationTimestamp(now) || new Date();
  const parsedExpiresAt = parseExpirationTimestamp(expiresAt);
  if (!parsedExpiresAt) return false;
  return parsedNow.getTime() >= parsedExpiresAt.getTime();
}
