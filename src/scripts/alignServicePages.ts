import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db'
import { Service } from '../models/Service'
import { Faq } from '../models/Faq'
import { PageContent } from '../models/PageContent'

/**
 * One-time data migration: align stored `page` keys with the storefront's actual routes so
 * shareable booking links (and the public pages) resolve.
 *
 *   numerology → astrology       (there is no numerology page; those services live on the
 *                                 astrology page's "Astro Numerology" section)
 *   tarot      → tarot-reading   (the route is /tarot-reading)
 *
 * Updates every collection that stores a page key: `services` (each service's `pages[]`,
 * de-duplicating), `faqs`, and `pagecontents` (the last two have a unique `page`).
 *
 * Dev/staging:  npm run migrate:align-service-pages
 * Production:   node dist/scripts/alignServicePages.js   (with prod env loaded)
 *
 * Idempotent — safe to run more than once.
 */
const PAGE_RENAMES: Record<string, string> = {
  numerology: 'astrology',
  tarot: 'tarot-reading',
}

async function run() {
  await connectDB()

  const oldKeys = Object.keys(PAGE_RENAMES)

  // Services — rewrite each affected service's pages[], de-duplicating.
  const services = await Service.find({ 'pages.page': { $in: oldKeys } })
  let servicesUpdated = 0
  for (const service of services) {
    const seen = new Set<string>()
    const nextPages: { page: string; order: number }[] = []
    for (const p of service.pages) {
      const page = PAGE_RENAMES[p.page] ?? p.page
      if (seen.has(page)) continue // drop a duplicate created by the rename
      seen.add(page)
      nextPages.push({ page, order: p.order })
    }
    service.set('pages', nextPages)
    await service.save()
    servicesUpdated++
  }

  // FAQs — `page` is unique per doc, so rename only when the target isn't already taken.
  let faqsUpdated = 0
  for (const faq of await Faq.find({ page: { $in: oldKeys } })) {
    const target = PAGE_RENAMES[faq.page]
    if (await Faq.exists({ page: target })) {
      console.warn(`Skipped FAQ "${faq.page}" → "${target}": a "${target}" FAQ already exists`)
      continue
    }
    faq.page = target
    await faq.save()
    faqsUpdated++
  }

  // Page-content (CMS) docs — also a unique `page`. Admin-created, so production may hold one.
  let pageContentsUpdated = 0
  for (const doc of await PageContent.find({ page: { $in: oldKeys } })) {
    const target = PAGE_RENAMES[doc.page]
    if (await PageContent.exists({ page: target })) {
      console.warn(`Skipped PageContent "${doc.page}" → "${target}": a "${target}" doc already exists`)
      continue
    }
    doc.page = target
    await doc.save()
    pageContentsUpdated++
  }

  console.log(
    `Aligned ${servicesUpdated} service(s), ${faqsUpdated} FAQ(s), ${pageContentsUpdated} page-content doc(s)`,
  )
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
