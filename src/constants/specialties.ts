// Page/section-based specialties assignable to employees. Stored as stable slugs;
// human-readable labels live in the admin UI (fifthcusp-admin lib/constants/specialties.ts).
export const SPECIALTIES = [
  'home',
  'energy_services',
  'astrology_calls',
  'astrology_services',
  'vaastu',
  'manifestation_wellbeing',
  'tarot',
] as const

export type Specialty = (typeof SPECIALTIES)[number]
