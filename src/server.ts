import 'dotenv/config'
import env from './config/env'
import { connectDB } from './config/db'
import app from './app'
import { startRemedyReminderJob } from './jobs/remedyReminderJob'
import { startStalePaymentJob } from './jobs/stalePaymentJob'
import { startRecurringOrderJob } from './jobs/recurringOrderJob'

async function start() {
  await connectDB()
  startRemedyReminderJob()
  startStalePaymentJob()
  startRecurringOrderJob()
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
