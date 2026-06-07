import env from '../config/env'

const logoUrl = `${env.FRONTEND_URL}/assets/The%20Fifth%20Cusp_Logo.png`

export function emailHeader(): string {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 48px;text-align:center;">
      <img src="${logoUrl}" alt="The Fifth Cusp" width="160" style="display:block;margin:0 auto 12px;max-width:160px;" />
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:0.5px;">Celestial Guidance for Your Journey</p>
    </td>
  </tr>`
}

export function emailFooter(): string {
  return `
  <tr>
    <td style="background:#f9f7ff;padding:24px 48px;text-align:center;border-top:1px solid #e5e0ff;">
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
        &copy; ${new Date().getFullYear()} The Fifth Cusp. All rights reserved.
      </p>
      <p style="margin:0;color:#c4b5fd;font-size:12px;">
        <a href="${env.FRONTEND_URL}" style="color:#7c3aed;text-decoration:none;">${env.FRONTEND_URL.replace(/^https?:\/\//, '')}</a>
        &nbsp;·&nbsp;
        <a href="mailto:support.thefifthcusp@gmail.com" style="color:#7c3aed;text-decoration:none;">support.thefifthcusp@gmail.com</a>
      </p>
    </td>
  </tr>`
}

export function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          ${emailHeader()}
          ${content}
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
