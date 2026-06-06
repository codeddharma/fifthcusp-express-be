import 'dotenv/config'
import { connectDB } from './config/db'
import { seedServices } from './services/service.service'
import { seedFaqs } from './services/faq.service'
import { seedTestimonials } from './services/testimonial.service'
import { seedJobOpenings } from './services/jobOpening.service'
import { seedBlogs } from './services/blog.service'
import { seedUsers } from './services/user.service'
import { seedPageMeta } from './services/pageMeta.service'

async function runSeeds() {
  await connectDB()
  await seedUsers()
  await seedServices()
  await seedFaqs()
  await seedTestimonials()
  await seedJobOpenings()
  await seedBlogs()
  await seedPageMeta()
  console.log('All seeds completed')
  process.exit(0)
}

runSeeds().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
