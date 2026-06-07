import { emailWrapper } from './emailBase'

interface OrderCompletedData {
  customerName: string
  orderNumber: string
  serviceName: string
}

export function orderCompletedHtml(data: OrderCompletedData): string {
  const body = `
  <tr>
    <td style="padding:48px 48px 32px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;width:64px;height:64px;background:#f0fdf4;border-radius:50%;line-height:64px;text-align:center;">
          <span style="font-size:32px;color:#16a34a;">&#10003;</span>
        </div>
      </div>

      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;text-align:center;">Your Report is Ready!</h2>
      <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;text-align:center;">
        Dear ${data.customerName}, your <strong>${data.serviceName}</strong> report has been completed and is attached to this email.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7ff;border:1px solid #e5e0ff;border-radius:8px;margin-bottom:32px;">
        <tr>
          <td style="padding:20px 28px;">
            <p style="margin:0 0 4px;color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
            <p style="margin:0;color:#1a1a2e;font-size:16px;font-weight:700;">${data.orderNumber}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
        Please find your personalised report attached as a PDF. We hope it brings you clarity and insight on your journey.
      </p>
      <p style="margin:0 0 32px;color:#374151;font-size:14px;line-height:1.7;">
        If you have any questions about the report or wish to discuss it further, please do not hesitate to reply to this email.
      </p>

      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        With love and light,<br/>
        <strong>The Fifth Cusp Team</strong>
      </p>
    </td>
  </tr>`

  return emailWrapper(body)
}
