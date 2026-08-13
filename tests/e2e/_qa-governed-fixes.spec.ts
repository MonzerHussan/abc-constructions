import { test, expect } from "@playwright/test";

test.describe("Homepage fixes (/projects/ABC)", () => {
  test("homepage renders default content without DB seed", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    // Default homepage intro content (HOMEPAGE_DEFAULTS fallback) is visible
    await expect(page.getByText("منصة ABC الشاملة").first()).toBeVisible();
    await expect(page.getByText("اربط مشاريعك بأفضل المقاولين والمستقلين").first()).toBeVisible();
  });

  test("marketplace quick access link is available in the header links", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    const marketLink = page.locator("header nav a[href='/projects/ABC/marketplace']").first();
    await expect(marketLink).toBeVisible();
  });

  test("carousel and ads area render placeholder media from defaults", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    // Carousel region shows default slide titles even without seed
    await expect(page.getByText("مناقصات المشاريع").first()).toBeVisible();

    // Ads banner region renders (placeholder) — "اشترك الآن" default ad
    const adsText = await page.locator("body").innerText();
    expect(adsText).toContain("اشترك الآن");
  });

  test("admin homepage shows access-denied for non-admin (not silently homepage)", async ({ page }) => {
    await page.goto("/projects/ABC/admin/homepage");
    // unauth -> redirected to login
    expect(new URL(page.url()).pathname).toBe("/projects/ABC/auth/login");
  });
});