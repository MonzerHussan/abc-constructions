import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { expectInlineLoginRedirect, openRegisterPanel, submitRegisterInline, waitForInlineLogin } from './helpers/portal-auth';
import { clickOnboardingWizardNext, completeDynamicSurvey } from './helpers/dynamic-survey';

const base = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const stamp = Date.now();
const email = `qa-e2e-${stamp}@qa.abc.test`;
const password = 'QaPassw0rd123';

const tmpDoc = path.join(process.env.TEMP ?? '/tmp', 'qa-commercial.pdf');
fs.writeFileSync(tmpDoc, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');

async function registerSupplier(page: Page, mail: string) {
  await page.addInitScript(() => {
    (window as any).__qaPendingFiles = new Map<number, File>();
    const origCreate = document.createElement.bind(document);
    document.createElement = ((tag: string, opts?: any) => {
      const el = origCreate(tag, opts);
      if (tag.toLowerCase() === 'input') {
        el.addEventListener('click', () => {
          const inputEl = el as HTMLInputElement;
          if (inputEl.type === 'file' && (window as any).__qaPendingFiles && (window as any).__qaPendingFiles.size > 0) {
            const dt = new DataTransfer();
            for (const f of (window as any).__qaPendingFiles.values()) dt.items.add(f);
            Object.defineProperty(el, 'files', { value: dt.files, configurable: true });
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      return el;
    }) as any;
  });
  await openRegisterPanel(page, 'accountCategorySupplier');
  await submitRegisterInline(page, { email: mail, password });
}

async function ensureStep1ProfileReady(page: Page, mail: string) {
  const companyTypeField = page.locator('label', { hasText: /نوع الشركة|company type|entity type/i }).locator('..').locator('input').first();
  if (await companyTypeField.count() && !(await companyTypeField.inputValue())) {
    await companyTypeField.fill('General Supplier');
  }

  const fullName = page.locator('input[type="text"]').first();
  if (await fullName.count() && !(await fullName.inputValue())) await fullName.fill('QA E2E Supplier');

  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.count() && !(await emailInput.inputValue())) await emailInput.fill(mail);

  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.count() && !(await phoneInput.inputValue())) await phoneInput.fill('501234567');
}

test.describe('QA: full onboarding flow (T1-T4, A1-A5, D1-D2)', () => {
  test('register → onboarding → documents upload → survey submit → success', async ({ page, request }) => {
    test.setTimeout(360_000);
    await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.200.${stamp % 250}.137` });
    await registerSupplier(page, email);

    // T1 — lands on onboarding wizard
    await page.waitForURL(/onboarding/, { timeout: 45_000 });
    console.log('[QA] T1 URL:', page.url());

    // T2 — Step 1 validation (empty required fields)
    await clickOnboardingWizardNext(page);
    await page.waitForTimeout(500);
    const errCount = await page.locator('.text-danger-600, .text-red-500').count();
    console.log('[QA] T2 empty-step1 errors:', errCount);

    await ensureStep1ProfileReady(page, email);
    await clickOnboardingWizardNext(page);
    await page.waitForTimeout(600);

    // Step 2 — identity verification (optional; skip uploads unless opted in)
    await clickOnboardingWizardNext(page);
    await page.waitForTimeout(600);
    console.log('[QA] after step2 next, URL:', page.url());

    // Step 3 — dynamic survey contract (replaces legacy static grid selectors)
    await completeDynamicSurvey(page);

    await expect(page.getByText(/تم استلام طلبك|Application Received|درخواست موصول/i)).toBeVisible({
      timeout: 90_000,
    });
    console.log('[QA] success screen shown');

    // D1 / A5 — /me reflects onboarded state
    const cookies = await page.context().cookies().catch(() => []);
    const cookieStr = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const csrf = (await (await request.get(`${base}/api/auth/csrf`)).json()).csrfToken;
    const meRes = await request.get(`${base}/api/v1/entity-registry/me`, {
      headers: { cookie: cookieStr, 'x-csrf-token': csrf },
    });
    console.log('[QA] A5 /me status:', meRes.status());
    if (meRes.ok()) {
      const d = (await meRes.json())?.data ?? {};
      console.log('[QA] A5 isOnboarded:', d.isOnboarded, '| profile:', !!d.profile, '| entity:', !!d.entity);
    }

    // T4 — Unauthenticated visiting /onboarding → inline login panel
    const anonCtx = await page.context().browser()!.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': `10.200.${(stamp + 1) % 250}.199` },
    });
    const anonPage = await anonCtx.newPage();
    await anonPage.goto(`${base}/projects/ABC/onboarding`, { waitUntil: 'load' });
    await waitForInlineLogin(anonPage, '/projects/ABC/onboarding');
    console.log('[QA] T4 anon URL:', anonPage.url());
    expectInlineLoginRedirect(anonPage.url(), '/projects/ABC/onboarding');
    await anonCtx.close();

    // T3 — Already-onboarded user visiting /onboarding is auto-redirected
    await page.goto('/projects/ABC/onboarding', { waitUntil: 'load' });
    await page.waitForURL((url) => !/\/onboarding/.test(url.pathname), { timeout: 20_000 });
    const redirectedUrl = page.url();
    console.log('[QA] T3 redirected URL:', redirectedUrl);
    expect(/onboarding/.test(redirectedUrl)).toBeFalsy();
  });
});
