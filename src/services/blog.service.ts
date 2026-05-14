import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { Blog, IBlog } from '../models/Blog'
import mongoose from 'mongoose'

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function calcReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

type BlogFilter = {
  isPublished?: boolean
  category?: string
  tag?: string
}

export async function getAllBlogs(filter: BlogFilter = {}) {
  const query: Record<string, unknown> = {}
  if (filter.isPublished !== undefined) query.isPublished = filter.isPublished
  if (filter.category) query.category = { $regex: new RegExp(filter.category, 'i') }
  if (filter.tag) query.tags = filter.tag
  return Blog.find(query).sort({ publishedAt: -1, createdAt: -1 })
}

export async function getBlogBySlug(slug: string) {
  const blog = await Blog.findOne({ slug: slug.toLowerCase() })
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return blog
}

export async function getBlogById(id: string) {
  const blog = await Blog.findById(id)
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return blog
}

type CreateBlogInput = {
  title: string
  content: string
  excerpt: string
  category: string
  slug?: string
  coverImage?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
}

export async function createBlog(data: CreateBlogInput, userId: string) {
  const slug = data.slug ? data.slug : generateSlug(data.title)
  const readTime = calcReadTime(data.content)
  return Blog.create({ ...data, slug, readTime, createdBy: new mongoose.Types.ObjectId(userId) })
}

export async function updateBlog(id: string, data: Partial<CreateBlogInput>) {
  const updates: Record<string, unknown> = { ...data }
  if (data.content) updates.readTime = calcReadTime(data.content)
  if (data.title && !data.slug) updates.slug = generateSlug(data.title)
  const blog = await Blog.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return blog
}

export async function publishBlog(id: string) {
  const blog = await Blog.findByIdAndUpdate(
    id,
    { isPublished: true, publishedAt: new Date() },
    { new: true },
  )
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return blog
}

export async function unpublishBlog(id: string) {
  const blog = await Blog.findByIdAndUpdate(
    id,
    { isPublished: false, $unset: { publishedAt: '' } },
    { new: true },
  )
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return blog
}

