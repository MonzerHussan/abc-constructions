import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  passwordResetToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

const rateLimitMock = vi.hoisted(() => vi.fn().mockReturnValue({ ok: true, retryAfterMs: 0 }));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: rateLimitMock,
  getClientIp: () => '127.0.0.1',
}));

const sendPasswordResetEmailMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true }),
);
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true }),
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

import { POST as FORGOT_POST } from '@/app/api/auth/forgot-password/route';
import { POST as RESET_POST } from '@/app/api/auth/reset-password/route';

function jsonReq(url: string, body?: unknown): NextRequest {
  return new Request(url, {
    method: 'POST',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe('Password reset flow (forgot-password + reset-password)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockReturnValue({ ok: true, retryAfterMs: 0 });
  });

  it('forgot-password: 400 without email', async () => {
    const res = await FORGOT_POST(jsonReq('http://localhost/api/auth/forgot-password', {}));
    expect(res.status).toBe(400);
  });

  it('forgot-password: returns generic success for unknown email (no user enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await FORGOT_POST(
      jsonReq('http://localhost/api/auth/forgot-password', { email: 'nobody@example.com' }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('إذا كان البريد الإلكتروني مسجلاً');
    expect(body.resetUrl).toBeUndefined();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it('forgot-password: creates a hashed token and emails the reset link', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'admin@example.com', password: 'hash' });
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'rt1' });

    const res = await FORGOT_POST(
      jsonReq('http://localhost/api/auth/forgot-password', { email: 'Admin@example.com' }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('تم إرسال رابط إعادة التعيين');
    expect(body.resetUrl).toBeUndefined();

    expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
    const emailArgs = sendPasswordResetEmailMock.mock.calls[0][0];
    expect(emailArgs.to).toBe('admin@example.com');
    expect(emailArgs.resetUrl).toContain('/auth/reset-password?token=');
    expect(emailArgs.resetUrl).toContain('email=admin%40example.com');

    const createCall = prismaMock.passwordResetToken.create.mock.calls[0][0];
    const rawToken = emailArgs.resetUrl.split('token=')[1].split('&')[0];
    // tokenHash is a sha-256 hash (64 hex chars), never the raw token
    expect(createCall.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createCall.data.tokenHash).not.toBe(rawToken);
    expect(createCall.data.expiresAt).toBeInstanceOf(Date);
  });

  it('forgot-password: 502 + token invalidated when email provider is unavailable', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'admin@example.com', password: 'hash' });
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'rt1' });
    prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'rt1' });
    sendPasswordResetEmailMock.mockResolvedValueOnce({ ok: false, error: 'No provider' });

    const res = await FORGOT_POST(
      jsonReq('http://localhost/api/auth/forgot-password', { email: 'admin@example.com' }),
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.retryable).toBe(true);
  });

  it('forgot-password: 429 after hitting rate limit', async () => {
    rateLimitMock.mockReturnValue({ ok: false, retryAfterMs: 60000 });
    const res = await FORGOT_POST(
      jsonReq('http://localhost/api/auth/forgot-password', { email: 'admin@example.com' }),
    );
    expect(res.status).toBe(429);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('reset-password: 400 for invalid token shape', async () => {
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: '', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(400);
  });

  it('reset-password: rejects weak password', async () => {
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 'some-token', newPassword: '123' }),
    );
    expect(res.status).toBe(400);
  });

  it('reset-password: rejects unknown token', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 'bad', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(400);
  });

  it('reset-password: rejects expired token', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 'expired', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('reset-password: rejects already-used token', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 10000),
    });
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 'used', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(400);
  });

  it('reset-password: updates password and marks token used (transaction)', async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 10000),
    });
    prismaMock.$transaction.mockResolvedValue([{ id: 'u1' }, { id: 'rt1' }]);

    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 'valid-token', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(200);

    // prisma.user.update و prisma.passwordResetToken.update استُدعيتا داخل $transaction
    const userUpdate = prismaMock.user.update.mock.calls[0][0];
    const tokenUpdate = prismaMock.passwordResetToken.update.mock.calls[0][0];
    expect(userUpdate.where.id).toBe('u1');
    expect(userUpdate.data.password).toBeTruthy();
    // bcrypt hash: starts with $2
    expect(String(userUpdate.data.password)).toMatch(/^\$2/);
    expect(tokenUpdate.data.usedAt).toBeInstanceOf(Date);
  });

  it('reset-password: 429 after hitting rate limit', async () => {
    rateLimitMock.mockReturnValue({ ok: false, retryAfterMs: 60000 });
    const res = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: 't', newPassword: 'newpass123' }),
    );
    expect(res.status).toBe(429);
  });

  it('full flow: forgot-password emails a link → reset-password consumes it → sign-in uses new password', async () => {
    // 1) المستخدم موجود
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com', password: 'old-hash' });
    prismaMock.passwordResetToken.create.mockImplementation(async ({ data }: any) => ({
      id: 'rt1',
      userId: data.userId,
      tokenHash: data.tokenHash,
    }));

    // 2) طلب الاستعادة → سيُرسل رابط عبر مزود البريد (mock يحبس القيمة الفعلية)
    const forgotRes = await FORGOT_POST(
      jsonReq('http://localhost/api/auth/forgot-password', { email: 'user@example.com' }),
    );
    expect(forgotRes.status).toBe(200);

    const emailArgs = sendPasswordResetEmailMock.mock.calls[0][0];
    const resetUrl = new URL(emailArgs.resetUrl);
    const rawToken = resetUrl.searchParams.get('token')!;
    expect(rawToken).toBeTruthy();

    // استرداد التوكن المشفر المخزن
    const storedToken = prismaMock.passwordResetToken.create.mock.calls[0][0];
    expect(storedToken.data.tokenHash).not.toBe(rawToken);

    // 3) المستخدم يفتح الرابط ويعيد التعيين
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    });
    prismaMock.$transaction.mockResolvedValue([{ id: 'u1' }, { id: 'rt1' }]);

    const resetRes = await RESET_POST(
      jsonReq('http://localhost/api/auth/reset-password', { token: rawToken, newPassword: 'brand-new-pass' }),
    );
    expect(resetRes.status).toBe(200);

    const userUpdate = prismaMock.user.update.mock.calls[0][0];
    expect(userUpdate.where.id).toBe('u1');
    expect(String(userUpdate.data.password)).toMatch(/^\$2/); // bcrypt

    // 4) التوكن أصبح مُستهلكاً
    const tokenUpdate = prismaMock.passwordResetToken.update.mock.calls[0][0];
    expect(tokenUpdate.where.id).toBe('rt1');
    expect(tokenUpdate.data.usedAt).toBeInstanceOf(Date);
  });
});