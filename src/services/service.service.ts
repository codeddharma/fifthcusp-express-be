import { SortOrder } from 'mongoose'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { FieldType, IFileUploadField, IFormInput, IService, Service, ServiceType } from '../models/Service'

// ─── SKU generator ────────────────────────────────────────────────────────────

export function generateSku(title: string): string {
  const slug = title.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  const rand = Math.random().toString(16).slice(2, 6)
  return `SVC-${slug}-${rand}`
}

// ─── Shared field helpers ─────────────────────────────────────────────────────

const f = (fieldKey: string, label: string, type: FieldType, isRequired: boolean, order: number, extra: Partial<IFormInput> = {}): IFormInput => ({
  fieldKey,
  label,
  type,
  isRequired,
  order,
  ...extra,
})

const basicPersonal = (startOrder = 0): IFormInput[] => [
  f('firstName', 'First Name', 'text', true, startOrder, { placeholder: 'Enter your first name' }),
  f('lastName', 'Last Name', 'text', true, startOrder + 1, { placeholder: 'Enter your last name' }),
  f('email', 'Email Address', 'email', true, startOrder + 2, { placeholder: 'your@email.com' }),
  f('phone', 'Phone Number', 'phonenumber', true, startOrder + 3),
]

const kundaliFields = (startOrder = 0): IFormInput[] => [
  ...basicPersonal(startOrder),
  f('dateOfBirth', 'Date of Birth', 'date', true, startOrder + 4, { validation: { maxDate: 'today' } }),
  f('birthTime', 'Birth Time', 'text', false, startOrder + 5, {
    placeholder: 'e.g. 10:30 AM',
    tooltip: 'Exact birth time significantly improves reading accuracy. Approximate is fine if unknown.',
  }),
  f('birthPlace', 'Birth Place', 'text', true, startOrder + 6, { placeholder: 'City, State, Country' }),
]

const partnerKundaliFields = (startOrder = 7): IFormInput[] => [
  f('partnerFirstName', "Partner's First Name", 'text', true, startOrder),
  f('partnerLastName', "Partner's Last Name", 'text', true, startOrder + 1),
  f('partnerDateOfBirth', "Partner's Date of Birth", 'date', true, startOrder + 2, { validation: { maxDate: 'today' } }),
  f('partnerBirthTime', "Partner's Birth Time", 'text', false, startOrder + 3, {
    placeholder: 'e.g. 10:30 AM',
    tooltip: 'Approximate birth time is fine.',
  }),
  f('partnerBirthPlace', "Partner's Birth Place", 'text', true, startOrder + 4, { placeholder: 'City, State, Country' }),
]

const questionField = (order: number): IFormInput =>
  f('question', 'Your Question', 'textarea', false, order, {
    placeholder: 'What specific question or area would you like guidance on?',
    tooltip: 'Providing a focused question helps tailor the reading to your needs.',
    validation: { maxLength: 500 },
  })

const floorPlanUpload = (order = 0): IFileUploadField => ({
  fieldKey: 'floorPlan',
  label: 'Floor Plan / Layout',
  tooltip: 'Upload your floor plan or a hand-drawn sketch. Clear photos of each room are also accepted.',
  acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
  maxFiles: 3,
  maxFileSizeMB: 10,
  isRequired: true,
  order,
})

const kundaliDocUpload = (order = 0, isRequired = false): IFileUploadField => ({
  fieldKey: 'kundaliDocument',
  label: 'Existing Kundali Document (optional)',
  tooltip: 'Upload your existing kundali PDF or image if you have one. Not required — we generate it from your birth details.',
  acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
  maxFiles: 1,
  maxFileSizeMB: 5,
  isRequired,
  order,
})

