import { emailWrapper } from './emailBase'

interface ConsultationMeetLinkData {
  customerName: string
  orderNumber: string
  serviceName: string
  startTime: Date
  endTime: Date
  meetLink: string
}

export function consultationMeetLinkHtml(data: ConsultationMeetLinkData): string {
  const { customerName, orderNumber, serviceName, startTime, endTime, meetLink } = data

  const dateStr = startTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const startTimeStr = startTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true,
  })
  const endTimeStr = endTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true,
  })

  const content = `
  <tr>
    <td style="padding:40px 48px;">
      <h2 style="margin:0 0 8px;color:#1f1f2e;font-size:22px;font-weight:700;">Your Consultation is Confirmed!</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Order #${orderNumber}</p>

      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName}, your <strong>${serviceName}</strong> consultation has been scheduled.
        Here are your session details:
      </p>

      <div style="background:#f5f0ff;border-radius:10px;padding:24px;margin:0 0 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="color:#6b7280;font-size:13px;display:block;">Date</span>
              <span style="color:#1f1f2e;font-size:15px;font-weight:600;">${dateStr}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <span style="color:#6b7280;font-size:13px;display:block;">Time (IST)</span>
              <span style="color:#1f1f2e;font-size:15px;font-weight:600;">${startTimeStr} – ${endTimeStr}</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${meetLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;">
          Join Google Meet
        </a>
      </div>

      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
        Please save this date and time. Join using the button above at your scheduled slot.
      </p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
        Meet link: <a href="${meetLink}" style="color:#7c3aed;word-break:break-all;">${meetLink}</a>
      </p>
    </td>
  </tr>`

  return emailWrapper(content)
}
