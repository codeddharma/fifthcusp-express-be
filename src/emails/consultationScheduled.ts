import { emailWrapper } from './emailBase'

interface ConsultationScheduledData {
  customerName: string
  orderNumber: string
  serviceName: string
}

export function consultationScheduledHtml(data: ConsultationScheduledData): string {
  const body = `
  <tr>
    <td style="padding:48px 48px 32px;">
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Your Consultation is Being Scheduled</h2>
      <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
        Dear ${data.customerName}, we have received your order for <strong>${data.serviceName}</strong> (${data.orderNumber}). Our team will reach out to you shortly to schedule your personal consultation session.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7ff;border:1px solid #e5e0ff;border-radius:8px;margin-bottom:32px;">
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 16px;color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">What to Expect</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="display:inline-block;width:24px;height:24px;background:#7c3aed;border-radius:50%;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;margin-right:12px;">1</span>
                  <span style="color:#374151;font-size:14px;line-height:1.6;">Our expert will contact you via phone or email within 24 hours to schedule a convenient time.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="display:inline-block;width:24px;height:24px;background:#7c3aed;border-radius:50%;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;margin-right:12px;">2</span>
                  <span style="color:#374151;font-size:14px;line-height:1.6;">Your session will be conducted over video call or phone — whichever you prefer.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="display:inline-block;width:24px;height:24px;background:#7c3aed;border-radius:50%;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;margin-right:12px;">3</span>
                  <span style="color:#374151;font-size:14px;line-height:1.6;">You will receive a detailed summary or report after the consultation, as part of your service.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.7;">
        Feel free to prepare any questions or topics you would like to discuss during the session. We look forward to connecting with you!
      </p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        With warm regards,<br/>
        <strong>The Fifth Cusp Team</strong>
      </p>
    </td>
  </tr>`

  return emailWrapper(body)
}