// ─── Seed data ────────────────────────────────────────────────────────────────

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
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      questionField(7),
    ],
    fileUploads: [kundaliDocUpload(0)],
    addOns: [
      {
        key: 'partnerKundali',
        label: 'Add Partner Kundali Reading',
        description: 'Include a reading for your partner or spouse in the same session.',
        price: 799,
        formInputs: partnerKundaliFields(),
        fileUploads: [],
      },
    ],
    repeatableGroup: {
      enabled: true,
      label: 'Add Another Person',
      maxRepeats: 5,
    },
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
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      ...partnerKundaliFields(7),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('currentOccupation', 'Current Occupation', 'text', false, 7, { placeholder: 'e.g. Software Engineer, Business Owner' }),
      questionField(8),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('fullName', 'Full Name (as on birth certificate)', 'text', true, 4, {
        placeholder: 'Enter your full legal name',
        tooltip: 'Your full name as it appears on your birth certificate is used to calculate your destiny and soul urge numbers.',
      }),
      f('dateOfBirth', 'Date of Birth', 'date', true, 5, { validation: { maxDate: 'today' } }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('propertyType', 'Property Type', 'dropdown', true, 4, { options: ['Home', 'Office', 'Shop', 'Factory', 'Other'] }),
      f('propertyAddress', 'Property Address', 'textarea', true, 5, { placeholder: 'Full address of the property to be assessed' }),
      f('mainConcern', 'Main Concern', 'textarea', false, 6, {
        placeholder: 'e.g. financial losses, health issues, relationship conflicts',
        tooltip: 'Describe the issues you have been experiencing in this space.',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [floorPlanUpload(0)],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: kundaliFields(),
    fileUploads: [kundaliDocUpload(0)],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      questionField(7),
    ],
    fileUploads: [kundaliDocUpload(0)],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      ...partnerKundaliFields(7),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('businessName', 'Business Name', 'text', false, 7, { placeholder: 'Your business or brand name' }),
      f('businessType', 'Business Type / Industry', 'text', false, 8, { placeholder: 'e.g. E-commerce, Real Estate, Healthcare' }),
      questionField(9),
    ],
    fileUploads: [],
    addOns: [
      {
        key: 'coFounderChart',
        label: "Add Co-founder's Chart Analysis",
        description: "Include your co-founder's birth chart for partnership compatibility assessment.",
        price: 1499,
        formInputs: partnerKundaliFields(),
        fileUploads: [],
      },
    ],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      questionField(7),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: kundaliFields(),
    fileUploads: [kundaliDocUpload(0)],
    addOns: [],
    repeatableGroup: {
      enabled: true,
      label: 'Add Another Family Member',
      maxRepeats: 5,
    },
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
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('currentConcern', 'Current Energy Concern', 'textarea', false, 4, {
        placeholder: 'e.g. fatigue, anxiety, emotional heaviness',
        tooltip: 'Describe what you have been experiencing so we can focus the scan effectively.',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('primarySymptoms', 'Primary Symptoms / Concerns', 'multiSelect', false, 4, {
        options: ['Fatigue', 'Anxiety', 'Digestive issues', 'Lack of confidence', 'Difficulty communicating', 'Emotional numbness', 'Spiritual disconnection'],
        tooltip: 'Select all that apply. This helps us focus on the most affected chakras.',
      }),
      f('additionalNotes', 'Additional Notes', 'textarea', false, 5, {
        placeholder: 'Anything else you would like us to know before the session',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('cleansingTarget', 'What needs cleansing?', 'radio', true, 4, {
        options: ['Personal energy field', 'Home or living space', 'Office or workspace', 'Both self and space'],
      }),
      f('recentEvents', 'Recent Triggering Events', 'textarea', false, 5, {
        placeholder: 'e.g. moved to a new house, ended a relationship, loss of a loved one',
        tooltip: 'Helps us understand the source of the energy imbalance.',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('healingIntention', 'Primary Healing Intention', 'dropdown', true, 4, {
        options: ['Protection', 'Healing', 'Manifestation', 'Love & relationships', 'Clarity & focus', 'Spiritual growth', 'Grounding'],
      }),
      f('currentChallenges', 'Current Challenges', 'textarea', false, 5, {
        placeholder: 'Describe what you are currently going through',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('primaryGoal', 'Primary Goal for this Programme', 'textarea', true, 4, {
        placeholder: 'What do you hope to achieve through this programme?',
        validation: { maxLength: 400 },
      }),
      f('medicalHistory', 'Relevant Health Background', 'textarea', false, 5, {
        placeholder: 'Any chronic conditions or recent health events we should be aware of',
        tooltip: 'This is kept strictly confidential and helps us tailor the sessions safely.',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('recurringPatterns', 'Recurring Patterns or Fears', 'textarea', false, 4, {
        placeholder: 'e.g. fear of abandonment, repeated relationship failures, unexplained phobias',
        tooltip: 'These often point to past-life imprints that the regression will target.',
        validation: { maxLength: 400 },
      }),
      questionField(5),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('energyConcern', 'Main Energy Concern', 'textarea', false, 7, {
        placeholder: 'Describe the energy or emotional challenges you have been experiencing',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 21,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('chronicCondition', 'Chronic Condition or Issue', 'textarea', true, 4, {
        placeholder: 'Describe the ongoing physical, emotional, or energetic issue you want addressed',
        validation: { maxLength: 400 },
      }),
      f('previousHealing', 'Previous Healing Treatments', 'textarea', false, 5, {
        placeholder: 'List any past healing modalities you have tried',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('fullName', 'Full Name (as on birth certificate)', 'text', true, 4, {
        placeholder: 'Enter your full legal name',
        tooltip: 'Used to calculate your Destiny and Soul Urge numbers. Include middle name if any.',
      }),
      f('dateOfBirth', 'Date of Birth', 'date', true, 5, { validation: { maxDate: 'today' } }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('currentFullName', 'Current Full Name', 'text', true, 4, {
        placeholder: 'Name you currently use (including any nickname or professional name)',
      }),
      f('birthFullName', 'Full Name on Birth Certificate', 'text', true, 5, {
        placeholder: 'Legal name as on birth certificate',
        tooltip: 'This is used as the numerological baseline for correction analysis.',
      }),
      f('dateOfBirth', 'Date of Birth', 'date', true, 6, { validation: { maxDate: 'today' } }),
      f('purpose', 'Purpose of Name Correction', 'dropdown', false, 7, {
        options: ['Career & business success', 'Better relationships', 'Health improvement', 'Spiritual alignment', 'General prosperity'],
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('topicOfConcern', 'Topic / Area of Concern', 'dropdown', true, 7, {
        options: ['Career & Finance', 'Relationships & Marriage', 'Health', 'Spirituality', 'Family', 'Education', 'General Life Guidance'],
      }),
      questionField(8),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('currentProblems', 'Current Problems or Challenges', 'textarea', true, 7, {
        placeholder: 'Describe the life areas where you are facing difficulties',
        tooltip: 'This helps us focus the remedial prescription on what matters most to you.',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: kundaliFields(),
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: kundaliFields(),
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 7,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('focusAreas', 'Focus Areas', 'multiSelect', false, 7, {
        options: ['Career', 'Finance', 'Relationships', 'Health', 'Spirituality', 'Family'],
        tooltip: 'Select the life areas you want the report to prioritise.',
      }),
    ],
    fileUploads: [],
    addOns: [],
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
    deliveryDays: 10,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: kundaliFields(),
    fileUploads: [],
    addOns: [],
  },
  // ── Material — Programmes ─────────────────────────────────────────────────────
  {
    title: 'Individual Wealth Programme',
    subtitle: 'A personalised wealth blueprint for your money energy',
    description:
      'A personalised wealth blueprint which takes into account everything which governs your money energy. This program identifies your earning potential, your wealth blocks, your best income channels, manifestation frequency, abundance rituals, and a step wise path to building long term financial stability and freedom.',
    price: 0,
    type: 'advanced',
    pages: ['material'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('currentIncomeSources', 'Current Income Sources', 'textarea', false, 7, {
        placeholder: 'e.g. salaried job, freelancing, business',
        validation: { maxLength: 300 },
      }),
      f('wealthGoal', 'Wealth Goal', 'textarea', true, 8, {
        placeholder: 'What does financial freedom look like for you?',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Business Consulting',
    subtitle: 'Strategic and energetic optimisation for founders and businesses',
    description:
      'A strategic and energetic optimisation programme for founders and businesses across all stages, from pre-seed ideas to fully operational companies seeking clarity, growth, and higher profitability.\n\nThis consultation blends astrology, Vastu, operational insight, financial logic, and practical business psychology to align your organisation with its strongest earning potential.\n\nWe evaluate founder charts, leadership alignment, business timelines, planetary success periods, and energetic strengths to understand the natural rhythm and scalability of the business.\n\nSimultaneously, we fine tune real world aspects such as vendor vetting, site selection, manufacturing layouts, process efficiency, manpower structuring, machinery choices, supply chain integrity, product positioning, pricing strategy, marketing funnels, customer segments, and market entry roadmaps.\n\nWe identify energy leaks in the business, both operational and energetic, and align your physical space, workflows, and decision making with your most favourable zones for revenue, visibility, and long-term growth.\n\nEvery recommendation is tied to tangible KPIs, ROI projections, cost benefit analysis, and industry specific realities so your decisions feel informed, timely, and strategically grounded.\n\nWhether you are building from zero or optimising an existing company, this process removes uncertainty, eliminates hit and trial strategies, reduces risk, prevents avoidable losses, improves cash flow, accelerates your break-even timeline, and strengthens your overall business architecture.\n\nThis is where commercial intelligence meets energetic precision so your business stops relying on guesswork and starts operating from clarity, alignment, and measurable outcomes.\n\nA business that matches its energetic signature becomes easier to scale, more resilient, and naturally profitable.',
    price: 0,
    type: 'advanced',
    pages: ['material'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('businessName', 'Business / Brand Name', 'text', false, 7),
      f('businessStage', 'Business Stage', 'dropdown', true, 8, {
        options: ['Idea / Pre-revenue', 'Early stage (< 1 year)', 'Growing (1–3 years)', 'Established (3+ years)', 'Scaling / Expansion'],
      }),
      f('industry', 'Industry / Sector', 'text', true, 9, { placeholder: 'e.g. Real Estate, E-commerce, Healthcare' }),
      f('primaryChallenge', 'Primary Business Challenge', 'textarea', true, 10, {
        placeholder: 'Describe the main problem or goal you want addressed',
        validation: { maxLength: 500 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Abundance Programme',
    subtitle: 'Rewire your wealth frequency from the inside out',
    description:
      'A transformational inner work programme that rewires your wealth frequency from the inside out, guiding you into a reality where abundance is not something you pursue or have to grind for. It is something you naturally emanate. It builds a smooth eco-system of finances for you.\n\nThis programme changes your relationship with money and makes it easy for you to attract money 24x7. It allows you the freedom of your money working for you, not the other way around. It dissolves the limiting beliefs, subconscious patterns, emotional residues, ancestral imprints, and energetic leaks that restrict the flow of money into your life. You learn the resonating beliefs, your energies are elevated, your chakras are recalibrated, your aura is strengthened, and your manifestation field expands into a powerful, magnetic space capable of attracting and sustaining greater prosperity like it\'s your second nature.\n\nAs your inner system strengthens, you receive personalised affirmations, vision boards, wealth rituals, identity elevation practices, environmental and Vastu corrections, and astrological timelines that reveal your most potent periods for growth and opportunity.\n\nWhat we will be working with is a complete reprogramming of how you attract, receive, and sustain wealth. You rise into a self that no longer strives for abundance from the outside. You become the source of it. Money comes to you naturally, and with ease.\n\nIt is open for limited slots only! If the list is full, you can join the waiting list and you will be offered the slot on a priority basis.',
    price: 0,
    type: 'advanced',
    pages: ['material'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('currentMoneyStory', 'Your Current Relationship with Money', 'textarea', true, 4, {
        placeholder: 'Describe how money has shown up in your life — patterns, beliefs, struggles',
        tooltip: 'Be as honest and detailed as you can. This is kept strictly confidential.',
        validation: { maxLength: 500 },
      }),
      f('abundanceGoal', 'What does abundance mean to you?', 'textarea', true, 5, {
        placeholder: 'Describe your ideal financial reality in vivid detail',
        validation: { maxLength: 500 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Manifestation — Basic ─────────────────────────────────────────────────────
  {
    title: 'Manifestation Clarity Session',
    subtitle: 'Define your desires & remove resistance',
    description:
      'A focused one-on-one session to get crystal clear on what you want to manifest and identify the subconscious beliefs and emotional blocks that are creating resistance. Leaves you with a precise intention statement and a personalised action plan to begin your manifestation journey.',
    price: 999,
    type: 'basic',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('manifestationGoal', 'What do you want to manifest?', 'textarea', true, 4, {
        placeholder: 'Describe your desire in as much detail as possible',
        validation: { maxLength: 500 },
      }),
      f('currentBlock', 'What is holding you back?', 'textarea', false, 5, {
        placeholder: 'e.g. fear, self-doubt, past failures, limiting beliefs',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Vision Board Workshop',
    subtitle: 'Guided visualisation & intention setting',
    description:
      'A guided session to build a powerful, energetically aligned vision board. Combines visualisation techniques, intention-setting rituals, and symbolic imagery to help you lock in a clear mental picture of your desired reality and activate your manifestation frequency.',
    price: 799,
    type: 'basic',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 5,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('lifeAreas', 'Life Areas to Include', 'multiSelect', true, 4, {
        options: ['Career & wealth', 'Relationships & love', 'Health & wellness', 'Travel & experiences', 'Spiritual growth', 'Family'],
        tooltip: 'Select the areas you want your vision board to focus on.',
      }),
      f('currentVision', 'Describe your ideal life in 1–2 years', 'textarea', false, 5, {
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Daily Manifestation Ritual Kit',
    subtitle: 'Personalised affirmations & morning routine plan',
    description:
      'Receive a fully personalised daily ritual plan including morning affirmations, journaling prompts, visualisation scripts, and evening gratitude practices — all tailored to your specific manifestation goals and energetic needs to build a consistent, high-frequency daily routine.',
    price: 599,
    type: 'basic',
    pages: ['manifestation'],
    isInSale: true,
    saleTitle: 'Starter Special',
    hasSaleBanner: true,
    discountPercentage: 15,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('primaryGoal', 'Primary Manifestation Goal', 'text', true, 4, { placeholder: 'e.g. land a new job, attract a partner, build wealth' }),
      f('dailyTimeAvailable', 'Time available for daily practice', 'dropdown', true, 5, {
        options: ['5–10 minutes', '15–20 minutes', '30 minutes', '1 hour'],
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Manifestation — Advanced ──────────────────────────────────────────────────
  {
    title: '21-Day Manifestation Programme',
    subtitle: 'Deep reprogramming over 3 weeks',
    description:
      'A structured 21-day immersive programme to rewire your subconscious mind and align your entire energy field with your desires. Each week targets a different layer — belief clearing, identity elevation, and energetic alignment — with daily practices, check-ins, and personalised support throughout.',
    price: 4999,
    type: 'advanced',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 21,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('coreDesire', 'Core Desire for this Programme', 'textarea', true, 4, {
        placeholder: 'What is the one thing you most want to manifest in the next 21 days?',
        validation: { maxLength: 400 },
      }),
      f('limitingBelief', 'Biggest Limiting Belief', 'textarea', false, 5, {
        placeholder: 'The thought that makes you doubt you can have what you want',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Manifestation & Astrology Alignment',
    subtitle: 'Align your desires to your most powerful planetary windows',
    description:
      'A combined astrology and manifestation session that maps your birth chart to identify your strongest natural manifestation periods, planetary supports, and energetic weak points. Includes a personalised manifestation calendar with auspicious timings for setting intentions, taking action, and releasing what no longer serves you.',
    price: 5499,
    type: 'advanced',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      f('manifestationGoal', 'What do you want to manifest?', 'textarea', true, 7, {
        placeholder: 'Be as specific as possible about your desired outcome',
        validation: { maxLength: 500 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Abundance Identity Shift',
    subtitle: 'Subconscious reprogramming for wealth & success',
    description:
      'A deep-dive advanced programme targeting the identity-level beliefs that block abundance. Using a combination of NLP techniques, hypnotic scripting, chakra work, and energetic anchoring, this programme dismantles scarcity identity and rebuilds a self-concept rooted in worthiness, confidence, and natural prosperity.',
    price: 6999,
    type: 'advanced',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 14,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('scarcityPattern', 'Describe your scarcity or lack pattern', 'textarea', true, 4, {
        placeholder: 'How does scarcity show up in your thoughts, emotions, and life?',
        validation: { maxLength: 500 },
      }),
      f('desiredIdentity', 'Who do you want to become?', 'textarea', true, 5, {
        placeholder: 'Describe the abundant, successful version of yourself',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Manifestation — Practice ──────────────────────────────────────────────────
  {
    title: 'Scripting Mastery Workshop',
    subtitle: 'Learn the scripting method for manifestation',
    description:
      'A hands-on workshop teaching the scripting manifestation technique — writing your desired reality in the present tense as if it has already happened. Covers how to script effectively, common mistakes, how to match the emotional frequency of your words, and how to build a sustainable scripting practice into your daily routine.',
    price: 1299,
    type: 'practice',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('scriptingGoal', 'What will you script for?', 'text', true, 4, { placeholder: 'e.g. dream job, ideal partner, financial abundance' }),
      f('experienceLevel', 'Experience with Manifestation', 'radio', true, 5, {
        options: ['Complete beginner', 'Tried a few techniques', 'Regular practitioner'],
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: '369 Method Guided Practice',
    subtitle: 'Nikola Tesla method with daily prompts & support',
    description:
      'A guided 33-day practice using the 369 manifestation method — writing your affirmation 3 times in the morning, 6 times in the afternoon, and 9 times at night. Includes your personalised affirmation script, daily journal prompts, weekly energy check-ins, and guidance on maintaining belief and momentum throughout the process.',
    price: 999,
    type: 'practice',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('affirmationFocus', 'What is your 369 affirmation focused on?', 'text', true, 4, {
        placeholder: 'e.g. I am financially free, I am in a loving relationship',
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Gratitude & Frequency Elevation',
    subtitle: 'Daily practice to raise your vibration',
    description:
      'A transformative gratitude practice programme designed to shift your baseline emotional frequency. Includes a personalised gratitude protocol, frequency elevation meditations, breath-work techniques, and a structured 14-day practice guide — helping you sustain the high-vibrational state that is essential for effortless manifestation.',
    price: 799,
    type: 'practice',
    pages: ['manifestation'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('currentEmotionalState', 'Describe your current emotional baseline', 'dropdown', true, 4, {
        options: ['Mostly low / heavy', 'Neutral / flat', 'Occasionally high', 'Generally positive'],
        tooltip: 'This helps us calibrate the starting point of your frequency elevation programme.',
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Tarot — Basic ─────────────────────────────────────────────────────────────
  {
    title: 'Single Card Pull',
    subtitle: 'Quick daily guidance reading',
    description:
      'A focused single-card draw to bring clarity to your day or a specific question. The card is interpreted in full context — its upright or reversed meaning, elemental energy, and how it relates to your current situation — delivered as a written reading with actionable insight.',
    price: 499,
    type: 'basic',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 2,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: false,
    formInputs: [
      ...basicPersonal(),
      questionField(4),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Three Card Reading',
    subtitle: 'Past, present & future spread',
    description:
      'A classic three-card tarot spread that illuminates the energies of your past, present, and future in relation to your question. Ideal for gaining perspective on a situation, understanding how you arrived here, and what lies ahead if you continue on your current path.',
    price: 999,
    type: 'basic',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 2,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: false,
    formInputs: [
      ...basicPersonal(),
      f('situation', 'Situation or Topic', 'text', true, 4, { placeholder: 'Briefly describe the situation' }),
      questionField(5),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Celtic Cross Reading',
    subtitle: 'In-depth 10-card life spread',
    description:
      'The most comprehensive single-session tarot spread. Ten cards cover your current situation, obstacles, subconscious influences, past and future energies, your perspective, external influences, hopes and fears, and the likely outcome. Best suited for complex life questions.',
    price: 1999,
    type: 'basic',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('lifeArea', 'Life Area', 'dropdown', true, 4, {
        options: ['Career & finances', 'Love & relationships', 'Health', 'Family', 'Spirituality', 'General'],
      }),
      questionField(5),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Love & Relationship Tarot',
    subtitle: 'Relationship dynamics & compatibility reading',
    description:
      'A dedicated relationship spread exploring the energy between you and a partner (current, potential, or past). Covers emotional dynamics, hidden influences, what each person brings to the connection, and the likely direction of the relationship.',
    price: 1499,
    type: 'basic',
    pages: ['tarot'],
    isInSale: true,
    saleTitle: 'Most Loved',
    hasSaleBanner: true,
    discountPercentage: 10,
    isActiveService: true,
    deliveryDays: 3,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('relationshipStatus', 'Relationship Status', 'radio', true, 4, {
        options: ['In a relationship', 'Single / seeking', 'Complicated / unclear', 'Past relationship'],
      }),
      f('partnerFirstName', "Partner's First Name", 'text', false, 5, { placeholder: 'Leave blank if not applicable' }),
      questionField(6),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Tarot — Advanced ──────────────────────────────────────────────────────────
  {
    title: 'Full Year Tarot Forecast',
    subtitle: 'Monthly card pull for the year ahead',
    description:
      'A 12-card annual forecast with one card drawn for each month of the year. Each monthly card is interpreted in detail, highlighting dominant energies, challenges, and opportunities. The reading is delivered as a comprehensive written report you can revisit throughout the year.',
    price: 4999,
    type: 'advanced',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 7,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('focusTheme', 'Overall Theme or Focus for the Year', 'dropdown', false, 4, {
        options: ['Career & growth', 'Relationships', 'Spiritual development', 'Financial abundance', 'Health & healing', 'General life guidance'],
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Soul Purpose Reading',
    subtitle: 'Deep dive into life path & dharma',
    description:
      'A multi-spread session designed to uncover your soul\'s deeper purpose, karmic patterns, and the gifts you carry into this lifetime. Draws on your birth date to identify life-path archetypes within the tarot, combined with a full spread on dharma, blocks, and the next aligned steps on your path.',
    price: 3499,
    type: 'advanced',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('dateOfBirth', 'Date of Birth', 'date', true, 4, { validation: { maxDate: 'today' } }),
      f('soulQuestion', 'What is your deepest soul question?', 'textarea', false, 5, {
        placeholder: 'e.g. What is my purpose? Why do I keep repeating this pattern?',
        validation: { maxLength: 400 },
      }),
    ],
    fileUploads: [],
    addOns: [],
  },
  {
    title: 'Tarot + Astrology Combo',
    subtitle: 'Combined birth chart & tarot session',
    description:
      'A powerful fusion reading that weaves your Vedic birth chart with a personalised tarot spread. Your planetary placements guide the card selection and interpretation, creating a uniquely layered reading where cosmic timing and symbolic guidance work together to illuminate your path forward.',
    price: 5999,
    type: 'advanced',
    pages: ['tarot'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...kundaliFields(),
      questionField(7),
    ],
    fileUploads: [],
    addOns: [],
  },
  // ── Vastu — Basic ─────────────────────────────────────────────────────────────
  {
    title: 'Home Vastu Consultation',
    subtitle: 'Directional analysis & dosha remedies for your home',
    description:
      'A comprehensive Vastu assessment of your home covering all eight directions, room placements, entrance analysis, and elemental balance. Includes a detailed remedies report with easy-to-implement corrections to enhance health, harmony, and prosperity.',
    price: 2499,
    type: 'basic',
    pages: ['vastu'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('propertyAddress', 'Property Address', 'textarea', true, 4, { placeholder: 'Full address of the home' }),
      f('houseFacing', 'Main Door Facing Direction', 'dropdown', false, 5, {
        options: ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West', 'Not sure'],
        tooltip: 'Stand at your main entrance facing outward — the direction you face is the door facing direction.',
      }),
      f('mainConcern', 'Primary Concern', 'textarea', false, 6, {
        placeholder: 'e.g. health issues, financial stress, family conflicts',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [floorPlanUpload(0)],
    addOns: [],
  },
  {
    title: 'Office Vastu Consultation',
    subtitle: 'Workspace layout & energy flow optimisation',
    description:
      'Optimise your workplace for productivity, positive relationships, and financial growth. Covers seating directions, cash box placement, reception area, and team zone layouts — with practical remedies that require no major structural work.',
    price: 2999,
    type: 'basic',
    pages: ['vastu'],
    isInSale: true,
    saleTitle: 'Business Booster',
    hasSaleBanner: true,
    discountPercentage: 10,
    isActiveService: true,
    deliveryDays: 7,
    requiresConsultation: true,
    requiresOutputFile: false,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('officeAddress', 'Office Address', 'textarea', true, 4, { placeholder: 'Full address of the office' }),
      f('officeSize', 'Approximate Office Size', 'dropdown', false, 5, {
        options: ['Small (< 500 sq ft)', 'Medium (500–2000 sq ft)', 'Large (2000–5000 sq ft)', 'Very large (5000+ sq ft)'],
      }),
      f('teamSize', 'Number of Employees', 'number', false, 6, {
        placeholder: 'Approximate headcount',
        validation: { min: 1, max: 10000 },
      }),
      f('businessChallenge', 'Business Challenge', 'textarea', false, 7, {
        placeholder: 'e.g. low sales, high attrition, conflict among partners',
        validation: { maxLength: 300 },
      }),
    ],
    fileUploads: [floorPlanUpload(0)],
    addOns: [],
  },
  {
    title: 'Vastu for New Property',
    subtitle: 'Site assessment before buying or renting',
    description:
      'Evaluate a property before committing. Covers plot shape, road facing, surrounding environment, internal layout, and key directional factors. Receive a clear buy / avoid recommendation with supporting analysis.',
    price: 1999,
    type: 'basic',
    pages: ['vastu'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('propertyAddress', 'Property Address', 'textarea', true, 4, { placeholder: 'Address or location of the property under consideration' }),
      f('propertyType', 'Property Type', 'dropdown', true, 5, {
        options: ['Residential flat', 'Independent house / villa', 'Plot / land', 'Commercial office', 'Shop / showroom'],
      }),
      f('decisionTimeline', 'Decision Timeline', 'dropdown', false, 6, {
        options: ['Within a week', '1–4 weeks', '1–3 months', 'No fixed timeline'],
      }),
    ],
    fileUploads: [
      {
        fieldKey: 'propertyLayout',
        label: 'Property Layout or Photos',
        tooltip: 'Upload the floor plan, site map, or clear photos of the property.',
        acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
        maxFiles: 5,
        maxFileSizeMB: 10,
        isRequired: false,
        order: 0,
      },
    ],
    addOns: [],
  },
  {
    title: 'Vastu Remedies Report',
    subtitle: 'Personalised written remedies without structural changes',
    description:
      'Already living or working in a space with Vastu doshas? This service provides a tailored written remedies report using colours, mirrors, plants, crystals, and furniture repositioning — zero demolition required.',
    price: 1499,
    type: 'basic',
    pages: ['vastu'],
    isInSale: false,
    hasSaleBanner: false,
    discountPercentage: 0,
    isActiveService: true,
    deliveryDays: 5,
    requiresConsultation: false,
    requiresOutputFile: true,
    feedbackEmailEnabled: true,
    formInputs: [
      ...basicPersonal(),
      f('spaceType', 'Type of Space', 'radio', true, 4, {
        options: ['Home', 'Office', 'Shop', 'Other'],
      }),
      f('propertyAddress', 'Property Address', 'textarea', true, 5, { placeholder: 'Full address' }),
      f('existingIssues', 'Issues you have been experiencing', 'multiSelect', false, 6, {
        options: ['Financial losses', 'Health problems', 'Relationship conflicts', 'Career stagnation', 'Mental stress / anxiety', 'Accidents or mishaps'],
      }),
    ],
    fileUploads: [floorPlanUpload(0)],
    addOns: [],
  },
]

// ─── CRUD operations ──────────────────────────────────────────────────────────

export async function getAllServices(onlyActive = false, type?: ServiceType, page?: string): Promise<IService[]> {
  const filter: Record<string, unknown> = {}
  if (onlyActive) filter.isActiveService = true
  if (type) filter.type = type
  if (page) filter.pages = page.toLowerCase()
  const projection = onlyActive ? { createdAt: 0, updatedAt: 0, __v: 0 } : { __v: 0 }
  const sort: { [key: string]: SortOrder } = onlyActive ? { isInSale: -1, createdAt: -1 } : { createdAt: -1 }
  return Service.find(filter, projection).sort(sort)
}

export async function getServiceById(id: string): Promise<IService> {
  const service = await Service.findById(id)
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return service
}

export async function createService(data: Partial<IService>): Promise<IService> {
  return Service.create({ ...data, sku: generateSku(data.title ?? 'SERVICE') })
}

export async function updateService(id: string, data: Partial<IService>): Promise<IService> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sku: _sku, ...safeData } = data as IService & { sku?: string }
  const service = await Service.findByIdAndUpdate(id, safeData, { new: true, runValidators: true })
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return service
}

export async function deleteService(id: string): Promise<void> {
  const service = await Service.findByIdAndDelete(id)
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

export async function seedServices(): Promise<void> {
  await Service.deleteMany({})
  const withSkus = SEED_DATA.map((s) => ({ ...s, sku: generateSku(s.title ?? 'SERVICE') }))
  await Service.insertMany(withSkus)
  console.log(`Seeded ${withSkus.length} astrology services`)
}
