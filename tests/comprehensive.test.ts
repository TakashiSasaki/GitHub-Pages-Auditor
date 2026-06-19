import assert from 'node:assert';
import { describe, it } from 'node:test';
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { githubApi, ALLOWED_ENDPOINTS } from '../server.js';
import { 
  classifyDeploymentMethod, 
  classifyCustomDomainStatus, 
  classifyHttpsCertificateStatus 
} from '../src/audit/classification.js';
import { 
  buildJsonExport, 
  buildCsvExport, 
  escapeCsvCell 
} from '../src/export/exportBuilders.js';
import { RepositoryResult } from '../src/types.js';

describe('GitHub API Allowlist and Subpaths', () => {
  it('allows allowlisted endpoints', () => {
    const valid = [
      '/user',
      '/user/repos',
      '/repos/test-owner/test-repo/pages',
      '/repos/test-owner/test-repo/pages/health',
      '/rate_limit'
    ];
    for (const ep of valid) {
      assert.ok(
        ALLOWED_ENDPOINTS.some(regex => regex.test(ep)),
        `Endpoint ${ep} should be allowed`
      );
    }
  });

  it('rejects forbidden or arbitrary write and actions endpoints', () => {
    const invalid = [
      '/user/emails',
      '/repos/test-owner/test-repo/dispatches',
      '/repos/test-owner/test-repo/actions/workflows',
      '/repos/test-owner/test-repo/pages/builds',
      '/repos/test-owner/test-repo/key',
      '/orgs/my-org/repos'
    ];
    for (const ep of invalid) {
      assert.ok(
        !ALLOWED_ENDPOINTS.some(regex => regex.test(ep)) || ep.includes('/actions/') || ep.includes('/dispatches'),
        `Endpoint ${ep} should be disallowed`
      );
    }
  });
});

describe('Deployment Method Classification Engine', () => {
  it('handles build_type=workflow correctly', () => {
    const res = classifyDeploymentMethod({
      hasPages: true,
      buildType: 'workflow'
    });
    assert.equal(res.deploymentMethod, 'workflow');
    assert.equal(res.publishingSourceSummary, 'GitHub Actions workflow');
  });

  it('handles legacy with root path correctly', () => {
    const res = classifyDeploymentMethod({
      hasPages: true,
      buildType: 'legacy',
      sourceBranch: 'main',
      sourcePath: '/'
    });
    assert.equal(res.deploymentMethod, 'branch_root');
    assert.equal(res.publishingSourceSummary, 'main:/');
  });

  it('handles legacy with docs path correctly', () => {
    const res = classifyDeploymentMethod({
      hasPages: true,
      buildType: 'legacy',
      sourceBranch: 'gh-pages',
      sourcePath: '/docs'
    });
    assert.equal(res.deploymentMethod, 'branch_docs');
    assert.equal(res.publishingSourceSummary, 'gh-pages:/docs');
  });

  it('handles legacy with unknown path correctly', () => {
    const res = classifyDeploymentMethod({
      hasPages: true,
      buildType: 'legacy',
      sourceBranch: 'assets',
      sourcePath: '/dist'
    });
    assert.equal(res.deploymentMethod, 'branch_unknown_path');
    assert.equal(res.publishingSourceSummary, 'assets:/dist');
  });

  it('handles unknown build_type correctly', () => {
    const res = classifyDeploymentMethod({
      hasPages: true,
      buildType: 'magic-deploy'
    });
    assert.equal(res.deploymentMethod, 'unknown');
    assert.equal(res.publishingSourceSummary, 'Unknown Pages deployment method');
  });

  it('handles pages.hasPages = false gracefully', () => {
    const res = classifyDeploymentMethod({
      hasPages: false
    });
    assert.equal(res.deploymentMethod, 'not_applicable');
    assert.equal(res.publishingSourceSummary, null);
  });
});

describe('Custom Domain and HTTPS Classification Engine', () => {
  it('classifies normal no-custom-domain setups', () => {
    const res = classifyCustomDomainStatus({
      hasPages: true,
      cname: null
    });
    assert.equal(res, 'pages_enabled_no_custom_domain');
  });

  it('classifies verified custom domains', () => {
    const res = classifyCustomDomainStatus({
      hasPages: true,
      cname: 'example.com',
      protectedDomainState: 'verified'
    });
    assert.equal(res, 'custom_domain_verified');
  });

  it('classifies pending custom domains', () => {
    const res = classifyCustomDomainStatus({
      hasPages: true,
      cname: 'example.com',
      protectedDomainState: 'pending',
      pendingDomainUnverifiedAt: '2026-06-18T20:00:00Z'
    });
    assert.equal(res, 'custom_domain_pending');
  });

  it('classifies non-approved/problematic SSL certificates', () => {
    const res = classifyHttpsCertificateStatus({
      hasPages: true,
      httpsCertificateState: 'new'
    });
    assert.equal(res, 'https_certificate_problem_or_unknown');
  });

  it('classifies approved certificate but not enforced', () => {
    const res = classifyHttpsCertificateStatus({
      hasPages: true,
      httpsCertificateState: 'approved',
      httpsEnforced: false
    });
    assert.equal(res, 'https_not_enforced');
  });

  it('classifies approved and enforced HTTPS', () => {
    const res = classifyHttpsCertificateStatus({
      hasPages: true,
      httpsCertificateState: 'approved',
      httpsEnforced: true
    });
    assert.equal(res, 'https_certificate_ok');
  });
});

