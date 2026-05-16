import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { Faq, IFaq } from '../models/Faq'

const SEED_DATA: Partial<IFaq>[] = [
  {
    page: 'vastu',
    faqs: [
      {
        question: 'What is Vastu Shastra?',
        answer:
          'Vastu Shastra is an ancient Indian science of architecture and spatial arrangement that aligns a building with natural energies and the five elements — earth, water, fire, air, and space. When a home or workplace is Vastu-compliant, it supports the wellbeing, prosperity, and harmony of its occupants.',
        isActive: true,
      },
      {
        question: 'Do I need to make structural changes to follow Vastu?',
        answer:
          'Not necessarily. Most Vastu doshas (imbalances) can be corrected using non-structural remedies such as repositioning furniture, changing colours, adding plants or crystals, using mirrors, or placing specific symbols. Structural changes are only recommended when doshas are severe and other remedies are insufficient.',
        isActive: true,
      },
      {
        question: 'Can Vastu be applied to a rented property?',
        answer:
          'Yes. Many Vastu remedies are entirely non-structural and renter-friendly — such as adjusting furniture layout, using colour therapy, adding Vastu plants, or placing energetic corrections. Our consultants specialise in practical solutions that work within rental constraints.',
        isActive: true,
      },
      {
        question: 'How long does it take to see results after Vastu corrections?',
        answer:
          'Most people begin to notice a shift in energy within 21 to 40 days of implementing remedies. Significant life changes — such as improved finances or reduced conflicts — typically become apparent within three to six months, depending on the severity of the original doshas.',
        isActive: true,
      },
      {
        question: 'Is the Vastu consultation done online or in person?',
        answer:
          'We offer both. Online consultations are conducted via video call using your floor plan and photos of the property. In-person visits are available for clients in select cities. Both formats deliver the same depth of analysis and remedies.',
        isActive: true,
      },
    ],
  },
  {
    page: 'astrology',
    faqs: [
      {
        question: 'What is Vedic astrology and how does it differ from Western astrology?',
        answer:
          'Vedic astrology (Jyotish) is an ancient Indian system that uses the sidereal zodiac — aligned with the actual positions of constellations — while Western astrology uses the tropical zodiac. Vedic astrology places greater emphasis on the Moon sign, rising sign, and planetary dashas (time periods) for predictions.',
        isActive: true,
      },
      {
        question: 'What information do I need to provide for my reading?',
        answer:
          'You will need your date of birth, exact time of birth, and place of birth. The birth time is especially important in Vedic astrology as even a few minutes can shift your ascendant and change the entire chart interpretation.',
        isActive: true,
      },
      {
        question: 'How accurate are astrological predictions?',
        answer:
          'Vedic astrology identifies planetary tendencies and time periods rather than fixed outcomes. Accuracy depends on the precision of your birth data and the experience of the astrologer. Our practitioners focus on actionable guidance over generic predictions, helping you make informed decisions.',
        isActive: true,
      },
      {
        question: 'What is a dasha period and why does it matter?',
        answer:
          'A dasha is a planetary time period in Vedic astrology that governs the themes and events active in your life at any given time. Knowing your current and upcoming dasha allows your astrologer to pinpoint favourable windows for career moves, relationships, travel, and spiritual practices.',
        isActive: true,
      },
      {
        question: 'Can astrology help with specific life decisions?',
        answer:
          'Yes. Astrology is particularly useful for timing major decisions — choosing a wedding date, starting a business, relocating, or beginning a new career. Our astrologers use muhurta (electional astrology) to identify the most auspicious timings aligned with your personal chart.',
        isActive: true,
      },
    ],
  },
  {
    page: 'energy',
    faqs: [
      {
        question: 'What is an energy reading?',
        answer:
          'An energy reading is a spiritual assessment of your personal aura and energetic field. Our practitioners sense blockages, imbalances, and strengths in your energy centres (chakras) to provide guidance on healing and growth.',
        isActive: true,
      },
      {
        question: 'How do chakras affect my daily life?',
        answer:
          'Your seven main chakras govern everything from physical health and emotions to communication and intuition. When one or more are blocked or overactive, you may experience anxiety, fatigue, relationship issues, or a general sense of being stuck.',
        isActive: true,
      },
      {
        question: 'What can I expect during an energy healing session?',
        answer:
          'Sessions are conducted remotely or in person. You will be guided into a relaxed state while the practitioner scans and clears your energy field using techniques such as Reiki, pranic healing, or sound therapy. Most clients report feeling lighter and more centred afterwards.',
        isActive: true,
      },
      {
        question: 'How many sessions will I need?',
        answer:
          'This varies by individual. Some experience significant shifts in a single session, while deeper patterns may benefit from three to six sessions spaced one to two weeks apart. Your practitioner will recommend a plan after your initial assessment.',
        isActive: true,
      },
      {
        question: 'Can energy work complement my medical treatment?',
        answer:
          'Yes. Energy healing is a holistic complementary practice and is not a substitute for medical care. It works alongside conventional treatment to support emotional wellbeing, reduce stress, and accelerate the body\'s natural recovery process.',
        isActive: true,
      },
    ],
  },
  {
    page: 'material',
    faqs: [
      {
        question: 'What is the Individual Wealth Programme?',
        answer:
          'The Individual Wealth Programme is a personalised wealth blueprint that analyses everything governing your money energy — your earning potential, wealth blocks, best income channels, manifestation frequency, and abundance rituals — to map a step-by-step path toward long-term financial stability and freedom.',
        isActive: true,
      },
      {
        question: 'Who is the Business Consulting programme for?',
        answer:
          'It is designed for founders and businesses at every stage — from pre-seed ideas to fully operational companies seeking clarity, growth, and higher profitability. Whether you are building from scratch or optimising an existing company, the programme blends astrology, Vastu, financial logic, and operational strategy to align your business with its strongest earning potential.',
        isActive: true,
      },
      {
        question: 'What does the Business Consulting process involve?',
        answer:
          'The consultation covers founder chart analysis, leadership alignment, business timelines, planetary success periods, vendor vetting, site selection, manufacturing layouts, process efficiency, manpower structuring, product positioning, pricing strategy, marketing funnels, and market entry roadmaps. Every recommendation is tied to tangible KPIs, ROI projections, and cost-benefit analysis.',
        isActive: true,
      },
      {
        question: 'What is the Abundance Programme and how is it different from the Wealth Programme?',
        answer:
          'The Abundance Programme is an inner-work transformation that rewires your wealth frequency at the subconscious level — dissolving limiting beliefs, ancestral imprints, and energetic leaks. The Individual Wealth Programme focuses on the external blueprint (income channels, financial strategy), while the Abundance Programme focuses on the internal shift that makes you a natural magnet for wealth.',
        isActive: true,
      },
      {
        question: 'What do I receive in the Abundance Programme?',
        answer:
          'You receive personalised affirmations, vision boards, wealth rituals, identity elevation practices, environmental and Vastu corrections, chakra recalibration, aura strengthening, and astrological timelines highlighting your most potent periods for growth and opportunity.',
        isActive: true,
      },
      {
        question: 'Are slots for the Abundance Programme limited?',
        answer:
          'Yes. The Abundance Programme is open for limited slots only to ensure each participant receives focused, personalised attention. If the programme is full, you can join the waiting list and will be offered a slot on a priority basis.',
        isActive: true,
      },
      {
        question: 'How long do these programmes take?',
        answer:
          'Programme duration varies based on individual needs and is discussed during the initial consultation. Each programme is customised, so timelines are set collaboratively to ensure you receive the depth of work your goals require.',
        isActive: true,
      },
    ],
  },
  {
    page: 'manifestation',
    faqs: [
      {
        question: 'What is manifestation and how does it work?',
        answer:
          'Manifestation is the process of bringing a desired reality into your life by aligning your thoughts, beliefs, emotions, and actions with what you want to create. It is rooted in the understanding that your internal state — your dominant thoughts and emotional frequency — shapes the experiences and opportunities you attract. When your subconscious beliefs and conscious desires are aligned, manifestation becomes natural and effortless.',
        isActive: true,
      },
      {
        question: 'How is manifestation different from positive thinking?',
        answer:
          'Positive thinking focuses on surface-level thoughts, while manifestation works at the level of identity and belief. Simply thinking positively while holding deep subconscious beliefs of unworthiness or scarcity produces little lasting change. True manifestation requires reprogramming the subconscious, elevating your emotional frequency, and taking inspired action — positive thinking is just one small component of a much deeper process.',
        isActive: true,
      },
      {
        question: 'How long does it take to manifest something?',
        answer:
          'Timing varies significantly based on the size of your desire, the depth of any resistance or limiting beliefs, and the consistency of your practice. Small, believable desires can manifest within days or weeks. Larger life changes — a new career, a relationship, financial transformation — typically unfold over months. The key variable is not time but alignment: the closer your internal state is to your desired reality, the faster it arrives.',
        isActive: true,
      },
      {
        question: 'What is the role of belief in manifestation?',
        answer:
          'Belief is the foundation of manifestation. Your subconscious mind acts as a filter — it only allows in experiences that match what it believes to be true about you and the world. If you desire abundance but carry a deep belief that money is scarce or that you are undeserving, those subconscious programs will override your conscious intentions. Our work focuses on identifying and dissolving these blocks so your beliefs and desires become fully aligned.',
        isActive: true,
      },
      {
        question: 'Can manifestation work alongside therapy or other healing modalities?',
        answer:
          'Yes, and it often works best in combination. Manifestation practices complement therapy, energy healing, meditation, and other personal development approaches. Therapy helps process past experiences, energy work clears the field, and manifestation provides a forward-focused framework for creating new realities. Our practitioners are trained to integrate these modalities where appropriate.',
        isActive: true,
      },
      {
        question: 'Which manifestation technique should I start with?',
        answer:
          'This depends on your learning style and goals. Scripting works well for visual, writing-oriented people. The 369 method suits those who benefit from repetition and structure. Visualisation is powerful for those who are strongly kinaesthetic or imaginative. Our Manifestation Clarity Session helps you identify which techniques are most aligned with your energy and design a practice that will feel natural and sustainable for you specifically.',
        isActive: true,
      },
    ],
  },
  {
    page: 'tarot',
    faqs: [
      {
        question: 'What is tarot reading and how does it work?',
        answer:
          'Tarot is a symbolic guidance system using a deck of 78 cards, each carrying archetypal imagery that reflects universal human experiences. A reader draws cards in response to your question or situation and interprets the symbols, positions, and combinations to provide insight into the energies at play and the most likely paths forward.',
        isActive: true,
      },
      {
        question: 'Do I need to believe in tarot for it to work?',
        answer:
          'No prior belief is required. Tarot works as a reflective tool — the cards act as a mirror for your subconscious mind and current circumstances. Many clients who approach readings with healthy scepticism find the process genuinely illuminating because it prompts deeper self-reflection rather than passive prediction.',
        isActive: true,
      },
      {
        question: 'What information do I need to provide for a reading?',
        answer:
          'For most readings, all you need to provide is your question or the area of life you would like guidance on — relationships, career, finances, spirituality, or a general overview. For combination readings that incorporate astrology, your date, time, and place of birth are also required.',
        isActive: true,
      },
      {
        question: 'How accurate are tarot readings?',
        answer:
          'Tarot reflects the energies and tendencies present at the time of the reading rather than fixed, unchangeable outcomes. Accuracy is influenced by the clarity of your question, your openness during the session, and the experience of the reader. Our practitioners focus on meaningful, actionable guidance over vague generalisations.',
        isActive: true,
      },
      {
        question: 'Can tarot predict the future?',
        answer:
          'Tarot reveals probable outcomes based on current energies and choices — not a fixed, inevitable future. Think of it as a GPS: it shows the most likely destination given your current route, but you always have the power to make a turn. Readings are most valuable when used as a tool for reflection and conscious decision-making.',
        isActive: true,
      },
      {
        question: 'How often should I get a tarot reading?',
        answer:
          'This depends on your goals. A monthly pull or quarterly Celtic Cross is ideal for ongoing guidance. If you are navigating a specific situation — a career change, relationship challenge, or major decision — a focused reading at the time of the event is most useful. Avoid seeking readings too frequently on the same question, as the cards reflect energy that needs time to unfold.',
        isActive: true,
      },
    ],
  },
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
