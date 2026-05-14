import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { JobOpening, IJobOpening } from '../models/JobOpening'

// ─── CRUD ─────────────────────────────────────────────────────────────────────

type JobOpeningFilter = {
  isActive?: boolean
  isClosed?: boolean
  department?: string
}

export async function getAllJobOpenings(filter: JobOpeningFilter = {}) {
  const query: Record<string, unknown> = {}
  if (filter.isActive !== undefined) query.isActive = filter.isActive
  if (filter.isClosed !== undefined) query.isClosed = filter.isClosed
  if (filter.department) query.department = { $regex: new RegExp(filter.department, 'i') }
  return JobOpening.find(query).sort({ createdAt: -1 })
}

export async function getJobOpeningById(id: string) {
  const job = await JobOpening.findById(id)
  if (!job) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return job
}

export async function createJobOpening(data: Omit<IJobOpening, keyof Document | 'isActive' | 'isClosed' | 'closedAt' | 'createdAt' | 'updatedAt'>) {
  return JobOpening.create(data)
}

export async function updateJobOpening(id: string, data: Partial<Omit<IJobOpening, keyof Document | 'closedAt' | 'createdAt' | 'updatedAt'>>) {
  const job = await JobOpening.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!job) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return job
}

export async function closeJobOpening(id: string) {
  const job = await JobOpening.findByIdAndUpdate(
    id,
    { isClosed: true, isActive: false, closedAt: new Date() },
    { new: true },
  )
  if (!job) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return job
}

