export type V2DeploymentMethod =
  | 'workflow'
  | 'branch_root'
  | 'branch_docs'
  | 'branch_unknown_path'
  | 'unknown'
  | 'not_applicable';

export type V2VerificationState =
  | 'verified'
  | 'pending'
  | 'unverified'
  | 'unknown'
  | 'not_applicable';

export interface V2RepositoryMeta {
  githubId: string;
  githubIdNumber?: number | null;
  ownerLogin: string;
  name: string;
  fullName: string;
  /**
   * @format uri
   */
  htmlUrl: string;
  visibility: 'public' | 'private' | 'internal' | 'unknown';
  isPrivate: boolean;
  isArchived: boolean;
  isDisabled: boolean;
  isFork: boolean;
  defaultBranch: string | null;
  githubHasPagesRaw: boolean | null;
  /**
   * @format date-time
   */
  createdAt: string | null;
  /**
   * @format date-time
   */
  updatedAt: string | null;
  /**
   * @format date-time
   */
  pushedAt: string | null;
}

export interface V2PagesMeta {
  enabled: boolean | null;
  statusRaw: string | null;
  /**
   * @format uri
   */
  htmlUrl: string | null;
  /**
   * @format uri
   */
  settingsUrl: string;
  publicRaw: boolean | null;
  deployment: {
    method: V2DeploymentMethod;
    githubBuildTypeRaw: 'legacy' | 'workflow' | string | null;
    sourceBranch: string | null;
    sourcePath: '/' | '/docs' | string | null;
    displaySummary?: string | null;
  };
  customDomain: {
    configured: boolean;
    cnameRaw: string | null;
    hostname: string | null;
    githubProtectedDomainStateRaw: string | null;
    verificationState: V2VerificationState;
    /**
     * @format date-time
     */
    pendingUnverifiedAt: string | null;
    stateSource: 'github_pages_api' | 'derived' | 'not_reported';
  };
  https: {
    enforced: boolean | null;
    certificate: {
      stateRaw: string | null;
      description: string | null;
      domains: string[];
      /**
       * @format date-time
       */
      expiresAt: string | null;
    };
  };
  healthCheck: {
    requested: boolean;
    status: string | null;
  };
}

export interface V2Finding {
  code: string;
  category: 'pages' | 'custom_domain' | 'https' | 'dns' | 'deployment' | 'permissions' | 'api';
  severity: 'info' | 'warning' | 'error';
  source: 'github_repository_api' | 'github_pages_api' | 'github_pages_health_api' | 'app_derived';
  message?: string;
  evidence?: Record<string, unknown>;
}

export interface V2AuditRepositoryRecord {
  repository: V2RepositoryMeta;
  pages: V2PagesMeta;
  findings: V2Finding[];
}

export interface V2AppMeta {
  name: string;
  version: string;
  environment?: string;
}

export interface V2AuditRunOptions {
  affiliation: string;
  visibility: 'all' | 'public' | 'private';
  includeArchived: boolean;
  includeDisabled: boolean;
  strictPagesCheck: boolean;
  includeHealthCheck: boolean;
  ownerFilter?: string | null;
}

export interface V2AuditRun {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  /**
   * @format date-time
   */
  startedAt: string | null;
  /**
   * @format date-time
   */
  finishedAt: string | null;
  userMode?: 'google' | 'anonymous';
  tokenType?: 'fine_grained' | 'classic' | 'unknown' | null;
  githubLogin?: string | null;
  options: V2AuditRunOptions;
}

export interface V2Summary {
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

export interface GitHubPagesAuditorExportV2 {
  schemaVersion: 'github-pages-auditor.export.v2';
  schemaId: 'urn:uuid:7d0f98be-8cba-49c5-84dc-66914b5da3f2';
  /**
   * @format date-time
   */
  exportedAt: string;
  application: V2AppMeta;
  auditRun: V2AuditRun;
  summary: V2Summary;
  repositories: V2AuditRepositoryRecord[];
  domains?: {
    domain: string;
    repositoryCount: number;
    repositories: {
      fullName: string;
      /**
       * @format uri
       */
      htmlUrl: string;
    }[];
    hasDuplicate: boolean;
  }[];
}
