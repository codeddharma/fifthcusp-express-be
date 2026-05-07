import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { Faq, IFaq } from '../models/Faq'

const SEED_DATA: Partial<IFaq>[] = [
  {
    page: 'home',
    faqs: [
      {
        question: 'What is The Fifth Cusp?',
        answer:
          'The Fifth Cusp is a premium astrology and spiritual wellness platform that connects you with experienced Vedic astrologers, numerologists, and Vastu consultants for personalised guidance across all areas of life.',
        isActive: true,
      },
      {
        question: 'How do I book a consultation?',
        answer:
          'Simply browse our Services page, choose the consultation that resonates with you, and proceed to checkout. Once payment is confirmed, our team will reach out within 24 hours to schedule your session at a time that suits you.',
        isActive: true,
      },
      {
        question: 'Are the astrologers certified?',
        answer:
          'Yes. Every astrologer and consultant on The Fifth Cusp has been rigorously vetted for their credentials, practical experience, and accuracy. Many hold formal certifications from recognised Vedic astrology institutes.',
        isActive: true,
      },
      {
        question: 'How are predictions made?',
        answer:
          'Our astrologers use classical Vedic (Jyotish) methods — analysing your birth chart (Kundali), planetary positions, dasha periods, and current transits — to provide accurate, actionable insights rather than generic forecasts.',
        isActive: true,
      },
      {
        question: 'Can I get a refund if I am not satisfied?',
        answer:
          'We offer a satisfaction guarantee. If you are not happy with your session, contact our support team within 48 hours and we will either arrange a complimentary follow-up session or process a full refund — no questions asked.',
        isActive: true,
      },
    ],
  },
]

export async function getAllFaqs(): Promise<IFaq[]> {
  return Faq.find({}, { __v: 0 }).sort({ createdAt: -1 })
}

export async function getFaqByPage(page: string): Promise<IFaq['faqs']> {
  const faq = await Faq.findOne({ page: page.toLowerCase() }, { _id: 0, faqs: 1 })
  if (!faq) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return faq.faqs
}

export async function getFaqById(id: string): Promise<IFaq> {
  const faq = await Faq.findById(id, { __v: 0 })
  if (!faq) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return faq
}

export async function createFaq(data: Partial<IFaq>): Promise<IFaq> {
  return Faq.create(data)
}

export async function updateFaq(id: string, data: Partial<IFaq>): Promise<IFaq> {
  const faq = await Faq.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!faq) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return faq
}

export async function deleteFaq(id: string): Promise<void> {
  const faq = await Faq.findByIdAndDelete(id)
  if (!faq) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

export async function seedFaqs(): Promise<void> {
  await Faq.deleteMany({})
  await Faq.insertMany(SEED_DATA)
  console.log(`Seeded ${SEED_DATA.length} FAQ page(s)`)
}
