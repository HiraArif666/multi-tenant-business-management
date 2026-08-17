import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  // Gmail SMTP via an app password (not your normal Gmail password —
  // generate one at https://myaccount.google.com/apppasswords, requires
  // 2-Step Verification enabled on the Gmail account first).
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ) {
    try {
      await this.transporter.sendMail({
        from: `"Multi-Tenant BM" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Reset your password',
        html: `
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetLink}">Click here to reset your password</a>
          </p>
          <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (error) {
      // Don't let a mail-provider hiccup surface as a 500 to the user —
      // log it so it's visible in the server console for debugging.
      this.logger.error(
        'Failed to send password reset email',
        error as Error,
      );
    }
  }

  async sendSuspiciousLoginAlert(
    to: string,
    ipAddress: string,
    userAgent: string | null,
  ) {
    try {
      await this.transporter.sendMail({
        from: `"Multi-Tenant BM" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Suspicious login detected',
        html: `
          <p>We detected a login from a device or IP address we don't recognize.</p>
          <p><strong>IP address:</strong> ${ipAddress}</p>
          <p><strong>Device / browser:</strong> ${userAgent ?? 'Unknown'}</p>
          <p>If this was you, no action is needed. If you did not sign in, please reset your password immediately.</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send suspicious login alert',
        error as Error,
      );
    }
  }

  async sendScheduledReportEmail(
    recipients: string[],
    reportName: string,
    excelBuffer: Buffer,
  ) {
    if (!recipients.length) return;

    try {
      await this.transporter.sendMail({
        from: `"Multi-Tenant BM" <${process.env.GMAIL_USER}>`,
        to: recipients.join(','),
        subject: `Scheduled Report: ${reportName}`,
        html: `
          <p>Attached is your scheduled report: <strong>${reportName}</strong>.</p>
          <p>This is an automated email sent by your report schedule.</p>
        `,
        attachments: [
          {
            filename: `${reportName}.xlsx`,
            content: excelBuffer,
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        'Failed to send scheduled report email',
        error as Error,
      );
    }
  }
}