import { expect, type Page } from "@playwright/test";

/** Assert middleware inline-login redirect contract (?login=1 on homepage). */
export function expectInlineLoginRedirect(url: string, callbackUrl?: string) {
  const u = new URL(url);
  expect(u.pathname).toBe("/projects/ABC");
  expect(u.searchParams.get("login")).toBe("1");
  if (callbackUrl !== undefined) {
    expect(u.searchParams.get("callbackUrl")).toBe(callbackUrl);
  }
}

/** Wait until URL reflects inline login redirect. */
export async function waitForInlineLogin(page: Page, callbackUrl?: string) {
  await page.waitForURL(
    (url) => {
      const u = new URL(url);
      if (u.pathname !== "/projects/ABC") return false;
      if (u.searchParams.get("login") !== "1") return false;
      if (callbackUrl !== undefined && u.searchParams.get("callbackUrl") !== callbackUrl) return false;
      return true;
    },
    { timeout: 20_000 },
  );
}

/** Wait until URL reflects inline register panel. */
export async function waitForInlineRegister(page: Page) {
  await page.waitForURL(
    (url) => {
      const u = new URL(url);
      return u.pathname === "/projects/ABC" && u.searchParams.get("register") === "1";
    },
    { timeout: 20_000 },
  );
}

/** Open inline login panel (direct URL or legacy /auth/login redirect). */
export async function openLoginPanel(page: Page, callbackUrl?: string) {
  const qs = callbackUrl
    ? `?login=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "?login=1";
  await page.goto(`/projects/ABC${qs}`, { waitUntil: "load" });
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
}

/** Legacy /auth/login URLs redirect to inline panel on homepage. */
export async function openLoginViaLegacyRoute(page: Page) {
  await page.goto("/projects/ABC/auth/login", { waitUntil: "load" });
  await waitForInlineLogin(page);
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 30_000 });
}

/** Open inline register panel for a platform account category. */
export async function openRegisterPanel(page: Page, categoryKey = "accountCategorySupplier") {
  await page.goto(`/projects/ABC?register=1&category=${categoryKey}`, {
    waitUntil: "load",
  });
  await waitForInlineRegister(page);
  await expect(page.locator('input[name="organization"], input[name="name"]').first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 30_000 });
}

/** Fill RegisterInline for a company/supplier account and submit. */
export async function submitRegisterInline(page: Page, opts: {
  email: string;
  password: string;
  name?: string;
  companyName?: string;
}) {
  const name = opts.name ?? "QA E2E Supplier";
  const companyName = opts.companyName ?? "QA Construction Co";

  await page.locator('input[name="organization"]').fill(companyName);

  await page.waitForFunction(() => {
    const selects = Array.from(document.querySelectorAll("select"));
    return selects.some((s) => s.options.length > 1 && s.options[1]?.value);
  }, { timeout: 20_000 });

  const selects = page.locator("select");
  await selects.nth(0).selectOption({ index: 1 });
  await page.locator('input[name="name"]').fill(name);
  await selects.nth(2).selectOption({ index: 1 });

  await page.locator('input[type="tel"]').fill("501234567");
  await page.locator('input[type="email"]').fill(opts.email);
  await page.locator('input[name="new-password"]').first().fill(opts.password);
  await page.locator('input[name="confirm-new-password"]').fill(opts.password);

  await page.getByRole("button", { name: /create|إنشاء/i }).last().click();

  const registerError = page.locator(".bg-danger-50").first();
  await Promise.race([
    page.waitForURL(/\/onboarding/, { timeout: 45_000 }),
    registerError.waitFor({ state: "visible", timeout: 45_000 }).then(async () => {
      const msg = (await registerError.textContent())?.trim() ?? "unknown register error";
      throw new Error(`RegisterInline failed: ${msg}`);
    }),
  ]);
}

/** Open a homepage header NavDropdown and return visible link texts. */
export async function openHeaderDropdown(page: Page, menuLabel: string | RegExp) {
  await page.locator("header button").filter({ hasText: menuLabel }).first().click();
  const panel = page.locator("header div.absolute.top-full").first();
  await expect(panel).toBeVisible({ timeout: 5_000 });
  return panel.locator("a").allTextContents();
}
