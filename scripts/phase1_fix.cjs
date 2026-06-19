const fs = require('fs');

function updateFile(path, replacementFn) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = replacementFn(content);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated', path);
  } else {
    console.log('Not found', path);
  }
}

updateFile('src/export/csvExport.ts', content => {
  return content.replace('const auditRunId = context?.auditRunId || "export-${Date.now()}";', 'const auditRunId = context?.auditRunId || `export-${Date.now()}`;');
});

updateFile('.env.example', content => {
  content = content.replace(/^# APP_URL="http:\/\/localhost:3000"/m, 'APP_URL="http://localhost:3000"');
  content = content.replace(/^APP_URL="https:\/\/pages\.moukaeritai\.work"/m, '# APP_URL="https://pages.moukaeritai.work"');
  return content;
});

updateFile('README.md', content => {
  content = content.replace(/- \*\*TypeScript is the Source of Truth\*\*: The schema types reside in `src\/schema\/exportTypes\.ts`\.\n/g, '');
  content = content.replace(/V2 draft|v2 draft|V2 Draft|Interchange Draft/gi, 'V2');
  content = content.replace(/Flat structure targeting spreadsheet.*?V2/gi, 'V2 is the only current JSON export schema; CSV is a separate flat export format.');
  content = content.replace(/V1 is the default.*?V2/gi, 'V2 is the only current JSON export schema; CSV is a separate flat export format.');
  return content;
});

updateFile('docs/external-consumer-guide.md', content => {
  let c = content.replace(/1\. \*\*Version 2 \(V2\).*?\n\n2\. \*\*Version 2 \(V2\) - Current Default:/s, '1. **Version 2 (V2) - Current Default:');
  c = c.replace(/github-pages-auditor\.export\.v1/g, 'github-pages-auditor.export.v2');
  c = c.replace(/Version 2 \(V2\) - Current Default/g, 'Version 2 (V2) - Current Default');
  c = c.replace(/V2 draft/gi, 'V2');
  return c;
});

updateFile('docs/pages-moukaeritai-work-assignment-runbook.md', content => {
  let c = content.replace(/v1 CSV export/g, 'CSV export');
  c = c.replace(/v1 JSON export/g, 'JSON V2 export');
  c = c.replace(/v2 draft JSON export/g, 'JSON V2 export');
  c = c.replace(/JSON v1/g, 'JSON tab schema validation');
  c = c.replace(/JSON v2 draft/g, 'JSON tab schema validation');
  return c;
});
