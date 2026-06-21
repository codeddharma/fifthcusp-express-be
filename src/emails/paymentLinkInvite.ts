import { emailWrapper } from './emailBase'

interface PaymentLinkInviteData {
  customerName: string
  description: string
  amount: number
  payUrl: string
  expiresAt: Date
}

export function paymentLinkInviteHtml(data: PaymentLinkInviteData): string {
  const { customerName, description, amount, payUrl, expiresAt } = data
  const expiryStr = expiresAt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const amountStr = `₹${amount.toLocaleString('en-IN')}`

  const content = `
  <tr>
    <td style="padding:40px 48px;">
      <h2 style="margin:0 0 24px;color:#1f1f2e;font-size:22px;font-weight:700;">Your Payment Link</h2>

      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName},
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Here is your payment link for <strong>${description}</strong>. Please complete the payment using the secure link below.
      </p>

      <div style="background:#f5f0ff;border-radius:10px;padding:24px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Amount payable</p>
        <p style="margin:0 0 16px;color:#1f1f2e;font-size:20px;font-weight:700;">${amountStr}</p>
        <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Link expires on</p>
        <p style="margin:0;color:#1f1f2e;font-size:16px;font-weight:600;">${expiryStr}</p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${payUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:8px;">
          Pay ${amountStr}
        </a>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${payUrl}" style="color:#7c3aed;word-break:break-all;">${payUrl}</a>
      </p>
    </td>
  </tr>`

  return emailWrapper(content)
}
