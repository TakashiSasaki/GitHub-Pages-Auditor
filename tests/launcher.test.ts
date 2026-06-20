import { describe, it } from 'node:test';
import assert from 'assert';
import { extractLauncherSites, applySavedOrder } from '../src/lib/launcherSites.js';
import { RepositoryResult } from '../src/types.js';
import { liveExportSampleRows } from './fixtures/liveExportRows.js';

describe('Launcher Functions', () => {
  it('excludes repositories with Pages disabled', () => {
    const repos: Partial<RepositoryResult>[] = [
      { id: 1, fullName: 'o/r1', repoName: 'r1', ownerName: 'o', hasPages: false },
      { id: 2, fullName: 'o/r2', repoName: 'r2', ownerName: 'o', hasPages: false },
      { id: 3, fullName: 'o/r3', repoName: 'r3', ownerName: 'o', hasPages: true, pagesHtmlUrl: 'https://o.github.io/r3/' }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
    assert.strictEqual(sites.length, 1);
    assert.strictEqual(sites[0].id, '3');
  });

  it('prefers pagesHtmlUrl over fallback', () => {
    const repos: Partial<RepositoryResult>[] = [
      { id: 1, fullName: 'o/r', repoName: 'r', ownerName: 'o', hasPages: true, pagesHtmlUrl: 'https://custom.test/' }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
    assert.strictEqual(sites[0].url, 'https://custom.test/');
  });

  it('uses fallback URL when pagesHtmlUrl is missing', () => {
    const repos: Partial<RepositoryResult>[] = [
      { id: 1, fullName: 'o/r', repoName: 'r', ownerName: 'o', hasPages: true, pagesHtmlUrl: null }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
    assert.strictEqual(sites[0].url, 'https://o.github.io/r/');
  });

  it('rejects non-HTTP(S) URLs', () => {
    const repos: Partial<RepositoryResult>[] = [
      { id: 1, fullName: 'o/r', repoName: 'r', ownerName: 'o', hasPages: true, pagesHtmlUrl: 'javascript:alert(1)' }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
    assert.strictEqual(sites.length, 0);
  });

  it('rejects invalid URLs', () => {
    const repos: Partial<RepositoryResult>[] = [
      { id: 1, fullName: 'o/r', repoName: 'r', ownerName: 'o', hasPages: true, pagesHtmlUrl: 'https:// this is not a url' }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
    assert.strictEqual(sites.length, 0);
  });

  it('prefers GitHub repo ID string, falls back to full_name', () => {
    const repos: Partial<RepositoryResult>[] = [
      { fullName: 'o/r', repoName: 'r', ownerName: 'o', hasPages: true, pagesHtmlUrl: 'https://o.github.io/r/' }
    ];
    const sites = extractLauncherSites(repos as RepositoryResult[]);
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

  it('extracts correctly from live export fixtures', () => {
    const sites = extractLauncherSites(liveExportSampleRows);

    // Check it properly filtered out row ID 101 (pages disabled)
    assert.ok(sites.every(s => s.id !== '101'), 'Should not include pages disabled repos');

    const row102 = sites.find(s => s.id === '102');
    assert.ok(row102, 'Should find 102');
    assert.strictEqual(row102.url, 'https://takashisasaki.github.io/no-custom-domain/');
    assert.strictEqual(row102.hostname, 'takashisasaki.github.io');
    assert.strictEqual(row102.deploymentMethod, 'workflow');

    const row104 = sites.find(s => s.id === '104');
    assert.ok(row104, 'Should find 104');
    assert.strictEqual(row104.url, 'https://enforced.com/');
    assert.strictEqual(row104.hostname, 'enforced.com');
  });
});
