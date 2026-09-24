import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db'
import { Service } from '../models/Service'
import { legacyToMrpPricing } from '../utils/money'

/**
 * One-time data migration: move services from the legacy pricing model to MRP + sale price.
 *
 *   Before:  price = list price, discountPercentage applied on top at checkout
 *   After:   mrp   = list price (shown struck-through)
 *            price = sale / offer price actually charged (discount baked in)
 *            discountPercentage = derived from mrp & price, display only
 *
 * The old checkout applied discountPercentage whether or not `isInSale` was on, so any
 * non-zero discount is folded into the new sale price — that's what customers were charged.
 * The old discount also applied to add-ons; add-ons are now charged in full, so services
 * with both are listed for manual review.
 *
 * Dev/staging:  npm run migrate:service-mrp [-- --dry-run]
 * Production:   node dist/scripts/migrateServiceMrp.js [--dry-run]   (with prod env loaded)
 *
 * Idempotent — only touches services that have no `mrp` yet.
 */
const dryRun = process.argv.includes('--dry-run')

async function run() {
  await connectDB()

  const services = await Service.find({ mrp: { $exists: false } })
  const reviewAddOns: string[] = []
  const notInSale: string[] = []

  for (const service of services) {
    const pct = service.discountPercentage ?? 0
    const next = legacyToMrpPricing(service.price, pct)
    console.log(
      `${dryRun ? '[dry-run] ' : ''}${service.sku}: price ${service.price} @ ${pct}% → mrp ${next.mrp}, price ${next.price}, discount ${next.discountPercentage}%`,
    )
    if (pct > 0 && service.addOns.length > 0) reviewAddOns.push(service.sku)
    if (pct > 0 && !service.isInSale) notInSale.push(service.sku)

    if (!dryRun) {
      // updateOne skips full-document validation, so unrelated legacy fields can't block the backfill.
      await Service.updateOne({ _id: service._id }, { $set: next })
    }
  }

  if (notInSale.length) {
    console.warn(
      `Discount folded into price although "In sale" is off (old checkout charged it anyway): ${notInSale.join(', ')}`,
    )
  }
  if (reviewAddOns.length) {
    console.warn(
      `Review add-on prices — the old sale % also discounted add-ons, now charged in full: ${reviewAddOns.join(', ')}`,
    )
  }
  console.log(`${dryRun ? 'Would migrate' : 'Migrated'} ${services.length} service(s)`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
