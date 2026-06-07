import { emailWrapper } from './emailBase'

interface FeedbackRequestData {
  customerName: string
  orderNumber: string
  serviceName: string
  feedbackUrl: string
}

export function feedbackRequestHtml(data: FeedbackRequestData): string {
  const body = `
  <tr>
    <td style="padding:48px 48px 32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      </div>

      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;text-align:center;">How Was Your Experience?</h2>
      <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;text-align:center;">
        Dear ${data.customerName}, we hope your <strong>${data.serviceName}</strong> experience was enlightening. Your feedback means the world to us and helps others on their spiritual journey.
      </p>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${data.feedbackUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
          Share Your Feedback
        </a>
      </div>

      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
        This link is unique to your order. If the button above does not work, copy and paste the link below into your browser:
      </p>
      <p style="margin:0 0 32px;color:#7c3aed;font-size:12px;text-align:center;word-break:break-all;">
        ${data.feedbackUrl}
      </p>

      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        Thank you for trusting us with your journey,<br/>
        <strong>The Fifth Cusp Team</strong>
      </p>
    </td>
  </tr>`

  return emailWrapper(body)
}
