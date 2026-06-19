import { RepositoryResult } from '../types';

export interface LauncherSite {
  id: string;
  name: string;
  ownerRepo: string;
  url: string;
  httpsState: string;
  deploymentMethod: string;
}

export function extractLauncherSites(repositories: RepositoryResult[]): LauncherSite[] {
  return repositories
    .filter(repo => {
      if (!repo.pages || !repo.pages.hasPages) return false;
      const url = repo.pages.html_url || `https://${repo.owner.login}.github.io/${repo.name}/`;
      if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
      return true;
    })
    .map(repo => {
      const url = repo.pages!.html_url || `https://${repo.owner.login}.github.io/${repo.name}/`;
      return {
        id: repo.id ? String(repo.id) : repo.full_name,
        name: repo.name,
        ownerRepo: repo.full_name,
        url,
        httpsState: repo.pages?.https_enforced ? 'Enforced' : (repo.pages?.https_certificate ? 'Approved' : 'Unknown'),
        deploymentMethod: repo.pages?.build_type || 'unknown'
      };
    });
}

export function applySavedOrder(sites: LauncherSite[], savedIds: string[]): LauncherSite[] {
  if (!savedIds || savedIds.length === 0) return sites;
  
  const siteMap = new Map<string, LauncherSite>();
  for (const site of sites) {
    siteMap.set(site.id, site);
  }

  const ordered: LauncherSite[] = [];
  for (const id of savedIds) {
    if (siteMap.has(id)) {
      ordered.push(siteMap.get(id)!);
      siteMap.delete(id);
    }
  }

  // Append any remaining sites not in saved layout
  for (const site of Array.from(siteMap.values())) {
    ordered.push(site);
  }

  return ordered;
}
