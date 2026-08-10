import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const resendSendMock = vi.hoisted(() => vi.fn());
const createTransportMock = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: resendSendMock };
    constructor(apiKey: string) {}
  },
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
  createTransport: createTransportMock,
}));

// استيراد ديناميكي حتى تعمل الـ vi.mock قبل تهيئة email.ts
const emailModule = await import('@/lib/email');

describe('email provider selection', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    vi.clearAllMocks();
  });

  it('uses Resend when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 're_test';
    delete process.env.EMAIL_SMTP_URL;
    resendSendMock.mockResolvedValue({ error: null });

    // إعادة تقييم الوحدة النمطية بمتغيرات البيئة الجديدة
    const fresh = await import(`@/lib/email?resend=${Date.now()}`);
    const res = await fresh.sendEmail({
      to: 'a@example.com',
      subject: 'x',
      html: '<p>x</p>',
    });

    expect(res.ok).toBe(true);
    expect(resendSendMock).toHaveBeenCalledTimes(1);
    const args = resendSendMock.mock.calls[0][0];
    expect(args.to).toEqual(['a@example.com']);
    expect(args.html).toContain('<p>x</p>');
  });

  it('uses SMTP (nodemailer) when EMAIL_SMTP_URL is set and no Resend key', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.EMAIL_SMTP_URL = 'smtp://user:pass@smtp.example.com:587';
    createTransportMock.mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ accepted: ['a@example.com'] }),
    });

    const fresh = await import(`@/lib/email?smtp=${Date.now()}`);
    const res = await fresh.sendEmail({
      to: 'a@example.com',
      subject: 'x',
      html: '<p>x</p>',
    });

    expect(res.ok).toBe(true);
    expect(createTransportMock).toHaveBeenCalledWith('smtp://user:pass@smtp.example.com:587');
  });

  it('fails with a clear error when no provider is configured', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_SMTP_URL;

    const fresh = await import(`@/lib/email?none=${Date.now()}`);
    const res = await fresh.sendEmail({ to: 'a@example.com', subject: 'x', html: '<p>x</p>' });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('No email provider configured');
  });

  it('sendPasswordResetEmail builds a reset link and calls sendEmail', async () => {
    process.env.RESEND_API_KEY = 're_test';
    resendSendMock.mockResolvedValue({ error: null });

    const fresh = await import(`@/lib/email?link=${Date.now()}`);
    const res = await fresh.sendPasswordResetEmail({
      to: 'admin@example.com',
      name: 'Admin',
      resetUrl: 'https://app.example.com/auth/reset-password?token=abc',
    });

    expect(res.ok).toBe(true);
    const args = resendSendMock.mock.calls[0][0];
    expect(args.to).toEqual(['admin@example.com']);
    expect(args.subject).toContain('إعادة تعيين كلمة المرور');
    expect(args.html).toContain('https://app.example.com/auth/reset-password?token=abc');
  });
});
