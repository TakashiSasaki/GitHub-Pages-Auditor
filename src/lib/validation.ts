/**
 * Validates a GitHub organization name.
 * Accepts: Alphanumeric names, hyphenated names with no leading/trailing hyphen.
 * Max length: 39 characters.
 * Trims input before validation.
 */
export function validateGitHubOrgName(orgNameRaw: string): { isValid: boolean; normalized: string } {
  const normalized = (orgNameRaw || '').trim();
  
  // Reject empty/whitespace-only
  if (!normalized) {
    return { isValid: false, normalized: '' };
  }

  // GitHub Org name regex: alphanumeric or single hyphens, cannot start/end with hyphen, max 39
  // (matching GitHub's own constraints)
  const orgNameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  
  const isValid = orgNameRegex.test(normalized);
  
  return { isValid, normalized };
}
