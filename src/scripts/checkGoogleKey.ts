import 'dotenv/config'
import crypto from 'crypto'

/**
 * Diagnostic: validates the GOOGLE_PRIVATE_KEY env var without printing the secret.
 * Run with:  npx ts-node src/scripts/checkGoogleKey.ts
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, '\n')
}

const raw = process.env.GOOGLE_PRIVATE_KEY
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

console.log('— Google Service Account diagnostics —')
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL set:', !!email, email ? `(${email})` : '')
console.log('GOOGLE_PRIVATE_KEY set:', !!raw)

if (!raw) {
  console.error('❌ GOOGLE_PRIVATE_KEY is missing')
  process.exit(1)
}

const key = normalizePrivateKey(raw)
console.log('Starts with BEGIN header:', key.startsWith('-----BEGIN PRIVATE KEY-----'))
console.log('Ends with END header:', key.trimEnd().endsWith('-----END PRIVATE KEY-----'))
console.log('Contains real newlines:', key.includes('\n'))
console.log('Number of lines:', key.split('\n').length)

try {
  crypto.createPrivateKey(key)
  console.log('✅ Private key is VALID and parseable by OpenSSL')
} catch (err) {
  console.error('❌ Private key is INVALID:', (err as Error).message)
  console.error('Most likely the \\n newlines were not preserved correctly in .env')
  process.exit(1)
}
