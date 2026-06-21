import pkg from '../package.json';
export const APP_VERSION = pkg.version;
export const APP_USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) GitHubPagesAuditor/${APP_VERSION}`;

export function getAppUserAgent() {
  return APP_USER_AGENT;
}
