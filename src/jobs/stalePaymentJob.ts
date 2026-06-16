import cron from 'node-cron'
import env from '../config/env'
import { Order } from '../models/Order'
import { logOrderActivity } from '../services/order.service'

export function startStalePaymentJob(): void {
  // Every 5 minutes: mark pending orders older than the cutoff as failed (abandoned checkout)
  cron.schedule('*/5 * * * *', async () => {
    const cutoff = new Date(Date.now() - env.STALE_PAYMENT_MINUTES * 60 * 1000)
    const stale = await Order.find({
      paymentStatus: 'pending',
      createdAt: { $lt: cutoff },
    }).limit(100)

    for (const order of stale) {
      try {
        order.paymentStatus = 'failed'
        order.paymentAttempts.push({ at: new Date(), eventType: 'cron:stale-timeout' })
        logOrderActivity(order, {
          type: 'payment_failed',
          actor: 'system',
          message: `Payment timed out (no completion within ${env.STALE_PAYMENT_MINUTES} min)`,
        })
        await order.save()
      } catch (err) {
        console.error(`[stalePaymentJob] Failed for order ${order.orderNumber}:`, err instanceof Error ? err.message : err)
      }
    }
  })

  console.log('[stalePaymentJob] Stale payment sweep started')
}
