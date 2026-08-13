import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const base = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const stamp = Date.now();
const email = `qa-e2e-${stamp}@qa.abc.test`;
const password = 'QaPassw0rd123';

const tmpDoc = path.join(process.env.TEMP ?? '/tmp', 'qa-commercial.pdf');
fs.writeFileSync(tmpDoc, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');

async function registerSupplier(page: Page, mail: string) {
  await page.addInitScript(() => {
    // Intercept programmatic file inputs (created detached + .click()) and
    // deliver a synthetic File so headless Chromium doesn't need a native dialog.
    (window as any).__qaPendingFiles = new Map<number, File>();
    const origClick = HTMLInputElement.prototype.click;
    const origCreate = document.createElement.bind(document);
    document.createElement = ((tag: string, opts?: any) => {
      const el = origCreate(tag, opts);
      if (tag.toLowerCase() === 'input') {
        const val = document.createElement.bind(document) as unknown;
        void val;
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
    void origClick;
  });
  await page.goto('/projects/ABC/auth/register');
  const roleButtons = await page.locator('div.grid.grid-cols-2 > button').all();
  let clicked = false;
  for (const b of roleButtons) {
    const txt = (await b.textContent()) ?? '';
    if (/supplier|مور|مورد/i.test(txt)) { await b.click(); clicked = true; break; }
  }
  if (!clicked) await roleButtons[0].click();
  await page.getByRole('button', { name: /next|التالي/i }).first().click();

  await page.locator('input[type="text"]').nth(0).fill('QA E2E Supplier');
  await page.locator('input[type="tel"]').fill('0555123456');
  await page.locator('input[type="email"]').fill(mail);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('input[type="text"]').nth(1).fill('QA Construction Co');
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /create|إنشاء/i }).last().click();
  await page.waitForLoadState('domcontentloaded');
}

test.describe('QA: full onboarding flow (T1-T4, A1-A5, D1-D2)', () => {
  test('register → onboarding → documents upload → survey submit → success', async ({ page, request }) => {
    test.setTimeout(240_000);
    // Rotate client IP per run so the in-memory register rate-limit (10/hr/IP) doesn't block QA runs.
    await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.200.${stamp % 250}.137` });
    await registerSupplier(page, email);

    // T1
    await page.waitForURL(/onboarding/, { timeout: 40_000 });
    console.log('[QA] T1 URL:', page.url());

    // T2 — Step 1 validation
    const nextBtn = page.getByRole('button', { name: /next|التالي/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(600);
    const errCount = await page.locator('.text-red-500').count();
    console.log('[QA] T2 empty-step1 errors:', errCount);

    // Fill Step 1 (account type + profile)
    const card = page.locator('div.grid .cursor-pointer').first();
    if (await card.count()) await card.click();
    const t = page.locator('input[type="text"]');
    const tc = await t.count();
    if (tc > 0) await t.nth(0).fill('QA E2E Supplier');
    if (tc > 1) await t.nth(1).fill('QA Construction Co');
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() && !(await emailInput.inputValue())) await emailInput.fill(email);
    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.count() && !(await phoneInput.inputValue())) await phoneInput.fill('0555123456');
    await nextBtn.click();
    await page.waitForTimeout(800);

    // Step 2 — upload documents (required). Provide synthetic files via init hook.
    const fileBytes = fs.readFileSync(tmpDoc);
    const maxUploads = 4;
    let uploadedCount = 0;
    for (let attempt = 0; attempt < maxUploads; attempt++) {
      const dz = page.locator('div[class*="border-dashed"]').first();
      if (await dz.count() === 0) break;
      await page.evaluate(async (bytes) => {
        const file = new File([new Uint8Array(bytes)], 'qa-commercial.pdf', { type: 'application/pdf' });
        (window as any).__qaPendingFiles = new Map([[Date.now(), file]]);
      }, Array.from(fileBytes));
      await dz.scrollIntoViewIfNeeded().catch(() => {});
      await dz.click({ force: true });
      await page.waitForTimeout(3000);
      uploadedCount++;
    }
    // confirm uploaded state
    const uploaded = await page.getByText(/uploaded|تم الرفع/i).count();
    console.log('[QA] step2 uploaded indicators:', uploaded);

    // Move to step 3
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log('[QA] after step2 next, URL:', page.url());

    // Step 3 — survey
    // 1) pick a main category (first button in categories grid)
    const catGrid = page.locator('div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
    await catGrid.first().locator('button').first().click();
    await page.waitForTimeout(400);
    console.log('[QA] S1 category buttons:', await catGrid.first().locator('button').count());

    // 2) pick the first subcategory under the selected category
    const subs = catGrid.nth(1).locator('button');
    if (await subs.count()) await subs.first().click();
    await page.waitForTimeout(300);

    // 3) hasProjects -> first button (grid md:grid-cols-3)
    await page.locator('div.grid.md\\:grid-cols-3 button').first().click();

    // 4) budgetRange -> first button (grid md:grid-cols-2)
    await page.locator('div.grid.md\\:grid-cols-2 button').first().click();

    // 5) urgency -> first button (grid md:grid-cols-4)
    await page.locator('div.grid.md\\:grid-cols-4 button').first().click();

    // 6) optional location -> first button in the second md:grid-cols-4 grid
    const locGrid = page.locator('div.grid.grid-cols-2.md\\:grid-cols-4').nth(1);
    if (await locGrid.locator('button').count()) await locGrid.locator('button').first().click();
    console.log('[QA] S8 quick-select picks: done');

    // Submit
    const apiResponses: Record<string, number> = {};
    page.on('response', (r) => { if (r.url().includes('/api/')) apiResponses[r.url().replace(base, '')] = r.status(); });
    await page.getByRole('button', { name: /submit|إرسال/i }).last().click().catch(() => {});
    await page.waitForTimeout(6000);
    console.log('[QA] final URL:', page.url());
    console.log('[QA] API responses:', JSON.stringify(apiResponses));

    // Wait (short poll) for the success screen or an error box
    let successShown = 0;
    let errText = '';
    for (let i = 0; i < 8; i++) {
      successShown = await page.getByText(/Application Received|تم استلام طلبك/i).count();
      if (successShown > 0) break;
      const errEl = await page.locator('.bg-red-50').first();
      if (await errEl.isVisible().catch(() => false)) { errText = (await errEl.textContent()) ?? ''; }
      if (errText) break;
      await page.waitForTimeout(1500);
    }
    console.log('[QA] success screen shown:', successShown, '| error box:', errText.slice(0, 200));

    // D1 — success tracking id shown on screen
    const firstName = successShown > 0 ? (await page.locator('h2').textContent().catch(() => '')) : '';
    const successCard = await page.locator('body').innerText();
    const idx = successCard.indexOf('تم استلام طلبك');
    const afterTitle = idx >= 0 ? successCard.slice(idx, idx + 120) : successCard.slice(-200);
    console.log('[QA] h2:', firstName, '| after title:', JSON.stringify(afterTitle));

    // A5 /me
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

    // Assert we reached submission state (success screen or persisted onboarding)
    expect(successShown).toBeGreaterThan(0);

    // T4 — Unauthenticated visiting /onboarding → redirected to /auth/login
    const anonCtx = await page.context().browser()!.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': `10.200.${(stamp + 1) % 250}.199` },
    });
    const anonPage = await anonCtx.newPage();
    await anonPage.goto(`${base}/projects/ABC/onboarding`, { waitUntil: 'domcontentloaded' });
    await anonPage.waitForTimeout(4000);
    console.log('[QA] T4 anon URL:', anonPage.url());
    expect(anonPage.url().includes('/projects/ABC/auth/login')).toBeTruthy();
    await anonCtx.close();

    // T3 — Already-onboarded user visiting /onboarding is auto-redirected
    await page.goto('/projects/ABC/onboarding', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const redirectedUrl = page.url();
    console.log('[QA] T3 redirected URL:', redirectedUrl);
    // Browser-side session validity + /me from inside the page
    const sess = await page.evaluate(async () => (await (await fetch('/api/auth/session', { credentials: 'include' })).json()));
    const meInPage = await page.evaluate(async () => {
      const r = await fetch('/api/v1/entity-registry/me', { credentials: 'include' });
      return { status: r.status, body: await r.json().catch(() => null) };
    });
    console.log('[QA] T3 session:', JSON.stringify(sess).slice(0, 200));
    console.log('[QA] T3 /me in-page:', JSON.stringify(meInPage).slice(0, 200));
    expect(/onboarding/.test(redirectedUrl)).toBeFalsy();
  });
});