export async function deleteBlog(id: string) {
  const blog = await Blog.findByIdAndDelete(id)
  if (!blog) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED_SYSTEM_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001')

const SEED_DATA: Omit<IBlog, keyof Document>[] = [
  {
    title: 'Saturn Transit 2026: What Every Zodiac Sign Needs to Know',
    slug: 'saturn-transit-2026-what-every-zodiac-sign-needs-to-know',
    category: 'Vedic Astrology',
    tags: ['Saturn', '2026 Transit', 'Zodiac', 'Shani'],
    excerpt: 'Saturn\'s transit in 2026 will reshape career, relationships, and finances for every sign. Here is what to expect and how to prepare.',
    coverImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200',
    content: `<h2>Saturn's Movement in 2026</h2><p>Saturn, the planet of karma, discipline, and long-term consequences, completes a significant shift in 2026 that will affect all twelve zodiac signs. Known as <em>Shani</em> in Vedic astrology, Saturn governs our capacity for patience, hard work, and resilience.</p><h2>How Saturn Transits Work</h2><p>Unlike faster planets such as the Moon or Mercury, Saturn takes approximately two and a half years to move through a single sign. This slow pace means its influence is deep, sustained, and transformative rather than superficial or fleeting.</p><h2>Key Themes for 2026</h2><p>The dominant themes of this transit include accountability in professional life, re-evaluation of long-standing relationships, and a collective call to simplify our material priorities. Signs ruled by Saturn — Capricorn and Aquarius — will feel these themes most acutely.</p><h2>Remedies for Saturn's Challenges</h2><p>Vedic astrology offers several time-tested remedies to soften Saturn's harsher lessons. Reciting the Shani mantra on Saturdays, wearing blue sapphire (after astrological consultation), donating black sesame seeds, and serving the elderly are among the most effective practices.</p><h2>Sign-by-Sign Predictions</h2><p>While individual birth charts determine the precise impact, the general energy for each sign suggests: Aries faces career restructuring; Taurus encounters relationship realities; Gemini must address health and routines; Cancer reckons with creativity and investments. Each sign will find specific areas of life brought into Saturn's disciplined spotlight.</p><h2>Final Thoughts</h2><p>Saturn's transits are rarely comfortable, but they are among the most rewarding in the long run. Those who embrace the lessons — discipline, responsibility, and honest self-assessment — often emerge stronger and clearer about their true path.</p>`,
    readTime: 4,
    metaTitle: 'Saturn Transit 2026: Predictions for All 12 Zodiac Signs | The Fifth Cusp',
    metaDescription: 'Discover how Saturn\'s 2026 transit will impact your zodiac sign. Expert Vedic astrology predictions, key themes, and practical remedies.',
    metaKeywords: ['Saturn transit 2026', 'Shani transit', 'Vedic astrology 2026', 'Saturn zodiac predictions', 'Saturn remedies'],
    isPublished: true,
    publishedAt: new Date('2025-12-01'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-11-25'),
  } as unknown as Omit<IBlog, keyof Document>,
  {
    title: 'The Five Elements of Vastu: How to Balance Your Home\'s Energy',
    slug: 'five-elements-of-vastu-how-to-balance-your-homes-energy',
    category: 'Vastu',
    tags: ['Vastu Shastra', 'Five Elements', 'Panchabhuta', 'Home Energy'],
    excerpt: 'Vastu Shastra is built on five fundamental elements — earth, water, fire, air, and space. Learn how to bring them into balance in your home.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
    content: `<h2>The Foundation of Vastu Shastra</h2><p>Vastu Shastra, the ancient Indian science of spatial design, is built on the principle that every living space is composed of five fundamental elements known as the <em>Panchabhuta</em>: earth (<em>Prithvi</em>), water (<em>Jal</em>), fire (<em>Agni</em>), air (<em>Vayu</em>), and space (<em>Akasha</em>). When these elements are in harmony, the space supports health, prosperity, and wellbeing.</p><h2>Earth — Stability and Grounding</h2><p>Earth governs the south-west direction of any space. It represents stability, patience, and physical strength. To strengthen the earth element, keep the south-west corner heavy — use solid furniture, store valuables here, and avoid keeping this area cluttered or empty. Earthy tones like terracotta, brown, and beige enhance this energy.</p><h2>Water — Flow and Abundance</h2><p>The north-east is the domain of water in Vastu. Water represents flow, clarity, and abundance. Place water features, aquariums, or representations of flowing water in this zone. Keep the north-east clean, open, and clutter-free to allow opportunities and positive energy to enter your home freely.</p><h2>Fire — Transformation and Vitality</h2><p>Fire governs the south-east direction and is associated with transformation, digestion, and vitality. This is the ideal zone for the kitchen and any heat-generating appliances. Red, orange, and yellow colours amplify the fire element. Avoid placing water elements in the south-east, as fire and water are conflicting energies.</p><h2>Air — Communication and Growth</h2><p>The north-west is ruled by the air element, which governs movement, communication, and social connections. Ensure good ventilation in this zone. Wind chimes, light-coloured curtains that move gently with the breeze, and green plants all support the air element. This is an excellent corner for guest rooms.</p><h2>Space — Infinite Possibility</h2><p>Space, the most subtle of the five elements, is associated with the centre of the home — the <em>Brahmasthan</em>. This central zone should always be kept open, unobstructed, and free of heavy furniture or structural elements wherever possible. It acts as the energetic heart of the home, distributing life force to every room.</p><h2>Bringing It All Together</h2><p>Balancing the five elements does not require demolishing walls or making expensive renovations. Simple adjustments — repositioning furniture, adding plants, using colour intentionally, and removing clutter — can bring a space closer to Vastu harmony. A professional Vastu consultation can identify the most impactful changes for your specific home.</p>`,
    readTime: 5,
    metaTitle: 'Five Elements of Vastu Shastra: Balance Earth, Water, Fire, Air & Space | The Fifth Cusp',
    metaDescription: 'Learn how the five elements of Vastu Shastra — earth, water, fire, air, and space — shape the energy of your home and how to bring them into balance.',
    metaKeywords: ['Vastu Shastra elements', 'Panchabhuta Vastu', 'five elements home', 'Vastu balance', 'home energy Vastu'],
    isPublished: true,
    publishedAt: new Date('2025-11-15'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  } as unknown as Omit<IBlog, keyof Document>,
  {
    title: 'Kundli Reading 101: Understanding Your Birth Chart',
    slug: 'kundli-reading-101-understanding-your-birth-chart',
    category: 'Vedic Astrology',
    tags: ['Kundli', 'Birth Chart', 'Vedic Astrology', 'Beginners'],
    excerpt: 'Your birth chart is a map of the sky at the moment you were born. This beginner\'s guide explains the key components of a Kundli and what they reveal.',
    coverImage: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200',
    content: `<h2>What Is a Kundli?</h2><p>A Kundli — also known as a Janam Patri or birth chart — is a celestial snapshot of the sky at the exact moment and location of your birth. In Vedic astrology, it serves as the foundational tool for understanding your personality, life purpose, relationships, career, health, and spiritual path.</p><h2>The Twelve Houses</h2><p>A Kundli is divided into twelve segments called houses (<em>Bhavas</em>), each governing a specific area of life. The first house relates to self and personality; the second to wealth and family; the third to communication and siblings; the fourth to home and mother; and so on through to the twelfth house, which governs spirituality, isolation, and liberation.</p><h2>The Nine Planets</h2><p>Vedic astrology recognises nine celestial bodies — the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, and the two lunar nodes Rahu and Ketu. Each planet carries distinct energy and governs specific domains of life. Their placement in houses and signs at the time of birth shapes your strengths, challenges, and karmic lessons.</p><h2>The Twelve Signs (Rashis)</h2><p>The twelve zodiac signs — Aries through Pisces — provide the backdrop against which planets express themselves. Each sign has unique qualities, ruling planets, and elemental affiliations. A planet placed in a compatible sign tends to express its energy freely, while a planet in an incompatible sign may face greater challenges.</p><h2>The Ascendant (Lagna)</h2><p>The Ascendant or Lagna is the zodiac sign rising on the eastern horizon at the moment of birth. It sets the framework of the entire chart, determining which sign rules which house. Two people born on the same day but at different times may have completely different Lagnas and therefore very different life experiences.</p><h2>Dashas: The Planetary Time Periods</h2><p>One of Vedic astrology's most powerful tools is the Dasha system — a sequence of planetary periods that unfold throughout your life. Each Dasha period, ruled by a specific planet, activates the themes associated with that planet's placement in your chart. Understanding which Dasha you are currently running can explain why certain areas of life are highlighted at a given time.</p><h2>Getting Your Kundli Read</h2><p>To have your Kundli prepared, you need your exact date, time, and place of birth. Even a difference of a few minutes can shift the Ascendant or house cusps, so accurate birth time is essential. A qualified Vedic astrologer can then interpret the planetary combinations, yogas, and Dasha periods to offer meaningful guidance for your life.</p>`,
    readTime: 5,
    metaTitle: 'Kundli Reading 101: A Beginner\'s Guide to Your Vedic Birth Chart | The Fifth Cusp',
    metaDescription: 'New to Vedic astrology? This beginner\'s guide to Kundli reading explains houses, planets, signs, and Dashas in simple, clear language.',
    metaKeywords: ['Kundli reading', 'birth chart Vedic astrology', 'Janam Patri', 'Vedic astrology beginners', 'how to read Kundli'],
    isPublished: true,
    publishedAt: new Date('2025-10-20'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  } as unknown as Omit<IBlog, keyof Document>,
  {
    title: 'Numerology and Your Life Path Number: A Complete Guide',
    slug: 'numerology-life-path-number-complete-guide',
    category: 'Numerology',
    tags: ['Numerology', 'Life Path Number', 'Personal Year', 'Name Numerology'],
    excerpt: 'Your Life Path Number is the most significant number in Numerology. Discover how to calculate it, what it means, and how it shapes your life journey.',
    coverImage: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1200',
    content: `<h2>What Is Numerology?</h2><p>Numerology is the study of the mystical relationship between numbers and events, personality, and destiny. Rooted in ancient Pythagorean and Vedic traditions, numerology holds that every number carries a specific vibration that influences the life of anyone connected to it.</p><h2>How to Calculate Your Life Path Number</h2><p>Your Life Path Number is derived from your complete date of birth. Add the digits of your birth date together, reducing to a single digit (or a master number — 11, 22, or 33). For example, someone born on 15 March 1990 would calculate: 1+5+0+3+1+9+9+0 = 28, then 2+8 = 10, then 1+0 = <strong>1</strong>. Their Life Path Number is 1.</p><h2>The Meaning of Each Life Path Number</h2><p><strong>1 — The Leader:</strong> Independent, ambitious, pioneering. You are here to forge your own path and inspire others through your courage and originality.</p><p><strong>2 — The Peacemaker:</strong> Diplomatic, sensitive, cooperative. You thrive in partnerships and excel at bringing harmony to conflict.</p><p><strong>3 — The Creative:</strong> Expressive, joyful, communicative. Your purpose involves using creativity — whether through art, writing, speaking, or performance — to uplift others.</p><p><strong>4 — The Builder:</strong> Reliable, methodical, disciplined. You are here to create stable foundations — in business, family, or community.</p><p><strong>5 — The Freedom Seeker:</strong> Adventurous, versatile, curious. Your path involves embracing change and helping others see beyond conventional limitations.</p><p><strong>6 — The Nurturer:</strong> Caring, responsible, family-oriented. Service to loved ones and community is your deepest calling.</p><p><strong>7 — The Seeker:</strong> Introspective, analytical, spiritual. You are drawn to the deeper mysteries of life and excel in research, philosophy, and spiritual inquiry.</p><p><strong>8 — The Powerhouse:</strong> Ambitious, authoritative, financially savvy. Your path involves mastering the material world while staying grounded in integrity.</p><p><strong>9 — The Humanitarian:</strong> Compassionate, wise, idealistic. You are here to serve humanity on a large scale and release what no longer serves your highest good.</p><h2>Master Numbers: 11, 22, and 33</h2><p>Master numbers are not reduced further because they carry heightened spiritual significance. Life Path 11 is the Intuitive; 22 is the Master Builder; 33 is the Master Teacher. These paths come with extraordinary potential and equally significant challenges.</p><h2>Using Numerology in Daily Life</h2><p>Beyond the Life Path, numerology offers insights through Personal Year cycles, Name numerology, and the numerology of important dates. A professional numerology reading can reveal the optimal timing for major decisions, the compatibility between partners, and the hidden meaning behind your full name.</p>`,
    readTime: 5,
    metaTitle: 'Life Path Number Guide: Calculate Yours and Discover Its Meaning | The Fifth Cusp',
    metaDescription: 'Learn how to calculate your Numerology Life Path Number and understand what it reveals about your personality, purpose, and destiny.',
    metaKeywords: ['Life Path Number', 'numerology guide', 'calculate Life Path Number', 'numerology meanings', 'master numbers numerology'],
    isPublished: true,
    publishedAt: new Date('2025-09-10'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-09-05'),
    updatedAt: new Date('2025-09-05'),
  } as unknown as Omit<IBlog, keyof Document>,
  {
    title: 'Crystal Healing for Beginners: Choosing the Right Stone for Your Energy',
    slug: 'crystal-healing-beginners-choosing-right-stone-for-your-energy',
    category: 'Energy Healing',
    tags: ['Crystal Healing', 'Gemstones', 'Energy Healing', 'Chakras', 'Beginners'],
    excerpt: 'Crystals have been used for healing and spiritual protection for thousands of years. This beginner\'s guide helps you choose, cleanse, and work with the right stone for your needs.',
    coverImage: 'https://images.unsplash.com/photo-1601925228008-6b83e8c6de1b?w=1200',
    content: `<h2>Why Crystals Work</h2><p>Crystals are formed over millions of years through intense geological processes, giving each variety a unique molecular structure and vibrational frequency. Crystal healing is based on the principle that these frequencies can interact with the human energy field — or aura — to restore balance, clear blockages, and amplify intention.</p><h2>Choosing Your First Crystal</h2><p>Rather than choosing a crystal based on what it looks like, allow yourself to be drawn to it intuitively. Many experienced practitioners recommend visiting a crystal shop and noticing which stones you are repeatedly drawn to — that pull is often the crystal's energy resonating with what you need.</p><h2>Popular Healing Crystals and Their Properties</h2><p><strong>Clear Quartz:</strong> Known as the master healer, Clear Quartz amplifies energy and intention. It is an excellent starting point for beginners because it works with all chakras and purposes.</p><p><strong>Amethyst:</strong> A powerful stone for spiritual protection, intuition, and calm. Place amethyst near your bed to promote restful sleep and connect with your higher self.</p><p><strong>Rose Quartz:</strong> The stone of unconditional love. Rose Quartz opens the heart chakra and supports self-compassion, romantic love, and emotional healing.</p><p><strong>Black Tourmaline:</strong> One of the strongest protective stones, Black Tourmaline absorbs negative energy and creates a shield around your aura. Keep it near your front door or carry it when entering challenging environments.</p><p><strong>Citrine:</strong> Known as the merchant's stone, Citrine is associated with abundance, creativity, and positive energy. It is one of the few crystals that does not need regular cleansing as it does not hold negative energy.</p><h2>Cleansing Your Crystals</h2><p>Before working with a new crystal, it is important to cleanse it of any energy it may have absorbed during handling and transit. Common methods include: placing crystals in moonlight overnight (particularly during a full moon), smudging with sage or palo santo, burying briefly in the earth, or placing on a selenite charging plate.</p><h2>Setting Intentions</h2><p>Once cleansed, hold your crystal in both hands, close your eyes, and set a clear intention — state what you want the crystal to support you with. This programmes the crystal with your specific energy and purpose, making it a personalised healing tool rather than a generic object.</p><h2>Incorporating Crystals into Daily Practice</h2><p>You can work with crystals through meditation (placing them on relevant chakra points), carrying them in your pocket or bag, placing them on your desk or altar, or creating crystal grids for specific intentions. Consistency and intention are the keys to deepening your relationship with crystal energy.</p>`,
    readTime: 5,
    metaTitle: 'Crystal Healing for Beginners: Choose, Cleanse, and Use Your First Crystal | The Fifth Cusp',
    metaDescription: 'New to crystal healing? Learn which crystals to start with, how to cleanse them, set intentions, and incorporate them into your daily spiritual practice.',
    metaKeywords: ['crystal healing beginners', 'which crystal to buy first', 'how to cleanse crystals', 'healing stones guide', 'crystal energy'],
    isPublished: true,
    publishedAt: new Date('2025-08-05'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-01'),
  } as unknown as Omit<IBlog, keyof Document>,
  {
    title: 'The Power of Retrograde Planets: Myths, Truths, and Remedies',
    slug: 'power-of-retrograde-planets-myths-truths-remedies',
    category: 'Vedic Astrology',
    tags: ['Retrograde', 'Mercury Retrograde', 'Planets', 'Vedic Astrology', 'Remedies'],
    excerpt: 'Planetary retrogrades are among the most misunderstood events in astrology. Separate the myths from the truths and learn how to work with retrograde energy rather than against it.',
    coverImage: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200',
    content: `<h2>What Does Retrograde Actually Mean?</h2><p>When a planet is described as retrograde, it appears — from our vantage point on Earth — to be moving backwards through the zodiac. This is an optical illusion caused by the relative speeds of Earth and the other planet in their respective orbits. However, while the backward motion is illusory, the effects on human experience are very real in astrological terms.</p><h2>The Myth of Mercury Retrograde</h2><p>Mercury retrograde has become something of a cultural phenomenon, blamed for everything from missed emails to broken relationships. While Mercury retrograde (occurring three to four times per year) does create conditions where communication, technology, and contracts deserve extra care, it is not a period of inevitable disaster. The panic around Mercury retrograde is far disproportionate to its actual effects for most people.</p><h2>How Retrograde Planets Work in Vedic Astrology</h2><p>In Vedic astrology, retrograde planets — called <em>Vakri Graha</em> — are considered to be particularly powerful. A retrograde planet's energy is turned inward, intensified, and often expressed in unconventional ways. Rather than diminishing a planet's influence, retrograde status amplifies it, sometimes to extremes.</p><h2>Retrograde Planets in Your Birth Chart</h2><p>If you were born during a planetary retrograde, that planet is retrograde in your natal chart. This does not make you unlucky; rather, it means the themes of that planet are areas where you have deep karmic work to do in this lifetime. Retrograde planets in the birth chart often indicate gifts that take time to develop — but when they do, they can be exceptional.</p><h2>Working with Retrograde Periods</h2><p>The wisest approach to retrograde seasons is to treat them as periods of review, reflection, and revision — not action. Mercury retrograde is ideal for revisiting old projects, reconnecting with past contacts, and editing rather than initiating. Venus retrograde invites reassessment of relationships and values. Mars retrograde asks us to reconsider our ambitions and actions.</p><h2>Remedies for Retrograde Challenges</h2><p>Vedic astrology offers specific remedies for each retrograde period. During Mercury retrograde: back up data, re-read contracts carefully, and chant the Mercury mantra. During Venus retrograde: avoid major relationship decisions, but do revisit what you truly value. During Mars retrograde: channel excess energy into physical exercise and avoid rash confrontations.</p><h2>The Bigger Picture</h2><p>Retrograde periods are part of the natural rhythm of the cosmos. Rather than dreading them, view them as the universe's invitation to slow down, look inward, and do the deeper work that forward motion often causes us to skip. In that sense, retrogrades are among the most spiritually productive periods available to us.</p>`,
    readTime: 5,
    metaTitle: 'Retrograde Planets in Vedic Astrology: Myths, Truths & Remedies | The Fifth Cusp',
    metaDescription: 'What does planetary retrograde really mean in Vedic astrology? Separate myths from truths, understand retrograde in your birth chart, and learn practical remedies.',
    metaKeywords: ['retrograde planets Vedic astrology', 'Mercury retrograde meaning', 'Vakri Graha', 'retrograde birth chart', 'retrograde remedies'],
    isPublished: true,
    publishedAt: new Date('2025-07-20'),
    createdBy: SEED_SYSTEM_USER_ID,
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-15'),
  } as unknown as Omit<IBlog, keyof Document>,
]

export async function seedBlogs() {
  await Blog.deleteMany({})
  await Blog.insertMany(SEED_DATA)
  console.log(`Seeded ${SEED_DATA.length} blogs`)
}
