import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db'
import { User } from '../models/User'

/**
 * One-time data migration: clears every user's `specialties` array.
 *
 * Run after deploying the page/section-based specialties change, so existing employees
 * start fresh on the new option set (old service-type slugs are no longer valid).
 *
 * Dev/staging:  npm run migrate:clear-specialties
 * Production:   node dist/scripts/clearUserSpecialties.js   (with prod env loaded)
 *
 * Idempotent — safe to run more than once.
 */
async function run() {
  await connectDB()
  const res = await User.updateMany({}, { $set: { specialties: [] } })
  console.log(`Cleared specialties on ${res.modifiedCount} user(s)`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
