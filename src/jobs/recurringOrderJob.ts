import cron from 'node-cron'
import { RecurringOrder } from '../models/RecurringOrder'
import { runRecurringOrderCycle } from '../services/recurringOrder.service'

export function startRecurringOrderJob(): void {
  // Every hour: generate and email the next payment link for any active
  // recurring order whose schedule is due.
  cron.schedule('0 * * * *', async () => {
    const now = new Date()
    const due = await RecurringOrder.find({
      status: 'active',
      nextRunAt: { $lte: now },
    }).limit(50)

    for (const recurring of due) {
      try {
        await runRecurringOrderCycle(recurring)
      } catch (err) {
        console.error(
          `[recurringOrderJob] Failed for recurring order ${recurring._id}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }
  })

  console.log('[recurringOrderJob] Recurring order job started')
}
