import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { Testimonial, ITestimonial } from '../models/Testimonial'

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getApprovedTestimonialsByService(serviceName: string) {
  return Testimonial.find({ services: serviceName.toLowerCase(), isApproved: true }, { feedback: 1, clientName: 1, _id: 0 })
}

export async function getAllTestimonials(filter: Partial<Pick<ITestimonial, 'isApproved' | 'isRejected'>> = {}) {
  return Testimonial.find(filter).sort({ createdAt: -1 })
}

export async function getTestimonialById(id: string) {
  const testimonial = await Testimonial.findById(id)
  if (!testimonial) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return testimonial
}

export async function createTestimonial(data: Pick<ITestimonial, 'feedback' | 'clientName' | 'services'>) {
  return Testimonial.create(data)
}

export async function updateTestimonial(id: string, data: Partial<Pick<ITestimonial, 'feedback' | 'clientName' | 'services'>>) {
  const testimonial = await Testimonial.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!testimonial) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return testimonial
}

export async function approveTestimonial(id: string) {
  const testimonial = await Testimonial.findByIdAndUpdate(
    id,
    { isApproved: true, isRejected: false, approvedAt: new Date(), $unset: { rejectedAt: '' } },
    { new: true },
  )
  if (!testimonial) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return testimonial
}

export async function rejectTestimonial(id: string) {
  const testimonial = await Testimonial.findByIdAndUpdate(
    id,
    { isRejected: true, isApproved: false, rejectedAt: new Date(), $unset: { approvedAt: '' } },
    { new: true },
  )
  if (!testimonial) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return testimonial
}

export async function deleteTestimonial(id: string) {
  const testimonial = await Testimonial.findByIdAndDelete(id)
  if (!testimonial) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED_DATA: Partial<ITestimonial>[] = [
  {
    clientName: 'Priya Mehta',
    services: ['material'],
    feedback:
      'The material consultation completely transformed how I think about the items in my home. I never realised how much the metals and fabrics around me were affecting my energy levels. After following the recommendations, my home feels lighter and I sleep much better.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-03-10'),
  },
  {
    clientName: 'Rajan Shetty',
    services: ['material'],
    feedback:
      'I was sceptical at first, but the detailed analysis of materials used in my office was eye-opening. Switching to recommended wood finishes and removing certain metal décor pieces noticeably reduced the tension among my team. Highly recommend this service to any business owner.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-04-02'),
  },
  {
    clientName: 'Ananya Krishnan',
    services: ['material'],
    feedback:
      'The consultant was thorough and easy to understand. I learned which fabrics were best suited for each room and why certain colours in synthetic materials were draining the positive energy of my space. Simple changes, remarkable results.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-04-18'),
  },
  {
    clientName: 'Deepak Oberoi',
    services: ['material'],
    feedback:
      'After years of feeling unsettled in my own home, the material audit identified issues I had completely overlooked. Replacing certain stone surfaces and adjusting the placement of mirrors made an immediate difference. My family now comments on how welcoming our home feels.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-05-01'),
  },
  {
    clientName: 'Sunita Joshi',
    services: ['material'],
    feedback:
      'I booked the material consultation before renovating my kitchen and it saved me from making costly mistakes. The guidance on which countertop materials attract prosperity and which combinations to avoid was practical and backed by clear reasoning. Worth every rupee.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-05-08'),
  },
  {
    clientName: 'Arjun Pillai',
    services: ['material'],
    feedback:
      'The Fifth Cusp team was professional and knowledgeable. Their material analysis helped me choose the right flooring and furniture finishes for my new flat. The report was detailed and the follow-up session cleared all my doubts. I am already seeing positive changes.',
    isApproved: true,
    isRejected: false,
    approvedAt: new Date('2025-05-12'),
  },
]

export async function seedTestimonials() {
  await Testimonial.deleteMany({})
  await Testimonial.insertMany(SEED_DATA)
  console.log(`Seeded ${SEED_DATA.length} testimonials`)
}
