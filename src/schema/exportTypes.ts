export type ExportPagesDeploymentMethod =
  | 'workflow'
  | 'branch_root'
  | 'branch_docs'
  | 'branch_unknown_path'
  | 'unknown'
  | 'not_applicable';

export type ExportClassification =
  | 'pages_disabled'
  | 'pages_disabled_or_unavailable'
  | 'pages_enabled_no_custom_domain'
  | 'custom_domain_configured'
  | 'custom_domain_verified'
  | 'custom_domain_pending'
  | 'custom_domain_unverified_or_unknown'
  | 'https_certificate_ok'
  | 'https_certificate_problem_or_unknown'
  | 'https_not_enforced'
  | 'dns_health_ok'
  | 'dns_health_problem'
  | 'insufficient_permissions'
  | 'sso_required'
  | 'rate_limited'
  | 'api_error'
  | 'pages_deploy_method_workflow'
  | 'pages_deploy_method_branch_root'
  | 'pages_deploy_method_branch_docs'
  | 'pages_deploy_method_branch_unknown_path'
  | 'pages_deploy_method_unknown';

export type ExportErrorClassification =
  | 'token_invalid_or_expired'
  | 'insufficient_permissions'
  | 'sso_required'
  | 'classic_pat_sso_authorization_required'
  | 'fine_grained_pat_approval_required'
  | 'primary_rate_limited'
  | 'secondary_rate_limited'
  | 'forbidden_unknown'
  | 'repository_not_found_or_no_access'
  | 'pages_not_enabled'
  | 'pages_resource_not_found'
  | 'classic_pat_sso_authorization_missing_possible'
  | 'validation_failed'
  | 'health_no_cname'
  | 'endpoint_spam_or_abuse_protection'
  | 'github_temporary_error'
  | 'api_error'
  | null;

export type ExportHealthStatus =
  | 'not_requested'
  | 'ok'
  | 'health_pending'
  | 'health_no_cname'
  | 'health_custom_domains_unavailable'
  | 'health_insufficient_permissions'
  | 'health_dns_problem'
  | 'health_https_problem'
  | 'health_https_not_enforced'
  | 'api_error'
  | null;

export interface ExportRepositoryResult {
  githubRepoId: number | null;
  owner: string;
  repo: string;
  fullName: string;
  repositoryTopUrl: string;
  pagesSettingsUrl: string;
  pagesUrl: string | null;
  private: boolean;
  visibility: 'public' | 'private' | 'internal' | null;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  defaultBranch: string | null;
  hasPages: boolean | null;
  createdAtGitHub: string | null;
  updatedAtGitHub: string | null;
  pushedAtGitHub: string | null;
  pagesEnabled: boolean;
  pagesStatus: string | null;
  buildType: string | null;
  deploymentMethod: ExportPagesDeploymentMethod;
  sourceBranch: string | null;
  sourcePath: string | null;
  publishingSourceSummary: string | null;
  pagesPublic: boolean | null;
  customDomain: string | null;
  customDomainConfigured: boolean;
  protectedDomainState: string | null;
  pendingDomainUnverifiedAt: string | null;
  httpsCertificateState: string | null;
  httpsCertificateDescription: string | null;
  httpsCertificateDomains: string[];
  httpsCertificateExpiresAt: string | null;
  httpsEnforced: boolean | null;
  healthStatus: ExportHealthStatus;
  classification: ExportClassification[];
  errorClassification: ExportErrorClassification;
  diagnostics?: Record<string, any>;
}

export interface ExportDomainSummary {
  domain: string;
  repositoryCount: number;
  repositories: {
    fullName: string;
    repositoryTopUrl: string;
    pagesSettingsUrl: string;
  }[];
  hasDuplicate: boolean;
  hasUnverified: boolean;
  hasHttpsProblem: boolean;
  hasDnsProblem: boolean;
}

export interface ExportSummary {
  repositoryCount: number;
  pagesEnabledCount: number;
  customDomainCount: number;
  customDomainVerifiedCount: number;
  customDomainUnverifiedOrUnknownCount: number;
  httpsProblemCount: number;
  dnsHealthProblemCount: number;
  errorCount: number;
  deploymentWorkflowCount: number;
  deploymentBranchRootCount: number;
  deploymentBranchDocsCount: number;
  deploymentUnknownCount: number;
  httpsNotEnforcedCount: number;
  approvedCertButHttpsNotEnforcedCount: number;
  customDomainHttpsNotEnforcedCount: number;
}

export interface ExportAppMeta {
  name: string;
  version: string;
  environment?: string;
}

export interface ExportAuditRunOptions {
  affiliation: string;
  visibility: 'all' | 'public' | 'private';
  includeArchived: boolean;
  includeDisabled: boolean;
  strictPagesCheck: boolean;
  includeHealthCheck: boolean;
  ownerFilter?: string | null;
}

export interface ExportAuditRun {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  startedAt: string | null;
  finishedAt: string | null;
  userMode?: 'google' | 'anonymous';
  tokenType?: 'fine_grained' | 'classic' | 'unknown' | null;
  githubLogin?: string | null;
  options: ExportAuditRunOptions;
}

export interface GitHubPagesAuditorExport {
  schemaVersion: 'github-pages-auditor.export.v1';
  exportedAt: string;
  application: ExportAppMeta;
  auditRun: ExportAuditRun;
  summary: ExportSummary;
  repositories: ExportRepositoryResult[];
  domains?: ExportDomainSummary[];
}

export interface ExportBuildContext {
  auditRunId?: string | null;
  auditCreatedAt?: string | null;
  exportedAt?: string;
  userMode?: 'google' | 'anonymous' | 'unknown' | null;
  githubLogin?: string | null;
  appEnvironment?: string;
  tokenType?: 'classic' | 'fine_grained' | 'unknown' | null;
}

