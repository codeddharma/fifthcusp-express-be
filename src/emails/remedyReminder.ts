import { emailWrapper } from './emailBase'

interface RemedyReminderData {
  customerName: string
  remedyName: string
  scheduledAt: Date
  notes?: string
}

export function remedyReminderHtml(data: RemedyReminderData): string {
  const { customerName, remedyName, scheduledAt, notes } = data

  const timeStr = scheduledAt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true,
  })
  const dateStr = scheduledAt.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  const notesBlock = notes
    ? `<div style="background:#f5f0ff;border-radius:10px;padding:20px;margin:20px 0 0;">
         <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Additional Notes</p>
         <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${notes}</p>
       </div>`
    : ''

  const content = `
  <tr>
    <td style="padding:40px 48px;">
      <h2 style="margin:0 0 24px;color:#1f1f2e;font-size:22px;font-weight:700;">Remedy Reminder</h2>

      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName},
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        This is a gentle reminder for your remedy today. Take a moment to connect with the universe and follow through with your practice.
      </p>

      <div style="background:#f5f0ff;border-radius:10px;padding:24px;margin:0 0 8px;">
        <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Today's Remedy</p>
        <p style="margin:0 0 16px;color:#1f1f2e;font-size:18px;font-weight:700;">${remedyName}</p>
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Scheduled For</p>
        <p style="margin:0;color:#1f1f2e;font-size:15px;font-weight:600;">${dateStr} at ${timeStr} IST</p>
      </div>

      ${notesBlock}

      <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
        Consistency is key — trust the process and stay aligned with your celestial guidance.
      </p>
    </td>
  </tr>`

  return emailWrapper(content)
}
