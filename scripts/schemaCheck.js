import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { applyMetadata } from './applySchemaMetadata.js';

const tempV1Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1._temp.json');
const finalV1Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1.schema.json');

const tempV2Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v2._temp.json');
const finalV2Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v2.schema.json');

function cleanup() {
  if (fs.existsSync(tempV1Path)) {
    try { fs.unlinkSync(tempV1Path); } catch (_) {}
  }
  if (fs.existsSync(tempV2Path)) {
    try { fs.unlinkSync(tempV2Path); } catch (_) {}
  }
}

try {
  // Generate V1 to a temporary location
  execSync(`npx ts-json-schema-generator --path src/schema/exportTypes.ts --type GitHubPagesAuditorExport --out "${tempV1Path}"`, { stdio: 'inherit' });

  if (!fs.existsSync(finalV1Path)) {
    console.error("Baseline V1 schema file does not exist.");
    cleanup();
    process.exit(1);
  }

  const generatedV1Raw = JSON.parse(fs.readFileSync(tempV1Path, 'utf-8'));
  const currentV1 = JSON.parse(fs.readFileSync(finalV1Path, 'utf-8'));

  // Apply stable metadata before checking
  const generatedV1 = applyMetadata(generatedV1Raw, 'v1');

  // Compare as normalized JSON strings
  if (JSON.stringify(generatedV1) !== JSON.stringify(currentV1)) {
    console.error("❌ V1 Schema drift detected! The committed schema is out of sync with src/schema/exportTypes.ts.");
    console.error("Please run: npm run schema:generate");
    cleanup();
    process.exit(1);
  }

  // Generate V2 to a temporary location
  execSync(`npx ts-json-schema-generator --path src/schema/exportTypesV2.ts --type GitHubPagesAuditorExportV2 --out "${tempV2Path}"`, { stdio: 'inherit' });

  if (!fs.existsSync(finalV2Path)) {
    console.error("Baseline V2 schema file does not exist.");
    cleanup();
    process.exit(1);
  }

  const generatedV2Raw = JSON.parse(fs.readFileSync(tempV2Path, 'utf-8'));
  const currentV2 = JSON.parse(fs.readFileSync(finalV2Path, 'utf-8'));

  // Apply stable metadata before checking
  const generatedV2 = applyMetadata(generatedV2Raw, 'v2');

  // Compare as normalized JSON strings
  if (JSON.stringify(generatedV2) !== JSON.stringify(currentV2)) {
    console.error("❌ V2 Schema drift detected! The committed schema is out of sync with src/schema/exportTypesV2.ts.");
    console.error("Please run: npm run schema:generate");
    cleanup();
    process.exit(1);
  }

  cleanup();
  console.log("✅ Schema check passed. No drift detected in V1 and V2 schemas.");
  process.exit(0);
} catch (error) {
  cleanup();
  console.error("Schema check failed during execution:", error);
  process.exit(1);
}
