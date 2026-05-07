import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { IService, Service, ServiceType } from '../models/Service'

const SEED_DATA: Partial<IService>[] = [
  // ── Home — Basic ──────────────────────────────────────────────────────────────
  {
    title: 'Kundali Reading',
    subtitle: 'Detailed birth chart analysis',
    description:
      'Get a comprehensive analysis of your Janam Kundali (birth chart) covering all 12 houses, planetary positions, dashas, and life predictions across career, health, relationships, and spirituality.',
    price: 1499,
    type: 'basic',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Kundali Milan',
    subtitle: 'Marriage compatibility matching',
    description:
      'Detailed horoscope matching for marriage using Ashtakoota Milan system. Evaluates 36 gunas, Mangal dosha, and overall compatibility to give you a thorough pre-marriage compatibility report.',
    price: 1999,
    type: 'basic',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Career & Finance Horoscope',
    subtitle: 'Planetary guidance for professional growth',
    description:
      'Understand your career trajectory and financial prospects through your birth chart. Covers favourable periods, best career fields, wealth yogas, and actionable remedies to overcome obstacles.',
    price: 1299,
    type: 'basic',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Numerology Analysis',
    subtitle: 'Life path & destiny number reading',
    description:
      'In-depth numerology report based on your name and date of birth. Covers life path number, destiny number, soul urge, personality traits, lucky numbers, and best dates for important decisions.',
    price: 999,
    type: 'basic',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Vastu Consultation',
    subtitle: 'Harmonise your living & work space',
    description:
      'Online Vastu Shastra consultation for home or office. Includes floor-plan review, directional analysis, remedies for doshas, and recommendations to enhance prosperity, health, and peace.',
    price: 2499,
    type: 'basic',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Annual Horoscope Report',
    subtitle: 'Your complete year ahead forecast',
    description:
      'Month-by-month prediction for the coming year covering all life areas — career, finances, health, love, and spirituality — along with remedies and auspicious timings tailored to your chart.',
    price: 2999,
    type: 'basic',
    pages: ['home'],
    isInSale: true,
    saleTitle: 'New Year Special',
    hasSaleBanner: true,
    discountPercentage: 20,
    isActiveService: true,
  },
  // ── Home — Advanced ───────────────────────────────────────────────────────────
  {
    title: 'Full Birth Chart Deep Dive',
    subtitle: 'Comprehensive lifetime astrological blueprint',
    description:
      'An exhaustive 1-on-1 session covering your entire birth chart — all 12 houses, all planets, yogas, doshas, current dasha periods, and transit impacts — with personalised remedies and a recorded video report.',
    price: 5999,
    type: 'advanced',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Relationship Compatibility Deep Dive',
    subtitle: 'In-depth synastry & composite analysis',
    description:
      'Goes beyond basic Kundali Milan — includes synastry chart overlay, composite chart reading, Navamsa compatibility, karmic patterns, and a detailed written report with practical relationship guidance.',
    price: 4999,
    type: 'advanced',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Business Astrology Consultation',
    subtitle: 'Launch timing, partner compatibility & growth cycles',
    description:
      'Covers muhurta selection for business launch, partner/co-founder compatibility, favourable periods for expansion and investment, industry-specific planetary analysis, and yearly business forecasts.',
    price: 6499,
    type: 'advanced',
    pages: ['home'],
    isInSale: true,
    saleTitle: 'Launch Offer',
    hasSaleBanner: true,
    discountPercentage: 15,
    isActiveService: true,
  },
  {
    title: 'Spiritual Path & Past Life Reading',
    subtitle: 'Karmic blueprint & soul purpose analysis',
    description:
      'Deep exploration of your 12th house, Rahu-Ketu axis, and Navamsa chart to uncover past-life karmas, soul lessons, and your spiritual dharma in this lifetime — includes guided meditation recommendations.',
    price: 5499,
    type: 'advanced',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Annual Personalised Forecast Package',
    subtitle: 'Full-year 1-on-1 advisory with quarterly check-ins',
    description:
      'A premium yearly package that includes an in-depth birth chart session, monthly transit reports, four 30-minute quarterly review calls, and priority WhatsApp support for urgent astrological queries.',
    price: 11999,
    type: 'advanced',
    pages: ['home'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  // ── Energy — Basic ────────────────────────────────────────────────────────────
  {
    title: 'Aura Reading',
    subtitle: 'Reveal the colours & health of your energy field',
    description:
      'A focused scan of your personal aura to identify dominant energy colours, weak zones, and emotional imprints. Includes a written summary with simple daily practices to strengthen and protect your field.',
    price: 1199,
    type: 'basic',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Chakra Balancing Session',
    subtitle: 'Identify & clear blocked energy centres',
    description:
      'A guided session to assess and rebalance all seven chakras. Blockages and overactive centres are addressed using breathwork, visualisation, and sound frequencies, leaving you feeling centred and clear.',
    price: 1499,
    type: 'basic',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Energy Cleansing Ritual',
    subtitle: 'Remove negativity from your body & space',
    description:
      'A remote or in-person ritual to clear stagnant, negative, or foreign energies from your personal field and living environment. Uses smudging, mantras, and intention-setting techniques.',
    price: 999,
    type: 'basic',
    pages: ['energy'],
    isInSale: true,
    saleTitle: 'First Session Offer',
    hasSaleBanner: true,
    discountPercentage: 10,
    isActiveService: true,
  },
  {
    title: 'Crystal Healing Consultation',
    subtitle: 'Personalised crystal prescription for your energy needs',
    description:
      'Based on your energy assessment and intentions, receive a tailored crystal prescription with guidance on placement, cleansing routines, and how to use each stone for healing, protection, or manifestation.',
    price: 1299,
    type: 'basic',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  // ── Energy — Advanced ─────────────────────────────────────────────────────────
  {
    title: 'Full Chakra & Aura Deep Dive',
    subtitle: 'Comprehensive multi-session energy assessment',
    description:
      'A three-session programme covering a full aura scan, detailed chakra assessment, targeted healing work, and a follow-up progress review. Includes a personalised energy maintenance plan delivered as a written report.',
    price: 4999,
    type: 'advanced',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Past Life Energy Regression',
    subtitle: 'Uncover & release deep karmic energy patterns',
    description:
      'A guided regression journey to identify past-life traumas and karmic imprints stored in your energy body. Sessions are conducted in a safe, meditative state with post-session integration support.',
    price: 5499,
    type: 'advanced',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Energy & Astrology Combined Reading',
    subtitle: 'Birth chart mapped to your energy centres',
    description:
      'A unique fusion session that maps your Vedic birth chart directly to your chakra system — revealing which planetary placements are influencing specific energy centres and providing both astrological and energetic remedies.',
    price: 6499,
    type: 'advanced',
    pages: ['energy'],
    isInSale: true,
    saleTitle: 'Exclusive Combo',
    hasSaleBanner: true,
    discountPercentage: 15,
    isActiveService: true,
  },
  {
    title: 'Advanced Pranic Healing Package',
    subtitle: 'Multi-session pranic healing with progress tracking',
    description:
      'A structured six-session pranic healing programme targeting chronic energy imbalances. Each session builds on the last, with progress tracked via aura scans. Includes dietary and lifestyle recommendations to support energetic healing.',
    price: 9999,
    type: 'advanced',
    pages: ['energy'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  // ── Astrology — Numerology ────────────────────────────────────────────────────
  {
    title: 'Numerology Birth Chart Reading',
    subtitle: 'Decode the numbers hidden in your name & date of birth',
    description:
      'A comprehensive numerology reading that analyses your Life Path, Destiny, Soul Urge, and Personality numbers derived from your name and date of birth. Reveals your core strengths, karmic lessons, and most auspicious life directions.',
    price: 1299,
    type: 'numerology',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Name Correction Consultation',
    subtitle: 'Align your name vibration to your destiny number',
    description:
      'Your name carries a numeric vibration that can either support or hinder your destiny. This session analyses your current name, identifies misalignments, and recommends spelling adjustments or alternate names to bring harmony between your birth numbers and name energy.',
    price: 1799,
    type: 'numerology',
    pages: ['astrology'],
    isInSale: true,
    saleTitle: 'Popular Pick',
    hasSaleBanner: true,
    discountPercentage: 10,
    isActiveService: true,
  },
  // ── Astrology — Consultation ──────────────────────────────────────────────────
  {
    title: 'One-on-One Astrology Consultation',
    subtitle: 'Live personalised session with a Vedic astrologer',
    description:
      'A 60-minute live consultation covering your birth chart, current dasha, and pressing life questions. Ask anything — career transitions, relationship concerns, health, or spirituality — and receive actionable, chart-backed guidance.',
    price: 2999,
    type: 'consultation',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Remedial Measures Consultation',
    subtitle: 'Personalised rituals, mantras & gemstone advice',
    description:
      'Targeted remedies prescribed based on your birth chart to pacify malefic planets and strengthen benefics. Includes gemstone recommendations, specific mantras, charitable acts, and Yantra usage — all explained with the reasoning behind each remedy.',
    price: 2499,
    type: 'consultation',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  // ── Astrology — Reports Basic ─────────────────────────────────────────────────
  {
    title: 'Personalised Kundali Report',
    subtitle: 'Detailed PDF birth chart report',
    description:
      'A thorough written report of your Vedic birth chart covering all 12 houses, planetary dignities, key yogas, and a summary of major life themes. Delivered as a formatted PDF within 48 hours of your order.',
    price: 999,
    type: 'reports_basic',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: 'Annual Transit Forecast Report',
    subtitle: '12-month planetary transit report',
    description:
      'A month-by-month written forecast for the year ahead, mapping major planetary transits against your natal chart. Highlights favourable periods, caution zones, and recommended actions for each month across career, health, and relationships.',
    price: 1499,
    type: 'reports_basic',
    pages: ['astrology'],
    isInSale: true,
    saleTitle: 'New Year Special',
    hasSaleBanner: true,
    discountPercentage: 15,
    isActiveService: true,
  },
  // ── Astrology — Reports Advanced ──────────────────────────────────────────────
  {
    title: 'Comprehensive Life Report',
    subtitle: 'Multi-chapter PDF covering all life areas',
    description:
      'An exhaustive astrological life report spanning career, finances, relationships, health, spirituality, and family. Uses Rashi, Navamsa, Dashamsha, and other divisional charts alongside dasha periods to deliver a complete, chapter-by-chapter PDF report.',
    price: 4999,
    type: 'reports_advanced',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
  {
    title: '5-Year Predictive Report',
    subtitle: 'In-depth year-by-year dasha & transit forecast',
    description:
      'A premium five-year predictive report combining Mahadasha and Antardasha analysis, annual Gochara transits, and Varshaphal charts. Each year is covered in detail with specific windows for action, caution periods, and tailored remedies — delivered as a comprehensive PDF.',
    price: 8999,
    type: 'reports_advanced',
    pages: ['astrology'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
]

export async function getAllServices(onlyActive = false, type?: ServiceType, page?: string): Promise<IService[]> {
  const filter: Record<string, unknown> = {}
  if (onlyActive) filter.isActiveService = true
  if (type) filter.type = type
  if (page) filter.pages = page.toLowerCase()
  const projection = onlyActive ? { createdAt: 0, updatedAt: 0, __v: 0 } : { __v: 0 }
  const sort = onlyActive ? { isInSale: -1, createdAt: -1 } : { createdAt: -1 }
  return Service.find(filter, projection).sort(sort)
}

export async function getServiceById(id: string): Promise<IService> {
  const service = await Service.findById(id)
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return service
}

export async function createService(data: Partial<IService>): Promise<IService> {
  return Service.create(data)
}

export async function updateService(id: string, data: Partial<IService>): Promise<IService> {
  const service = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return service
}

export async function deleteService(id: string): Promise<void> {
  const service = await Service.findByIdAndDelete(id)
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

export async function seedServices(): Promise<void> {
  await Service.deleteMany({})
  await Service.insertMany(SEED_DATA)
  console.log(`Seeded ${SEED_DATA.length} astrology services`)
}
