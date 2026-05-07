import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { IService, Service, ServiceType } from '../models/Service'

const SEED_DATA: Partial<IService>[] = [
  // ── Basic services ────────────────────────────────────────────────────────────
  {
    title: 'Kundali Reading',
    subtitle: 'Detailed birth chart analysis',
    description:
      'Get a comprehensive analysis of your Janam Kundali (birth chart) covering all 12 houses, planetary positions, dashas, and life predictions across career, health, relationships, and spirituality.',
    price: 1499,
    type: 'basic',
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
    isInSale: true,
    saleTitle: 'New Year Special',
    hasSaleBanner: true,
    discountPercentage: 20,
    isActiveService: true,
  },
  // ── Advanced services ─────────────────────────────────────────────────────────
  {
    title: 'Full Birth Chart Deep Dive',
    subtitle: 'Comprehensive lifetime astrological blueprint',
    description:
      'An exhaustive 1-on-1 session covering your entire birth chart — all 12 houses, all planets, yogas, doshas, current dasha periods, and transit impacts — with personalised remedies and a recorded video report.',
    price: 5999,
    type: 'advanced',
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
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
  },
]

export async function getAllServices(onlyActive = false, type?: ServiceType): Promise<IService[]> {
  const filter: Record<string, unknown> = {}
  if (onlyActive) filter.isActiveService = true
  if (type) filter.type = type
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
