import { google } from 'googleapis'
import env from './env'

/**
 * Normalize the private key from the env var.
 * - Strips surrounding quotes that may have been captured literally
 * - Converts escaped "\n" sequences into real newlines (needed when the key
 *   is stored as a single line). If dotenv already expanded them, this is a no-op.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim()
  // Remove a single pair of wrapping quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, '\n')
}

const privateKey = normalizePrivateKey(env.GOOGLE_PRIVATE_KEY)

const auth = new google.auth.JWT({
  email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  // In Workspace mode, impersonate a real user via Domain-Wide Delegation so that
  // Meet link generation and attendee invites are permitted.
  ...(env.GOOGLE_WORKSPACE_MODE && env.GOOGLE_IMPERSONATE_EMAIL
    ? { subject: env.GOOGLE_IMPERSONATE_EMAIL }
    : {}),
})

export const calendar = google.calendar({ version: 'v3', auth })
