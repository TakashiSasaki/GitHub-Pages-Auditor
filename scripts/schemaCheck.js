import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const tempPath = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1._temp.json');
const finalPath = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1.schema.json');

try {
  // Generate to a temporary location
  execSync(`npx ts-json-schema-generator --path src/schema/exportTypes.ts --type GitHubPagesAuditorExport --out "${tempPath}"`, { stdio: 'inherit' });

  if (!fs.existsSync(finalPath)) {
    console.error("Baseline schema file does not exist.");
    process.exit(1);
  }

  const generated = JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
  const current = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));

  // Clean temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  // Compare both as normalized JSON strings
  const generatedStr = JSON.stringify(generated);
  const currentStr = JSON.stringify(current);

  if (generatedStr !== currentStr) {
    console.error("❌ Schema drift detected! The committed schema is out of sync with src/schema/exportTypes.ts.");
    console.error("Please run: npm run schema:generate");
    process.exit(1);
  }

  console.log("✅ Schema check passed. No drift detected.");
  process.exit(0);
} catch (error) {
  if (fs.existsSync(tempPath)) {
    try { fs.unlinkSync(tempPath); } catch (_) {}
  }
  console.error("Schema check failed during execution:", error);
  process.exit(1);
}
