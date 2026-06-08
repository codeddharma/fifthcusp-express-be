import cron from 'node-cron'
import { RemedyEvent } from '../models/RemedyEvent'
import { Customer } from '../models/Customer'
import { sendMail } from '../utils/mailer'
import { remedyReminderHtml } from '../emails/remedyReminder'

export function startRemedyReminderJob(): void {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    const due = await RemedyEvent.find({
      scheduledAt: { $lte: now },
      reminderSentAt: { $exists: false },
    }).limit(50)

    for (const event of due) {
      try {
        const customer = await Customer.findById(event.customerId)
        if (!customer) continue

        await sendMail({
          to: customer.email,
          subject: `Remedy Reminder: ${event.remedyName}`,
          html: remedyReminderHtml({
            customerName: customer.name,
            remedyName: event.remedyName,
            scheduledAt: event.scheduledAt,
            notes: event.notes,
          }),
        })

        event.reminderSentAt = new Date()
        await event.save()
      } catch (err) {
        console.error(`[remedyCron] Failed to process remedy event ${event._id}:`, err)
      }
    }
  })

  console.log('[remedyCron] Remedy reminder job started')
}
