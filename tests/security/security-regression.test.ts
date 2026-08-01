import { describe, it, expect, beforeEach } from 'vitest';

describe('Security regression — self-registration', () => {
  let selfRegisterSchema: typeof import('@/modules/core/validators/user-schemas').selfRegisterSchema;

  beforeEach(async () => {
    selfRegisterSchema = (await import('@/modules/core/validators/user-schemas')).selfRegisterSchema;
  });

  it('rejects platform roles (ADMIN, SUPER_ADMIN) for self-registration', () => {
    for (const role of ['ADMIN', 'SUPER_ADMIN']) {
      const res = selfRegisterSchema.safeParse({
        email: 'x@example.com',
        password: 'StrongPass123!',
        name: 'X',
        role,
      });
      expect(res.success).toBe(false);
    }
  });

  it('rejects missing role / non-enum role', () => {
    const noRole = selfRegisterSchema.safeParse({
      email: 'x@example.com',
      password: 'StrongPass123!',
      name: 'X',
    });
    expect(noRole.success).toBe(false);

    const badRole = selfRegisterSchema.safeParse({
      email: 'x@example.com',
      password: 'StrongPass123!',
      name: 'X',
      role: 'ROOT',
    });
    expect(badRole.success).toBe(false);
  });

  it('allows legitimate business roles', () => {
    for (const role of ['OWNER', 'CONTRACTOR', 'SUPPLIER', 'TRADER', 'FREELANCER']) {
      const res = selfRegisterSchema.safeParse({
        email: 'x@example.com',
        password: 'StrongPass123!',
        name: 'X Corp',
        role,
      });
      expect(res.success).toBe(true);
    }
  });

  it('enforces a minimum password strength', () => {
    const weak = selfRegisterSchema.safeParse({
      email: 'x@example.com',
      password: '123',
      name: 'X',
      role: 'OWNER',
    });
    expect(weak.success).toBe(false);
  });

  it('rejects invalid email addresses', () => {
    const bad = selfRegisterSchema.safeParse({
      email: 'not-an-email',
      password: 'StrongPass123!',
      name: 'X',
      role: 'OWNER',
    });
    expect(bad.success).toBe(false);
  });
});

describe('Security regression — rate limiting', () => {
  let rateLimit: typeof import('@/lib/rate-limit').rateLimit;

  beforeEach(async () => {
    rateLimit = (await import('@/lib/rate-limit')).rateLimit;
  });

  it('allows requests up to the limit, then blocks', () => {
    const key = `test-key-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const r = rateLimit({ key, limit: 3, windowMs: 60_000 });
      expect(r.ok).toBe(true);
    }
    const blocked = rateLimit({ key, limit: 3, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('applies independent buckets for different keys', () => {
    const a = rateLimit({ key: `key-a-${Date.now()}`, limit: 1, windowMs: 60_000 });
    const b = rateLimit({ key: `key-b-${Date.now()}`, limit: 1, windowMs: 60_000 });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });
});

describe('Security regression — file upload magic-byte detection', () => {
  let detectType: typeof import('@/modules/shared/utils/file-type').detectType;

  beforeEach(async () => {
    detectType = (await import('@/modules/shared/utils/file-type')).detectType;
  });

  it('detects a genuine PNG by its magic bytes', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]);
    const res = detectType(png);
    expect(res).toEqual({ ext: 'png', mime: 'image/png' });
  });

  it('detects a genuine JPEG by its magic bytes', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const res = detectType(jpeg);
    expect(res).toEqual({ ext: 'jpg', mime: 'image/jpeg' });
  });

  it('detects a genuine PDF by its magic bytes', () => {
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n');
    const res = detectType(pdf);
    expect(res).toEqual({ ext: 'pdf', mime: 'application/pdf' });
  });

  it('rejects an HTML file masquerading as an image', () => {
    // Attacker sends <script> content; extension would be .html
    const html = Buffer.from('<!DOCTYPE html><script>alert(1)</script>');
    const res = detectType(html);
    expect(res).toBeNull();
  });

  it('rejects arbitrary/empty content', () => {
    expect(detectType(Buffer.from([]))).toBeNull();
    expect(detectType(Buffer.from('hello world'))).toBeNull();
  });
});

describe('Security regression — auth configuration', () => {
  it('session maxAge is set to 7 days (not default 30d)', async () => {
    const { authConfig } = await import('@/auth.config');
    expect(authConfig.session?.maxAge).toBe(7 * 24 * 60 * 60);
  });

  it('next.config applies security headers', async () => {
    const cfg = (await import('../../next.config')).default;
    const headers = await cfg.headers?.();
    expect(headers).toBeDefined();
    const all = headers!.flatMap((h) => h.headers.map((x) => x.key));
    expect(all).toContain('X-Content-Type-Options');
    expect(all).toContain('X-Frame-Options');
    expect(all).toContain('Content-Security-Policy');
    expect(all).toContain('Strict-Transport-Security');
  });
});
