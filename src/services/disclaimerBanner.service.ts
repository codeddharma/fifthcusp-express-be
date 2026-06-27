import { DisclaimerBanner, IDisclaimerBanner } from '../models/DisclaimerBanner'

export async function getDisclaimerBanner(): Promise<IDisclaimerBanner | null> {
  return DisclaimerBanner.findOne()
}

export interface UpsertDisclaimerBannerInput {
  text: string
  isActive?: boolean
  backgroundColor?: string
  textColor?: string
}

export async function upsertDisclaimerBanner(
  data: UpsertDisclaimerBannerInput,
): Promise<IDisclaimerBanner> {
  const existing = await DisclaimerBanner.findOne()
  if (existing) {
    existing.text = data.text
    if (data.isActive !== undefined) existing.isActive = data.isActive
    if (data.backgroundColor) existing.backgroundColor = data.backgroundColor
    if (data.textColor) existing.textColor = data.textColor
    return existing.save()
  }
  return DisclaimerBanner.create(data)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED_BANNER: UpsertDisclaimerBannerInput = {
  text: 'Disclaimer: All readings, reports, and consultations offered by The Fifth Cusp are for guidance and self-awareness purposes only, and do not substitute professional medical, legal, or financial advice.',
  isActive: true,
  backgroundColor: '#d4af37',
  textColor: '#1a0033',
}

export async function seedDisclaimerBanner(): Promise<void> {
  const existing = await DisclaimerBanner.findOne()
  if (existing) {
    console.log('Disclaimer banner already exists, skipping seed')
    return
  }
  await DisclaimerBanner.create(SEED_BANNER)
  console.log('Seeded disclaimer banner')
}
