import nodemailer, { type Transporter } from 'nodemailer';

import { config, env } from '@/config';
import { logger } from '@/core/logger';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter | null {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = config.mail;
  if (!smtpHost) return null;
  transporter ??= nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  });
  return transporter;
}

/**
 * Gửi email qua SMTP. Chưa cấu hình SMTP_HOST thì không gửi, chỉ ghi nội dung ra log
 * (để dev lấy link đặt lại mật khẩu). Lỗi gửi được ném ra cho nơi gọi tự quyết xử lý.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    // Chỉ ghi nội dung (có link/token) khi không phải production, tránh lộ token vào log
    logger.warn(
      env.NODE_ENV === 'production'
        ? { to: message.to }
        : { to: message.to, text: message.text },
      'mail.smtp_not_configured',
    );
    return;
  }
  await transport.sendMail({ from: config.mail.from, ...message });
}
