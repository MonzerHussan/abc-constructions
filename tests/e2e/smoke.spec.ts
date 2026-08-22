import { test, expect } from '@playwright/test';
import { openLoginViaLegacyRoute, openRegisterPanel } from './helpers/portal-auth';

test.describe('Security headers & static responses', () => {
  test('landing page loads and serves security headers', async ({ request }) => {
    const res = await request.get('/');
    expect(res.ok()).toBeTruthy();
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBeDefined();
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['strict-transport-security']).toBeDefined();
  });

  test('seed endpoints are not exposed publicly', async ({ request }) => {
    const roles = await request.post('/api/seed/roles', { data: {} });
    expect(roles.status()).toBeGreaterThanOrEqual(401);
    expect(roles.status()).toBeLessThanOrEqual(403);

    const permissions = await request.post('/api/seed/permissions', { data: {} });
    expect(permissions.status()).toBeGreaterThanOrEqual(401);
    expect(permissions.status()).toBeLessThanOrEqual(403);
  });

  test('unauth requests to protected APIs are rejected', async ({ request }) => {
    const res = await request.post('/api/upload', { data: {} });
    expect(res.status()).toBe(401);
  });
});

test.describe('Authentication UI', () => {
  test('login page renders email and password fields', async ({ page }) => {
    await openLoginViaLegacyRoute(page);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page walks the role wizard and renders details form', async ({ page }) => {
    await openRegisterPanel(page, 'accountCategoryOwner');
    await expect(page.locator('input[name="organization"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /create|إنشاء/i }).last()).toBeVisible();
  });
});
