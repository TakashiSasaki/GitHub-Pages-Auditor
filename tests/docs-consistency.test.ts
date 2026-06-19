import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { describe, it } from 'node:test';

describe('Documentation Consistency Diagnostics', () => {
  it('README.md should contain the planned custom domain', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf-8');
    assert.ok(content.includes('pages.moukaeritai.work'), 'README.md does not contain pages.moukaeritai.work');
  });

  it('AGENTS.md should contain the planned custom domain', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('pages.moukaeritai.work'), 'AGENTS.md does not contain pages.moukaeritai.work');
  });

  it('docs/custom-domain-readiness.md should contain the planned custom domain', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'docs', 'custom-domain-readiness.md'), 'utf-8');
    assert.ok(content.includes('pages.moukaeritai.work'), 'docs/custom-domain-readiness.md does not contain pages.moukaeritai.work');
  });

  it('docs/cloud-run-operations.md should contain the planned custom domain', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'docs', 'cloud-run-operations.md'), 'utf-8');
    assert.ok(content.includes('pages.moukaeritai.work'), 'docs/cloud-run-operations.md does not contain pages.moukaeritai.work');
  });

  it('docs/pages-moukaeritai-work-assignment-runbook.md exists and contains the planned custom domain', () => {
    const runbookPath = path.join(process.cwd(), 'docs', 'pages-moukaeritai-work-assignment-runbook.md');
    assert.ok(fs.existsSync(runbookPath), 'Runbook file does not exist');
    const content = fs.readFileSync(runbookPath, 'utf-8');
    assert.ok(content.includes('pages.moukaeritai.work'), 'Runbook does not contain pages.moukaeritai.work');
  });

  it('.env.example should contain the planned custom domain', () => {
    const content = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf-8');
    assert.ok(content.includes('https://pages.moukaeritai.work'), '.env.example does not contain https://pages.moukaeritai.work');
  });

  it('No generic placeholders like <target-domain-placeholder> remain in docs/', () => {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(docsDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
        assert.ok(!content.includes('<target-domain-placeholder>'), `Placeholder found in ${file}`);
        assert.ok(!content.includes('gpa-auditor.yourdomain.com'), `Placeholder found in ${file}`);
      }
    }
  });

  it('No code/docs/tests/scripts refer to V1 specific identifiers', () => {
    const dirsToCheck = ['src', 'tests', 'docs', 'scripts'];
    const forbiddenStrings = [
      'github-pages-auditor.export.v1',
      'github-pages-auditor-export-v1.schema.json',
      'examples/github-pages-auditor-export-v1.sample.json'
    ];

    const checkFile = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const str of forbiddenStrings) {
        assert.ok(!content.includes(str), `Forbidden V1 string "${str}" found in ${filePath}`);
      }
    };

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md') || fullPath.endsWith('.js')) {
          if (!fullPath.includes('docs-consistency.test.ts')) { // Ignore the test file itself checking for the strings
            checkFile(fullPath);
          }
        }
      }
    };

    for (const dir of dirsToCheck) {
      if (fs.existsSync(path.join(process.cwd(), dir))) {
        walkDir(path.join(process.cwd(), dir));
      }
    }

    // Explicitly check schema-identifiers.json
    const schemaIdentifiers = fs.readFileSync(path.join(process.cwd(), 'schemas', 'schema-identifiers.json'), 'utf-8');
    assert.ok(!schemaIdentifiers.includes('github-pages-auditor.export.v1'), 'schema-identifiers.json contains V1 reference');
    const parsedSchemaIdentifiers = JSON.parse(schemaIdentifiers);
    assert.strictEqual(parsedSchemaIdentifiers.schemas.length, 1, 'schema-identifiers.json should only contain 1 schema entry');
    assert.strictEqual(parsedSchemaIdentifiers.schemas[0].schemaVersion, 'github-pages-auditor.export.v2', 'schema-identifiers.json entry must be v2');
  });
});