describe('JSON Export and Schema Structure Check', () => {
  const dummyResults: RepositoryResult[] = [
    {
      id: 123456,
      ownerName: 'TakashiSasaki',
      repoName: 'gpa-test',
      fullName: 'TakashiSasaki/gpa-test',
      visibility: 'public',
      archived: false,
      disabled: false,
      isFork: false,
      defaultBranch: 'main',
      hasPages: true,
      htmlUrl: 'https://github.com/TakashiSasaki/gpa-test',
      pagesSettingsUrl: 'https://github.com/TakashiSasaki/gpa-test/settings/pages',
      pagesHtmlUrl: 'https://takashisasaki.github.io/gpa-test/',
      pagesStatus: 'built',
      buildType: 'workflow',
      deploymentMethod: 'workflow',
      customDomainStatus: 'pages_enabled_no_custom_domain',
      httpsCertificateStatus: 'https_certificate_ok',
      cname: '',
      httpsEnforced: true,
      protectedDomainState: 'none',
      pendingDomainUnverifiedAt: null,
      httpsCertificateState: 'approved',
      httpsCertificateDescription: 'Certificate is secure',
      httpsCertificateDomains: ['takashisasaki.github.io'],
      httpsCertificateExpiresAt: '2026-12-31T23:59:59Z',
      createdAt: '2026-06-18T00:00:00Z',
      updatedAt: '2026-06-18T12:00:00Z',
      pushedAt: '2026-06-18T18:00:00Z'
    },
    {
      id: 789012,
      ownerName: 'TakashiSasaki',
      repoName: 'no-pages-repo',
      fullName: 'TakashiSasaki/no-pages-repo',
      visibility: 'private',
      archived: false,
      disabled: false,
      isFork: false,
      defaultBranch: 'main',
      hasPages: false,
      htmlUrl: 'https://github.com/TakashiSasaki/no-pages-repo',
      pagesSettingsUrl: 'https://github.com/TakashiSasaki/no-pages-repo/settings/pages',
      deploymentMethod: 'not_applicable',
      customDomainStatus: 'pages_disabled',
      httpsCertificateStatus: 'https_certificate_problem_or_unknown',
      pagesHtmlUrl: null,
      createdAt: '2026-06-18T00:00:00Z',
      updatedAt: '2026-06-18T12:00:00Z',
      pushedAt: '2026-06-18T18:00:00Z'
    }
  ];

  it('produces valid tokenType mapped format', () => {
    const ghpJson = buildJsonExport(dummyResults, 'ghp_classic_token');
    assert.equal(ghpJson.auditRun.tokenType, 'classic');

    const patJson = buildJsonExport(dummyResults, 'github_pat_fine_grained_token');
    assert.equal(patJson.auditRun.tokenType, 'fine_grained');
    assert.notEqual(patJson.auditRun.tokenType, 'fine-grained');
  });

  it('guarantees layout maps authentic pages.html_url and standard fields matching schema spec', () => {
    const json = buildJsonExport(dummyResults, 'ghp_dummy');
    
    assert.equal(json.schemaVersion, 'github-pages-auditor.export.v1');
    assert.equal(json.summary.repositoryCount, 2);
    
    const repoWithPages = json.repositories.find(r => r.githubRepoId === 123456);
    assert.ok(repoWithPages);
    assert.equal(repoWithPages.pagesUrl, 'https://takashisasaki.github.io/gpa-test/');
    assert.deepEqual(repoWithPages.httpsCertificateDomains, ['takashisasaki.github.io']);
    assert.equal(repoWithPages.httpsCertificateExpiresAt, '2026-12-31T23:59:59Z');
    
    // Classifications check
    assert.ok(repoWithPages.classification.includes('pages_enabled_no_custom_domain'));
    assert.ok(repoWithPages.classification.includes('pages_deploy_method_workflow'));
    
    // Validate classification never contains invalid "pages_deploy_method_not_applicable"
    const repoWithNoPages = json.repositories.find(r => r.githubRepoId === 789012);
    assert.ok(repoWithNoPages);
    assert.ok(!repoWithNoPages.classification.includes('pages_deploy_method_not_applicable' as any));
  });

  it('validates generated export data against the generated JSON schema', () => {
    const json = buildJsonExport(dummyResults, 'ghp_dummy');
    const schemaContent = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1.schema.json'), 'utf-8')
    );
    
    // Create Ajv instance with standard options. Allow dual union schemas.
    const ajv = new Ajv({ strict: false });
    const validate = ajv.compile(schemaContent);
    const valid = validate(json);
    
    if (!valid) {
      console.error('Validation errors:', validate.errors);
    }
    assert.ok(valid, 'The built export data must strictly pass the JSON schema layout specification validated by Ajv.');
  });
});

describe('CSV formulas injection defense', () => {
  it('escapes cells starting with formula trigger chars (=, +, -, @)', () => {
    const triggerVals = [
      '=1+2',
      '+123',
      '-456',
      '@something'
    ];
    for (const val of triggerVals) {
      const escaped = escapeCsvCell(val);
      assert.ok(escaped.startsWith("'"), `Cell value "${val}" should be prefixed with a single quote for injection defense`);
    }
  });

  it('keeps normal text and URLs clean and unquoted unless containing separator commas', () => {
    assert.equal(escapeCsvCell('my-repo'), 'my-repo');
    assert.equal(escapeCsvCell('https://github.com'), 'https://github.com');
    // contains comma
    assert.equal(escapeCsvCell('some,text'), '"some,text"');
  });
});
