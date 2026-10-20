import nodemailer from "nodemailer";
import { Resend } from "resend";
import { envFlag } from "../config/env.js";

let smtpTransporter = null;
let resendClient = null;

function getSmtpTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass.includes("your_")) {
    return null;
  }

  if (!smtpTransporter) {
    const isGmail = process.env.SMTP_HOST?.toLowerCase().includes("gmail");
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: envFlag("SMTP_SECURE", false),
      auth: {
        user: user.trim(),
        pass: isGmail ? pass.trim().replace(/\s+/g, "") : pass.trim()
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
  }

  return smtpTransporter;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_resend_api_key")) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Generate branded Neo-Brutalist HTML template for CampusSync
 */
function buildOtpEmailHtml({ toEmail, otpCode }) {
  const safeEmail = escapeHtml(toEmail);
  const safeOtp = escapeHtml(otpCode);
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CampusSync Verification Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #FDFBF5;
          margin: 0;
          padding: 24px;
          color: #17150F;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: #FFFFFF;
          border: 2px solid #17150F;
          box-shadow: 4px 4px 0px #17150F;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background-color: #6E56F8;
          color: #FFFFFF;
          padding: 24px;
          text-align: center;
          border-bottom: 2px solid #17150F;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 6px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        }
        .content {
          padding: 32px 24px;
          text-align: center;
        }
        .content h2 {
          font-size: 20px;
          margin-top: 0;
          color: #17150F;
        }
        .content p {
          color: #58524A;
          font-size: 14px;
          line-height: 1.5;
          margin: 12px 0 24px 0;
        }
        .otp-box {
          display: inline-block;
          background: #F3EFE4;
          border: 2px solid #17150F;
          border-radius: 8px;
          padding: 16px 32px;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #6E56F8;
          font-family: 'SF Mono', 'Courier New', monospace;
          margin: 10px 0 20px 0;
          box-shadow: 2px 2px 0px #17150F;
        }
        .footer {
          background: #FBF8F1;
          border-top: 1px solid rgba(23,21,15,0.12);
          padding: 16px 24px;
          font-size: 12px;
          color: #8E877A;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CampusSync 🎓⚡</h1>
          <p>One unified application for everything on campus</p>
        </div>
        <div class="content">
          <h2>Verify Your College Identity</h2>
          <p>You requested a one-time verification code to sign in to CampusSync for <strong>${safeEmail}</strong>. Enter the code below to complete your login:</p>
          <div class="otp-box">${safeOtp}</div>
          <p style="font-size: 13px; color: #8E877A;">⏱️ This code will expire in <strong>10 minutes</strong>.<br>If you did not request this verification, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          CampusSync • Built for students, by students.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Dispatch real 6-digit OTP verification code strictly to the recipient's email
 * @param {Object} options
 * @param {string} options.toEmail - Recipient student email address
 * @param {string} options.otpCode - 6-digit verification code
 * @returns {Promise<{ success: boolean, method?: string, id?: string, simulated?: boolean, error?: string }>}
 */
export async function sendOtpEmail({ toEmail, otpCode }) {
  const targetEmail = toEmail.trim().toLowerCase();
  const htmlContent = buildOtpEmailHtml({ toEmail: targetEmail, otpCode });
  const subjectLine = "Your CampusSync verification code";

  const provider = (process.env.EMAIL_PROVIDER || "auto").trim().toLowerCase();
  const errors = [];

  // Resend is the primary production provider. It avoids consumer Gmail SMTP
  // restrictions and is designed for transactional delivery.
  const resend = getResendClient();
  if ((provider === "auto" || provider === "resend") && resend) {
    const fromEmail = process.env.EMAIL_FROM || "CampusSync <onboarding@resend.dev>";
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [targetEmail],
        subject: subjectLine,
        html: htmlContent
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ [RESEND SENT] Verification OTP sent to ${targetEmail} (ID: ${data?.id})`);
      return { success: true, method: "resend", id: data?.id };
    } catch (err) {
      console.error(`❌ [Resend Exception]:`, err.message);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // Generic SMTP remains available as a fallback, but is no longer tied to or
  // labelled as Gmail.
  const transporter = getSmtpTransporter();
  if ((provider === "auto" || provider === "smtp") && transporter) {
    const fromAddress = process.env.EMAIL_FROM || `"CampusSync" <${process.env.SMTP_USER}>`;
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject: subjectLine,
        html: htmlContent
      });
      console.log(`✅ [SMTP SENT] Verification OTP sent to ${targetEmail} (MessageId: ${info.messageId})`);
      return { success: true, method: "smtp", id: info.messageId };
    } catch (err) {
      console.error(`❌ [SMTP Error]: Failed to send to ${targetEmail}:`, err.message);
      errors.push(`SMTP: ${err.message}`);
    }
  }

  // Simulation must be explicitly enabled and is never a production fallback.
  if (process.env.NODE_ENV === "test" || envFlag("ALLOW_SIMULATED_OTP", false)) {
    console.warn(`[EMAIL] Simulated OTP for ${targetEmail}: ${otpCode}`);
    return { success: true, method: "simulation", simulated: true };
  }

  const configurationError = provider === "resend" && !resend
    ? "RESEND_API_KEY is not configured."
    : provider === "smtp" && !transporter
      ? "SMTP credentials are not configured."
      : "No working email provider is configured.";

  return {
    success: false,
    error: errors.length > 0 ? errors.join("; ") : configurationError
  };
}
