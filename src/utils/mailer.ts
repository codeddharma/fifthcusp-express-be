import nodemailer from 'nodemailer'
import env from '../config/env'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

interface SendMailOptions {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; path: string }[]
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  })
}
