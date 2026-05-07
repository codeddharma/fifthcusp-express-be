import 'dotenv/config'
import env from './config/env'
import { connectDB } from './config/db'
import app from './app'
import { seedServices } from './services/service.service'
import { seedFaqs } from './services/faq.service'

async function start() {
  await connectDB()
  await seedServices()
  await seedFaqs()
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
