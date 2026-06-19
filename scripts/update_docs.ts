import fs from 'fs';

function update(path: string, fn: (text: string) => string) {
  if (fs.existsSync(path)) {
    const orig = fs.readFileSync(path, 'utf8');
    const changed = fn(orig);
    fs.writeFileSync(path, changed, 'utf8');
    console.log('Updated', path);
  }
}

update('docs/external-consumer-guide.md', c => {
  c = c.replace(/github-pages-auditor\.export\.v1/g, 'github-pages-auditor.export.v2');
  c = c.replace(/Version 1 \(V1\) - Current Default/g, 'Version 2 (V2) - Current Default');
  c = c.replace(/- `examples\/github-pages-auditor-export-v1\.sample\.json`\n/g, '');
  c = c.replace(/examples\/github-pages-auditor-export-v1\.sample\.csv/g, 'examples/github-pages-auditor-export.sample.csv');
  c = c.replace(/\bV1\b/g, 'V2').replace(/\bv1\b/g, 'v2');
  return c;
});

update('docs/spec-appendix-export-and-test.md', c => {
  return c.replace(/github-pages-auditor\.export\.v1/g, 'github-pages-auditor.export.v2')
          .replace(/\bV1\b/g, 'V2').replace(/\bv1\b/g, 'v2');
});

update('docs/examples.md', c => {
  return c.replace(/V1 JSON Export Sample/g, 'JSON Export Sample')
          .replace(/examples\/github-pages-auditor-export-v1\.sample\.json/g, 'examples/github-pages-auditor-export-v2.sample.json')
          .replace(/V1 CSV Export Sample/g, 'CSV Export Sample')
          .replace(/\bV1\b/g, 'V2').replace(/\bv1\b/g, 'v2');
});

update('README.md', c => c.replace(/\bV1\b/g, 'V2').replace(/\bv1\b/g, 'v2'));

update('docs/export-schema-vocabulary.md', c => {
  c = c.replace(/\bV1\b/g, 'V2').replace(/\bv1\b/g, 'v2');
  c = c.replace(/github-pages-auditor\.export\.v1/g, 'github-pages-auditor.export.v2');
  return c;
});

update('docs/spec-initial.md', c => c.replace(/githubPagesAuditorV1/g, 'githubPagesAuditorV2').replace(/v1/g, 'v2').replace(/V1/g, 'V2'));
update('docs/spec-appendix-firebase.md', c => c.replace(/githubPagesAuditorV1/g, 'githubPagesAuditorV2').replace(/v1/g, 'v2').replace(/V1/g, 'V2'));

update('docs/export-schema-v2.md', c => c.replace(/draft\/interchange candidate/g, 'current default'));

update('AGENTS.md', c => {
  c = c.replace(/V1/g, 'V2').replace(/v1/g, 'v2');
  c = c.replace(/githubPagesAuditorV1/g, 'githubPagesAuditorV2');
  return c;
});

update('.env.example', c => {
  c = c.replace(/APP_URL="http:\/\/localhost:3000"/, 'APP_URL="http://localhost:3000"');
  c = c.replace(/# APP_URL="https:\/\/github-pages-auditor-1042140630327.asia-east1.run.app"/, 'APP_URL="https://github-pages-auditor-1042140630327.asia-east1.run.app"');
  c = c.replace(/# APP_URL="https:\/\/pages.moukaeritai.work"/, 'APP_URL="https://pages.moukaeritai.work"');
  return c;
});

