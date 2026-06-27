import { PageMeta, IPageMeta } from '../models/PageMeta'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export interface PageMetaInput {
  pagePath: string
  metaTitle: string
  metaDescription: string
  metaKeywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
}

export async function getPageMetaByPath(pagePath: string): Promise<IPageMeta | null> {
  return PageMeta.findOne({ pagePath: pagePath.toLowerCase().trim() })
}

export async function listPageMeta(): Promise<IPageMeta[]> {
  return PageMeta.find().sort({ pagePath: 1 })
}

export async function createPageMeta(input: PageMetaInput): Promise<IPageMeta> {
  const existing = await PageMeta.findOne({ pagePath: input.pagePath.toLowerCase().trim() })
  if (existing) throw new ApiError(HttpStatus.CONFLICT, 'Meta for this page path already exists.')
  return PageMeta.create(input)
}

export async function updatePageMeta(id: string, input: Partial<PageMetaInput>): Promise<IPageMeta> {
  const doc = await PageMeta.findByIdAndUpdate(id, input, { new: true, runValidators: true })
  if (!doc) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return doc
}

export async function deletePageMeta(id: string): Promise<void> {
  const doc = await PageMeta.findByIdAndDelete(id)
  if (!doc) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

const SEED_PAGES: PageMetaInput[] = [
  {
    pagePath: '/',
    metaTitle: 'The Fifth Cusp — Astrology, Tarot & Spiritual Services',
    metaDescription: 'Discover your cosmic blueprint with The Fifth Cusp — astrology, numerology, tarot, vastu, and manifestation services tailored for you.',
    metaKeywords: ['astrology', 'tarot', 'numerology', 'vastu', 'manifestation', 'spiritual services'],
  },
  {
    pagePath: '/astrology',
    metaTitle: 'Astrology Services — The Fifth Cusp',
    metaDescription: 'Explore personalised astrology readings, birth chart analysis, and cosmic guidance at The Fifth Cusp.',
    metaKeywords: ['astrology', 'birth chart', 'horoscope', 'vedic astrology', 'kundali'],
  },
  {
    pagePath: '/energy',
    metaTitle: 'Energy Healing Services — The Fifth Cusp',
    metaDescription: 'Balance your energy and restore harmony with expert energy healing sessions at The Fifth Cusp.',
    metaKeywords: ['energy healing', 'chakra balancing', 'reiki', 'aura cleansing'],
  },
  {
    pagePath: '/vastu',
    metaTitle: 'Vastu Shastra Consultations — The Fifth Cusp',
    metaDescription: 'Transform your living and workspaces with Vastu Shastra guidance from The Fifth Cusp experts.',
    metaKeywords: ['vastu shastra', 'vastu consultation', 'home vastu', 'office vastu'],
  },
  {
    pagePath: '/manifestation',
    metaTitle: 'Manifestation & Law of Attraction — The Fifth Cusp',
    metaDescription: 'Unlock the power of manifestation and the law of attraction with tailored programs at The Fifth Cusp.',
    metaKeywords: ['manifestation', 'law of attraction', 'abundance', 'intention setting'],
  },
  {
    pagePath: '/wealth',
    metaTitle: 'Wealth & Abundance Services — The Fifth Cusp',
    metaDescription: 'Explore wealth, abundance, and material harmony services curated by The Fifth Cusp.',
    metaKeywords: ['wealth', 'abundance', 'wellbeing', 'holistic health'],
  },
  {
    pagePath: '/tarot-reading',
    metaTitle: 'Tarot Reading Services — The Fifth Cusp',
    metaDescription: 'Get insightful tarot readings for love, career, and life decisions from expert readers at The Fifth Cusp.',
    metaKeywords: ['tarot reading', 'tarot cards', 'oracle reading', 'psychic reading'],
  },
  {
    pagePath: '/careers',
    metaTitle: 'Careers — Join The Fifth Cusp Team',
    metaDescription: 'Explore career opportunities and join a passionate team at The Fifth Cusp dedicated to spiritual wellness.',
    metaKeywords: ['careers', 'jobs', 'fifth cusp jobs', 'spiritual careers'],
  },
]

export async function seedPageMeta(): Promise<void> {
  // One-time cleanup: '/material' was renamed to '/wealth'.
  await PageMeta.deleteOne({ pagePath: '/material' })

  for (const page of SEED_PAGES) {
    await PageMeta.findOneAndUpdate(
      { pagePath: page.pagePath },
      { $setOnInsert: page },
      { upsert: true },
    )
  }
  console.log(`Seeded ${SEED_PAGES.length} page meta entries`)
}
