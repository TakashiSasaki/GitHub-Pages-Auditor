import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateGitHubOrgName } from '../src/lib/validation';

describe('Organization Name Validation', () => {
  test('Accepts valid github organization names', () => {
    const validNames = ['google', 'github', 'Microsoft', '123-org', 'a-b-c', 'org-1'];
    validNames.forEach(name => {
      const result = validateGitHubOrgName(name);
      assert.strictEqual(result.isValid, true, `Should accept valid name: ${name}`);
      assert.strictEqual(result.normalized, name, `Should not mutate valid name: ${name}`);
    });
  });

  test('Trims whitespace and accepts', () => {
    const input = '  my-org  ';
    const result = validateGitHubOrgName(input);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.normalized, 'my-org');
  });

  test('Rejects invalid characters', () => {
    const invalidNames = ['org_name', 'org.name', 'org/name', 'org\\name', 'org?name', 'org#name'];
    invalidNames.forEach(name => {
      const result = validateGitHubOrgName(name);
      assert.strictEqual(result.isValid, false, `Should reject invalid name: ${name}`);
    });
  });

  test('Rejects leading or trailing hyphens', () => {
    const invalidNames = ['-org', 'org-'];
    invalidNames.forEach(name => {
      const result = validateGitHubOrgName(name);
      assert.strictEqual(result.isValid, false, `Should reject name with boundary hyphen: ${name}`);
    });
  });

  test('Rejects consecutive hyphens (github restriction)', () => {
    // GitHub actually technically allows a-b but not a--b in some contexts. 
    // The regex /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/ 
    // enforces it by using a lookahead for alphanumeric after a hyphen.
    const result = validateGitHubOrgName('my--org');
    assert.strictEqual(result.isValid, false, 'Should reject consecutive hyphens');
  });

  test('Rejects names exceeding 39 characters', () => {
    const longName = 'a'.repeat(40);
    const result = validateGitHubOrgName(longName);
    assert.strictEqual(result.isValid, false, 'Should reject name longer than 39 characters');
  });

  test('Rejects empty or whitespace-only input', () => {
    assert.strictEqual(validateGitHubOrgName('').isValid, false);
    assert.strictEqual(validateGitHubOrgName('   ').isValid, false);
  });
});
