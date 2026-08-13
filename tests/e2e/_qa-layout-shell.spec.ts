import { test, expect } from "@playwright/test";

test.describe("Homepage layout shell (/projects/ABC)", () => {
  test("hero content and CTA render from defaults without seed", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    // Hero region renders even when the DB has no seeded homepage rows
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    // Default CTA labels are always present (HOMEPAGE_DEFAULTS fallback)
    await expect(page.getByText("ابدأ الآن مجاناً").first()).toBeVisible();
    await expect(page.getByText("تصفح المناقصات").first()).toBeVisible();
  });

  test("navbar menus open on click and show exact items with prefixed links", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    // Bids
    await page.locator("nav button:has-text('المناقصات')").click();
    await page.waitForTimeout(250);
    await expect(page.locator("nav a[href*='/projects/ABC/tenders/']").first()).toBeVisible();
    const bids = await page.locator("nav div.absolute.top-full a").allTextContents();
    expect(bids.join("|")).toContain("مناقصات المشاريع");
    expect(bids.join("|")).toContain("مناقصات المواد");

    // Market
    await page.locator("nav button:has-text('السوق')").click();
    await page.waitForTimeout(250);
    const market = await page.locator("nav div.absolute.top-full a").allTextContents();
    expect(market.join("|")).toContain("سوق البضائع");
    expect(market.join("|")).toContain("خدمة التوصيل");

    // Community
    await page.locator("nav button:has-text('المجتمع')").click();
    await page.waitForTimeout(250);
    const community = await page.locator("nav div.absolute.top-full a").allTextContents();
    expect(community.join("|")).toContain("التدريب");
    expect(community.join("|")).toContain("التوظيف");
  });

  test("register and login links point to the platform auth routes", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    const registerLink = page.locator("nav a[href='/projects/ABC/auth/register']").first();
    await expect(registerLink).toBeVisible();

    const loginLink = page.locator("nav a[href='/projects/ABC/auth/login']").first();
    await expect(loginLink).toBeVisible();
  });
});