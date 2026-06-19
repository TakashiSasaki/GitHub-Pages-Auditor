import { PagesDeploymentMethod, CustomDomainStatus, HttpsCertificateStatus } from '../types';

export interface ClassificationInputs {
  hasPages: boolean;
  buildType?: string | null;
  sourceBranch?: string | null;
  sourcePath?: string | null;
  cname?: string | null;
  protectedDomainState?: string | null;
  pendingDomainUnverifiedAt?: string | null;
  httpsCertificateState?: string | null;
  httpsEnforced?: boolean | null;
}

export function classifyDeploymentMethod(inputs: ClassificationInputs): {
  deploymentMethod: PagesDeploymentMethod;
  publishingSourceSummary: string | null;
} {
  const { hasPages, buildType, sourceBranch, sourcePath } = inputs;

  if (!hasPages) {
    return {
      deploymentMethod: 'not_applicable',
      publishingSourceSummary: null
    };
  }

  if (buildType === 'workflow') {
    return {
      deploymentMethod: 'workflow',
      publishingSourceSummary: 'GitHub Actions workflow'
    };
  }

  if (buildType === 'legacy') {
    const branch = sourceBranch || 'unknown';
    const path = sourcePath || '/';
    if (path === '/') {
      return {
        deploymentMethod: 'branch_root',
        publishingSourceSummary: `${branch}:/`
      };
    } else if (path === '/docs') {
      return {
        deploymentMethod: 'branch_docs',
        publishingSourceSummary: `${branch}:/docs`
      };
    } else {
      return {
        deploymentMethod: 'branch_unknown_path',
        publishingSourceSummary: `${branch}:${path}`
      };
    }
  }

  return {
    deploymentMethod: 'unknown',
    publishingSourceSummary: 'Unknown Pages deployment method'
  };
}

export function classifyCustomDomainStatus(inputs: ClassificationInputs): CustomDomainStatus {
  const { hasPages, cname, protectedDomainState, pendingDomainUnverifiedAt } = inputs;

  if (!hasPages) {
    return 'pages_disabled';
  }

  if (!cname) {
    return 'pages_enabled_no_custom_domain';
  }

  if (protectedDomainState === 'verified') {
    return 'custom_domain_verified';
  }

  if (protectedDomainState === 'pending' || pendingDomainUnverifiedAt) {
    return 'custom_domain_pending';
  }

  return 'custom_domain_unverified_or_unknown';
}

export function classifyHttpsCertificateStatus(inputs: ClassificationInputs): HttpsCertificateStatus {
  const { hasPages, httpsCertificateState, httpsEnforced } = inputs;

  if (!hasPages) {
    // According to initial spec, standard fallback for disabled or fallback
    return 'https_certificate_problem_or_unknown';
  }

  if (httpsCertificateState === 'approved') {
    return httpsEnforced ? 'https_certificate_ok' : 'https_not_enforced';
  }

  return 'https_certificate_problem_or_unknown';
}