export async function deleteJobOpening(id: string) {
  const job = await JobOpening.findByIdAndDelete(id)
  if (!job) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED_DATA: Partial<IJobOpening>[] = [
  {
    title: 'Vedic Astrologer',
    department: 'Astrology',
    location: 'Remote',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    experienceYears: 5,
    description:
      'We are looking for an experienced Vedic Astrologer to provide personalised birth chart readings, transit analysis, and predictive consultations to our clients. You will work closely with our team to deliver accurate, compassionate, and actionable astrological guidance.',
    skills: ['Vedic Astrology', 'Kundli Reading', 'Dasha Analysis', 'Transit Forecasting', 'Remedial Astrology'],
    qualifications: [
      'Formal certification or diploma in Vedic Astrology from a recognised institution',
      'Strong command of Parashari and Jaimini systems',
      'Proficiency in astrology software (Jagannatha Hora or equivalent)',
    ],
    responsibilities: [
      'Conduct in-depth birth chart consultations via video or chat',
      'Prepare written astrological reports for clients',
      'Offer remedial guidance including gemstones, mantras, and rituals',
      'Stay updated with planetary transits and publish monthly forecasts',
    ],
    salaryMin: 40000,
    salaryMax: 70000,
    applicationDeadline: new Date('2026-07-31'),
    isActive: true,
    isClosed: false,
  },
  {
    title: 'Vastu Consultant',
    department: 'Vastu',
    location: 'Hybrid – Mumbai',
    employmentType: 'freelance',
    experienceLevel: 'mid',
    experienceYears: 3,
    description:
      'Join our Vastu team to help clients create harmonious living and working spaces. You will conduct on-site and remote assessments, identify Vastu doshas, and recommend practical, non-structural remedies tailored to each property.',
    skills: ['Vastu Shastra', 'Space Energetics', 'Floor Plan Analysis', 'Colour Therapy', 'Five Elements Theory'],
    qualifications: [
      'Certification in Vastu Shastra from a recognised body',
      'Experience with residential and commercial property assessments',
      'Ability to read architectural floor plans',
    ],
    responsibilities: [
      'Conduct on-site and remote Vastu audits',
      'Prepare detailed Vastu reports with room-wise recommendations',
      'Advise on furniture placement, colour schemes, and energetic corrections',
      'Follow up with clients post-implementation to assess results',
    ],
    salaryMin: 30000,
    salaryMax: 55000,
    applicationDeadline: new Date('2026-08-15'),
    isActive: true,
    isClosed: false,
  },
  {
    title: 'Tarot & Numerology Reader',
    department: 'Astrology',
    location: 'Remote',
    employmentType: 'part-time',
    experienceLevel: 'mid',
    experienceYears: 2,
    description:
      'We are seeking a skilled Tarot and Numerology Reader to deliver insightful, empathetic readings to our growing client base. This is a part-time remote role ideal for practitioners who want to work flexible hours while helping people navigate life transitions.',
    skills: ['Tarot Reading', 'Numerology', 'Life Path Analysis', 'Oracle Cards', 'Client Communication'],
    qualifications: [
      'Minimum 2 years of professional Tarot and/or Numerology practice',
      'Strong written and verbal communication skills in English',
      'Comfort with video-based consultations',
    ],
    responsibilities: [
      'Conduct live Tarot and Numerology sessions via video call or chat',
      'Prepare written session summaries for clients',
      'Maintain accurate session notes and client records',
      'Participate in monthly team reviews and training sessions',
    ],
    salaryMin: 20000,
    salaryMax: 35000,
    applicationDeadline: new Date('2026-07-15'),
    isActive: true,
    isClosed: false,
  },
  {
    title: 'Energy Healing Practitioner',
    department: 'Energy Healing',
    location: 'Remote',
    employmentType: 'contract',
    experienceLevel: 'mid',
    experienceYears: 3,
    description:
      'We are looking for a certified Energy Healing Practitioner to offer Reiki, Pranic Healing, or Crystal Healing sessions to our clients. You will work as an independent contractor, conducting sessions online and contributing to our wellness content.',
    skills: ['Reiki', 'Pranic Healing', 'Crystal Healing', 'Chakra Balancing', 'Guided Meditation'],
    qualifications: [
      'Level 2 or above certification in Reiki, Pranic Healing, or an equivalent energy modality',
      'Demonstrated experience with remote healing sessions',
      'Understanding of chakra systems and subtle body anatomy',
    ],
    responsibilities: [
      'Deliver remote energy healing sessions to individual clients',
      'Assess energetic imbalances and recommend appropriate healing protocols',
      'Create follow-up self-care plans for clients',
      'Contribute occasional blog posts or video content on energy healing topics',
    ],
    salaryMin: 25000,
    salaryMax: 45000,
    applicationDeadline: new Date('2026-09-01'),
    isActive: true,
    isClosed: false,
  },
  {
    title: 'Astrology Content Writer',
    department: 'Content',
    location: 'Remote',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    experienceYears: 1,
    description:
      'We need a passionate Astrology Content Writer to create engaging, accurate, and SEO-optimised content for our website, blog, and social media channels. You will work with our astrologers to translate complex astrological concepts into accessible, compelling content for a wide audience.',
    skills: ['Content Writing', 'SEO', 'Vedic Astrology Basics', 'Social Media Copywriting', 'Research'],
    qualifications: [
      'Bachelor\'s degree in English, Journalism, Communications, or a related field',
      'Working knowledge of Vedic or Western astrology',
      'Portfolio of published articles or blog posts',
    ],
    responsibilities: [
      'Write weekly horoscope columns, blog articles, and long-form guides',
      'Collaborate with astrologers to ensure content accuracy',
      'Optimise content for search engines and social sharing',
      'Maintain a consistent brand voice across all platforms',
    ],
    salaryMin: 25000,
    salaryMax: 40000,
    applicationDeadline: new Date('2026-07-31'),
    isActive: true,
    isClosed: false,
  },
  {
    title: 'Client Relations Executive – Astrology',
    department: 'Operations',
    location: 'Hybrid – Bangalore',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    experienceYears: 1,
    description:
      'Join our operations team as a Client Relations Executive to be the first point of contact for our astrology and wellness clients. You will manage bookings, handle enquiries, and ensure every client has a smooth and positive experience with The Fifth Cusp.',
    skills: ['Customer Service', 'CRM Tools', 'Scheduling', 'Communication', 'Problem Solving'],
    qualifications: [
      'Bachelor\'s degree in any discipline',
      'Prior experience in customer service or client-facing roles preferred',
      'Interest in astrology, Vastu, or wellness is an advantage',
    ],
    responsibilities: [
      'Handle client enquiries via phone, email, and chat in a timely manner',
      'Schedule and coordinate consultations between clients and practitioners',
      'Maintain accurate client records in the CRM system',
      'Collect post-session feedback and escalate issues when required',
    ],
    salaryMin: 22000,
    salaryMax: 35000,
    applicationDeadline: new Date('2026-08-31'),
    isActive: true,
    isClosed: false,
  },
]

export async function seedJobOpenings() {
  await JobOpening.deleteMany({})
  await JobOpening.insertMany(SEED_DATA)
  console.log(`Seeded ${SEED_DATA.length} job openings`)
}
