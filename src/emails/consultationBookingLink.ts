import { emailWrapper } from './emailBase'

interface ConsultationBookingLinkData {
  customerName: string
  orderNumber: string
  serviceName: string
  bookingUrl: string
  expiresAt: Date
}

export function consultationBookingLinkHtml(data: ConsultationBookingLinkData): string {
  const { customerName, orderNumber, serviceName, bookingUrl, expiresAt } = data
  const expiryStr = expiresAt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  const content = `
  <tr>
    <td style="padding:40px 48px;">
      <h2 style="margin:0 0 8px;color:#1f1f2e;font-size:22px;font-weight:700;">Schedule Your Consultation</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Order #${orderNumber}</p>

      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName},
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Your payment for <strong>${serviceName}</strong> has been confirmed.
        Please use the link below to choose a date and time that works best for your consultation session.
      </p>

      <div style="background:#f5f0ff;border-radius:10px;padding:24px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Booking link expires on</p>
        <p style="margin:0;color:#1f1f2e;font-size:16px;font-weight:600;">${expiryStr}</p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${bookingUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;">
          Choose Your Slot
        </a>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${bookingUrl}" style="color:#7c3aed;word-break:break-all;">${bookingUrl}</a>
      </p>
    </td>
  </tr>`

  return emailWrapper(content)
}
