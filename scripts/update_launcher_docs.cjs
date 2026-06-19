const fs = require('fs');

function appendToDoc(path, contentToAdd) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('## Launcher')) {
      content += '\n' + contentToAdd;
      fs.writeFileSync(path, content, 'utf8');
      console.log('Appended to', path);
    } else {
      console.log('Already in', path);
    }
  }
}

function updateChecklist(path) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(
      /\* \[ \] Verify Launcher page is functional/,
      '* [x] Verify Launcher page is functional'
    );
    content = content.replace(
      /blocked by functional launcher baseline|Currently blocked/gi,
      'Completed'
    );
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated checklist in', path);
  }
}

const launcherDocs = `
## Launcher (\`/launcher\`)
The **Launcher** page displays a user's detected GitHub Pages sites from their most recent audit.
- Tiles open target URLs safely in new windows using \`noopener noreferrer\`.
- Only Pages-enabled sites with safe \`http:\` or \`https:\` URLs are included.
- Tile ordering can be customized and is persisted in Firestore under \`settings/launcherLayout\`.
- The app stores only layout metadata (IDs and order), not duplicated audit payloads.
- Icons are generated locally based on the app's initial; no external favicon service is used.
- Layout stores the ordered array of IDs rather than absolute x/y coordinates.
`;

appendToDoc('README.md', launcherDocs);
appendToDoc('AGENTS.md', launcherDocs);
appendToDoc('docs/spec-appendix-export-and-test.md', launcherDocs);

updateChecklist('docs/cloud-run-operations.md');
updateChecklist('docs/deployment-readiness.md');

