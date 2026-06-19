import { describe, it } from 'node:test';
import assert from 'assert';
import { extractLauncherSites, applySavedOrder } from '../src/lib/launcherSites.js';

describe('Launcher Functions', () => {
  it('excludes repositories with Pages disabled', () => {
    const repos: any[] = [
      { id: 1, full_name: 'o/r1', name: 'r1', owner: { login: 'o' }, pages: { hasPages: false } },
      { id: 2, full_name: 'o/r2', name: 'r2', owner: { login: 'o' } },
      { id: 3, full_name: 'o/r3', name: 'r3', owner: { login: 'o' }, pages: { hasPages: true, html_url: 'https://o.github.io/r3/' } }
    ];
    const sites = extractLauncherSites(repos);
    assert.strictEqual(sites.length, 1);
    assert.strictEqual(sites[0].id, '3');
  });

  it('prefers pagesHtmlUrl over fallback', () => {
    const repos: any[] = [
      { id: 1, full_name: 'o/r', name: 'r', owner: { login: 'o' }, pages: { hasPages: true, html_url: 'https://custom.test/' } }
    ];
    const sites = extractLauncherSites(repos);
    assert.strictEqual(sites[0].url, 'https://custom.test/');
  });

  it('uses fallback URL when pagesHtmlUrl is missing', () => {
    const repos: any[] = [
      { id: 1, full_name: 'o/r', name: 'r', owner: { login: 'o' }, pages: { hasPages: true, html_url: null } }
    ];
    const sites = extractLauncherSites(repos);
    assert.strictEqual(sites[0].url, 'https://o.github.io/r/');
  });

  it('rejects non-HTTP(S) URLs', () => {
    const repos: any[] = [
      { id: 1, full_name: 'o/r', name: 'r', owner: { login: 'o' }, pages: { hasPages: true, html_url: 'javascript:alert(1)' } }
    ];
    const sites = extractLauncherSites(repos);
    assert.strictEqual(sites.length, 0);
  });

  it('prefers GitHub repo ID string, falls back to full_name', () => {
    const repos: any[] = [
      { full_name: 'o/r', name: 'r', owner: { login: 'o' }, pages: { hasPages: true, html_url: 'https://o.github.io/r/' } }
    ];
    const sites = extractLauncherSites(repos);
    assert.strictEqual(sites[0].id, 'o/r');
  });

  it('applies saved order and appends remaining', () => {
    const sites: any[] = [
      { id: '1', name: 'one' },
      { id: '2', name: 'two' },
      { id: '3', name: 'three' }
    ];
    const ordered = applySavedOrder(sites, ['3', '1']);
    assert.strictEqual(ordered[0].id, '3');
    assert.strictEqual(ordered[1].id, '1');
    assert.strictEqual(ordered[2].id, '2');
  });

  it('ignores saved IDs missing from current audit', () => {
    const sites: any[] = [
      { id: '1', name: 'one' }
    ];
    const ordered = applySavedOrder(sites, ['3', '1', '4']);
    assert.strictEqual(ordered.length, 1);
    assert.strictEqual(ordered[0].id, '1');
  });

  it('returns original if saved order is empty', () => {
    const sites: any[] = [
      { id: '1', name: 'one' },
      { id: '2', name: 'two' }
    ];
    const ordered = applySavedOrder(sites, []);
    assert.strictEqual(ordered[0].id, '1');
    assert.strictEqual(ordered[1].id, '2');
  });
});
