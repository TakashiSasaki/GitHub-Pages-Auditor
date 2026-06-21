import { describe, it } from 'node:test';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { isUrlSafe } from '../server/iconResolver.js';
import { getCacheId, isCacheExpired, toIconDataUrl } from '../src/lib/launcherIconCachePure.js';
import { getLauncherIconCacheCollectionPath, getLauncherIconCacheDocPath } from '../src/lib/firestorePaths.js';

describe('Launcher Icon Cache Unit and Path Diagnostics', () => {
  describe('isUrlSafe SSRF Protections', () => {
    it('accepts valid, safe public URLs', () => {
      assert.strictEqual(isUrlSafe('https://takashisasaki.github.io/assets/pwa-icon.png'), true);
      assert.strictEqual(isUrlSafe('http://example.com/favicon.ico'), true);
    });

    it('rejects loopback and localhost interfaces', () => {
      assert.strictEqual(isUrlSafe('http://localhost/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://127.0.0.1/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://127.255.0.1/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[::1]/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[0:0:0:0:0:0:0:1]/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[fe80::1]/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[fd00::100]/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[fc00::ab]/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://[fec0::3]/icon.png'), false);
      assert.strictEqual(isUrlSafe('https://[2001:db8::1]/icon.png'), true);
    });

    it('rejects known cloud metadata servers', () => {
      assert.strictEqual(isUrlSafe('http://metadata.google.internal/some-secret'), false);
      assert.strictEqual(isUrlSafe('http://169.254.169.254/latest/meta-data'), false);
      assert.strictEqual(isUrlSafe('http://169.254.25.25/meta'), false);
    });

    it('rejects private IPv4 subnets', () => {
      assert.strictEqual(isUrlSafe('http://10.0.1.5/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://172.16.88.2/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://172.31.254.254/icon.png'), false);
      assert.strictEqual(isUrlSafe('http://192.168.1.100/icon.png'), false);
    });

    it('rejects illegal protocols', () => {
      assert.strictEqual(isUrlSafe('ftp://unsafe.com/icon.png'), false);
      assert.strictEqual(isUrlSafe('javascript:alert(1)'), false);
      assert.strictEqual(isUrlSafe('data:image/svg+xml;utf8,<svg></svg>'), false);
    });

    it('rejects malformed hosts and garbage input', () => {
      assert.strictEqual(isUrlSafe('not-a-valid-url'), false);
      assert.strictEqual(isUrlSafe('http://[fe80::1/'), false);
    });
  });

  describe('Deterministic Icon Cache Key Generator', () => {
    it('produces a deterministic string for identical inputs', async () => {
      const key1 = await getCacheId('siteA', 'https://takashisasaki.github.io/icon.png');
      const key2 = await getCacheId('siteA', 'https://takashisasaki.github.io/icon.png');
      assert.strictEqual(typeof key1, 'string');
      assert.ok(key1.length > 5);
      assert.strictEqual(key1, key2);
    });

    it('produces distinct strings for different inputs', async () => {
      const keyA = await getCacheId('siteA', 'https://takashisasaki.github.io/icon.png');
      const keyB = await getCacheId('siteB', 'https://takashisasaki.github.io/icon.png');
      const keyC = await getCacheId('siteA', 'https://takashisasaki.github.io/another.png');
      
      assert.notStrictEqual(keyA, keyB);
      assert.notStrictEqual(keyA, keyC);
    });

    it('behaves case-insensitively and handles whitespace trim', async () => {
      const key1 = await getCacheId('siteA', 'https://TAKASHISASAKI.github.io/icon.png ');
      const key2 = await getCacheId('siteA', 'https://takashisasaki.github.io/icon.png');
      assert.strictEqual(key1, key2);
    });
  });

  describe('Cache Expiration isCacheExpired', () => {
    it('marks future expiration fields as valid (not expired)', () => {
      const docData: any = {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour in future
      };
      assert.strictEqual(isCacheExpired(docData), false);
    });

    it('marks past expiration fields as expired', () => {
      const docData: any = {
        expiresAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour in past
      };
      assert.strictEqual(isCacheExpired(docData), true);
    });

    it('gracefully handles missing or malformed ISO dates by returning true (expired)', () => {
      const badDoc: any = { expiresAt: 'garbage-date' };
      assert.strictEqual(isCacheExpired(badDoc), true);
    });
  });

  describe('Firestore Icon Cache Path Generators', () => {
    it('creates matching paths for standard Google signed-in users', () => {
      const colPath = getLauncherIconCacheCollectionPath('production', 'userX', false);
      const docPath = getLauncherIconCacheDocPath('production', 'userX', false, 'cacheKey1');
      assert.strictEqual(colPath, 'githubPagesAuditorV2/production/users/userX/launcherIconCache');
      assert.strictEqual(docPath, 'githubPagesAuditorV2/production/users/userX/launcherIconCache/cacheKey1');
    });

    it('creates matching paths for anonymous guest users', () => {
      const colPath = getLauncherIconCacheCollectionPath('development', 'anonY', true);
      const docPath = getLauncherIconCacheDocPath('development', 'anonY', true, 'cacheKey2');
      assert.strictEqual(colPath, 'githubPagesAuditorV2/development/anonymousSessions/anonY/launcherIconCache');
      assert.strictEqual(docPath, 'githubPagesAuditorV2/development/anonymousSessions/anonY/launcherIconCache/cacheKey2');
    });
  });

  describe('toIconDataUrl Data URL Construction', () => {
    it('constructs correct base64 data URLs', () => {
      const dataUrl = toIconDataUrl('image/png', 'abcdef');
      assert.strictEqual(dataUrl, 'data:image/png;base64,abcdef');
    });

    it('returns empty string if content type or base64 data is empty or missing', () => {
      assert.strictEqual(toIconDataUrl('', 'abcdef'), '');
      assert.strictEqual(toIconDataUrl('image/png', ''), '');
    });
  });

  describe('LauncherGrid Design Integrity Static Assertions', () => {
    it('verifies LauncherGrid does not contain tiny PWA or CACHED text-badge overlays for icon state', () => {
      const launcherGridPath = path.join(process.cwd(), 'src/components/LauncherGrid.tsx');
      assert.ok(fs.existsSync(launcherGridPath), 'LauncherGrid.tsx path must exist');
      
      const content = fs.readFileSync(launcherGridPath, 'utf8');
      
      // The tiny absolute PWA text overlay (usually inside span) should not contain absolute bottom/right text blocks or 'PWA' in icon state context
      assert.ok(!content.includes('bg-emerald-600 text-white text-[8px]'), 'Tiny absolute PWA text badge overlay should be removed');
      assert.ok(!content.includes('bg-indigo-600 text-white text-[8px]'), 'Tiny absolute CACHED text badge overlay should be absent');
    });

    it('verifies Cached/PWA/Favicon/Fallback modes have distinct circular designs and styling treatments', () => {
      const launcherGridPath = path.join(process.cwd(), 'src/components/LauncherGrid.tsx');
      assert.ok(fs.existsSync(launcherGridPath), 'LauncherGrid.tsx path must exist');
      
      const content = fs.readFileSync(launcherGridPath, 'utf8');
      
      // Ensure rounded-full class treatments are applied for circular effects
      assert.ok(content.includes('rounded-full'), 'All icon wrapper elements must use rounded-full circular layout profile');
      
      // Check distinct coloring & background borders
      assert.ok(content.includes('border-indigo-500/30'), 'Cached mode must contain subtle indigo/blue border cues');
      assert.ok(content.includes('border-emerald-500/30'), 'PWA mode must contain subtle emerald border cues');
      assert.ok(content.includes('border-slate-300'), 'Favicon mode must contain subtle neutral slate border cues');
      assert.ok(content.includes('text-amber-700') || content.includes('border-amber-500/20'), 'Fallback initial mode must have distinctive warm amber styling');
    });
  });
});
