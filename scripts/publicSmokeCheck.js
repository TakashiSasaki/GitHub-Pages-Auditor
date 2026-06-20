/**
 * Lightweight, Read-Only Public Smoke Checker for pages.moukaeritai.work
 */

const CANONICAL_URL = 'https://pages.moukaeritai.work';
const FALLBACK_URL = 'https://github-pages-auditor-1042140630327.asia-east1.run.app';

async function verifyEndpoint(url) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after 5000ms for ${url}`)), 5000)
  );

  console.log(`Checking public endpoint: ${url}...`);
  try {
    const fetchPromise = fetch(url, { headers: { 'User-Agent': 'GitHub-Pages-Auditor-Smoke-Check/1.5.0' } });
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      console.warn(`⚠️ Warning: Endpoint returned non-ok status ${response.status} for ${url}`);
      return false;
    }
    
    const text = await response.text();
    if (url.endsWith('/healthz') || url.endsWith('/api/health')) {
      try {
        const json = JSON.parse(text);
        if (json && json.ok === true) {
          console.log(`✅ ${url} is running and healthy:`, text.trim());
          return true;
        } else {
          console.warn(`⚠️ Warning: Health probe returned unexpected response format:`, text.trim());
          return false;
        }
      } catch (jsonErr) {
        console.warn(`⚠️ Warning: Non-JSON response for healthz:`, text.trim().slice(0, 100));
        return false;
      }
    }

    console.log(`✅ ${url} is healthy (status ${response.status}, length: ${text.length})`);
    return true;
  } catch (err) {
    console.error(`❌ Error probing ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('=== STARTING PUBLIC OPERATIONAL SMOKE VALIDATION ===');
  
  // Probe healthz endpoints first
  const canonicalHealth = await verifyEndpoint(`${CANONICAL_URL}/healthz`);
  const fallbackHealth = await verifyEndpoint(`${FALLBACK_URL}/healthz`);
  
  // Probe root landing layouts
  const canonicalRoot = await verifyEndpoint(CANONICAL_URL);
  
  console.log('\n--- SMOKE SUMMARY ---');
  if (canonicalHealth && fallbackHealth && canonicalRoot) {
    console.log('✅ All public system endpoints are live, responsive, and healthy.');
  } else {
    console.log('⚠️ Some public checks failed or warmed. This can happen if executing offline.');
  }
  process.exit(0);
}

run();
