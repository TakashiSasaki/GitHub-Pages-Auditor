import * as fs from 'fs';
import * as path from 'path';

const v1Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v1.schema.json');
const v2Path = path.join(process.cwd(), 'schemas/github-pages-auditor-export-v2.schema.json');

export const V1_UUID = 'urn:uuid:ef46fd93-424a-4e2a-8f5b-df97e28b2be1';
export const V2_UUID = 'urn:uuid:7d0f98be-8cba-49c5-84dc-66914b5da3f2';

export function applyMetadata(schemaObj, version) {
  const uuid = version === 'v2' ? V2_UUID : V1_UUID;
  const { $schema, ...rest } = schemaObj;
  return {
    $schema,
    $id: uuid,
    ...rest
  };
}

function run() {
  // Only execute directly if this script is executed via node/npx
  const isDirect = process.argv[1] && (
    process.argv[1].endsWith('applySchemaMetadata.js') || 
    process.argv[1].includes('/applySchemaMetadata.js')
  );
  if (!isDirect) {
    return;
  }
  
  if (fs.existsSync(v1Path)) {
    const rawV1 = fs.readFileSync(v1Path, 'utf-8');
    const enriched = applyMetadata(JSON.parse(rawV1), 'v1');
    fs.writeFileSync(v1Path, JSON.stringify(enriched, null, 2) + '\n');
    console.log(`✅ Applied $id: ${V1_UUID} to schemas/github-pages-auditor-export-v1.schema.json`);
  }

  if (fs.existsSync(v2Path)) {
    const rawV2 = fs.readFileSync(v2Path, 'utf-8');
    const enriched = applyMetadata(JSON.parse(rawV2), 'v2');
    fs.writeFileSync(v2Path, JSON.stringify(enriched, null, 2) + '\n');
    console.log(`✅ Applied $id: ${V2_UUID} to schemas/github-pages-auditor-export-v2.schema.json`);
  }
}

run();
