import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  parseExpirationTimestamp,
  createAnonymousSessionExpiration,
  isAnonymousSessionExpired,
  ANONYMOUS_SESSION_TTL_MS
} from '../src/lib/anonymousSessionLifecycle.js';

describe('Anonymous Session Lifecycle Foundation', () => {
  describe('parseExpirationTimestamp', () => {
    it('returns Date directly when Date instance is supplied', () => {
      const now = new Date();
      const res = parseExpirationTimestamp(now);
      assert.ok(res instanceof Date);
      assert.strictEqual(res.getTime(), now.getTime());
    });

    it('parses valid ISO string representations', () => {
      const canonical = '2026-06-20T12:00:00.000Z';
      const res = parseExpirationTimestamp(canonical);
      assert.ok(res instanceof Date);
      assert.strictEqual(res.toISOString(), canonical);
    });

    it('parses raw epoch milliseconds', () => {
      const ms = 1781956800000;
      const res = parseExpirationTimestamp(ms);
      assert.ok(res instanceof Date);
      assert.strictEqual(res.getTime(), ms);
    });

    it('parses Firestore timestamp-like shapes ({ seconds, nanoseconds })', () => {
      const seconds = 1781956800;
      const res = parseExpirationTimestamp({ seconds, nanoseconds: 0 });
      assert.ok(res instanceof Date);
      assert.strictEqual(res.getTime(), seconds * 1000);
    });

    it('returns null on invalid parameters safely', () => {
      assert.strictEqual(parseExpirationTimestamp(null), null);
      assert.strictEqual(parseExpirationTimestamp(undefined), null);
      assert.strictEqual(parseExpirationTimestamp('invalid-date-string'), null);
      assert.strictEqual(parseExpirationTimestamp({}), null);
    });
  });

  describe('createAnonymousSessionExpiration', () => {
    it('generates expiration exactly 7 days after creation', () => {
      const now = new Date('2026-06-20T12:00:00.000Z');
      const expected = new Date(now.getTime() + ANONYMOUS_SESSION_TTL_MS);
      const res = createAnonymousSessionExpiration(now);
      assert.strictEqual(res.toISOString(), expected.toISOString());
    });

    it('gracefully handles invalid creation date and defaults to now + TTL', () => {
      const res = createAnonymousSessionExpiration('invalid');
      assert.ok(res instanceof Date);
      const timeDiff = res.getTime() - (Date.now() + ANONYMOUS_SESSION_TTL_MS);
      assert.ok(Math.abs(timeDiff) < 1000); // within 1 second of current time + TTL
    });
  });

  describe('isAnonymousSessionExpired', () => {
    it('returns false if now is before expiresAt', () => {
      const now = '2026-06-20T12:00:00.000Z';
      const expiresAt = '2026-06-21T12:00:00.000Z';
      assert.strictEqual(isAnonymousSessionExpired(now, expiresAt), false);
    });

    it('returns true if now is exactly on expiresAt', () => {
      const now = '2026-06-21T12:00:00.000Z';
      const expiresAt = '2026-06-21T12:00:00.000Z';
      assert.strictEqual(isAnonymousSessionExpired(now, expiresAt), true);
    });

    it('returns true if now is after expiresAt', () => {
      const now = '2026-06-22T12:00:00.000Z';
      const expiresAt = '2026-06-21T12:00:00.000Z';
      assert.strictEqual(isAnonymousSessionExpired(now, expiresAt), true);
    });

    it('returns false if expiresAt is invalid or missing', () => {
      assert.strictEqual(isAnonymousSessionExpired(new Date(), 'invalid'), false);
    });
  });
});
