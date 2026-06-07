import { emailWrapper } from './emailBase'

interface OrderConfirmationData {
  customerName: string
  orderNumber: string
  serviceName: string
  amount: number
  currency: string
  deadline: Date
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const deadlineStr = data.deadline.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: data.currency,
    maximumFractionDigits: 0,
  }).format(data.amount)

  const body = `
  <tr>
    <td style="padding:48px 48px 32px;">
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Order Confirmed!</h2>
      <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
        Dear ${data.customerName}, thank you for choosing The Fifth Cusp. Your order has been confirmed and our experts are ready to begin.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7ff;border:1px solid #e5e0ff;border-radius:8px;margin-bottom:32px;">
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 16px;color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Order Number</td>
                <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">${data.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Service</td>
                <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Amount Paid</td>
                <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding:14px 0 6px;color:#6b7280;font-size:14px;border-top:1px solid #e5e0ff;">Expected Delivery By</td>
                <td style="padding:14px 0 6px;color:#7c3aed;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #e5e0ff;">${deadlineStr}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
        We will keep you informed every step of the way. If you have any questions, simply reply to this email.
      </p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        With gratitude,<br/>
        <strong>The Fifth Cusp Team</strong>
      </p>
    </td>
  </tr>`

  return emailWrapper(body)
}
