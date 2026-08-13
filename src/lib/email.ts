import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromAddress =
  process.env.EMAIL_FROM ??
  process.env.RESEND_FROM ??
  "ABC Constructions <noreply@abc-constructions.com>";

interface SendOpts {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email delivery provider.
 *
 * Priority:
 *  1. Resend (RESEND_API_KEY set)
 *  2. SMTP via nodemailer (EMAIL_SMTP_URL set)  — any provider (SendGrid, Mailgun, SES…)
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` — callers decide
 * whether a delivery failure should fail the request.
 */
export async function sendEmail(opts: SendOpts): Promise<{ ok: boolean; error?: string }> {
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      if (error) {
        console.error("Resend email error:", error);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (err) {
      console.error("Resend send exception:", err);
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  if (process.env.EMAIL_SMTP_URL) {
    try {
      // Dynamic import keeps nodemailer out of the edge bundle unless SMTP is configured.
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport(process.env.EMAIL_SMTP_URL);
      await transport.sendMail({
        from: fromAddress,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      return { ok: true };
    } catch (err) {
      console.error("SMTP email error:", err);
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: false, error: "No email provider configured (set RESEND_API_KEY or EMAIL_SMTP_URL)" };
}

export async function sendPasswordResetEmail(opts: { to: string; name?: string; resetUrl: string }) {
  const appName = "ABC Constructions";
  const name = opts.name ? `، ${opts.name}` : "";
  const subject = "إعادة تعيين كلمة المرور";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="margin-top: 0; color: #0f172a;">${subject}${name}</h2>
      <p style="color: #475569;">استلمنا طلباً لإعادة تعيين كلمة مرور حسابك في ${appName}.</p>
      <p style="color: #475569;">اضغط على الزر أدناه لإنشاء كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.</p>
      <a href="${opts.resetUrl}"
         style="display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
        إعادة تعيين كلمة المرور
      </a>
      <p style="color: #94a3b8; font-size: 13px;">
        إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.<br/>
        رابط إعادة التعيين: <a href="${opts.resetUrl}" style="color: #7c3aed;">${opts.resetUrl}</a>
      </p>
    </div>
  `;
  const text = `إعادة تعيين كلمة المرور${name}.\n\n افتح الرابط التالي لإنشاء كلمة مرور جديدة (صالح لمدة ساعة):\n${opts.resetUrl}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة.`;

  return sendEmail({ to: opts.to, subject, html, text });
}