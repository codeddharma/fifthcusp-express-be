import 'dotenv/config'
import { connectDB } from './config/db'
import { seedServices } from './services/service.service'
import { seedFaqs } from './services/faq.service'

async function runSeeds() {
  await connectDB()
  await seedServices()
  await seedFaqs()
  console.log('All seeds completed')
  process.exit(0)
}

runSeeds().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
