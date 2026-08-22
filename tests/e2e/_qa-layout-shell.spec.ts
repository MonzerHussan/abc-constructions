import { test, expect } from "@playwright/test";
import { openHeaderDropdown, openLoginPanel } from "./helpers/portal-auth";

test.describe("Homepage layout shell (/projects/ABC)", () => {
  test("hero content and CTA render from defaults without seed", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "domcontentloaded" });

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    // Portal homepage: carousel defaults + header auth controls (replaces legacy hero CTAs)
    await expect(page.getByText("مناقصات المشاريع").first()).toBeVisible();
    await expect(page.locator("header button").filter({ hasText: "تسجيل الدخول" }).first()).toBeVisible();
    await expect(page.locator("header button").filter({ hasText: "إنشاء حساب" }).first()).toBeVisible();
  });

  test("navbar menus open on click and show exact items with prefixed links", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "domcontentloaded" });

    const bids = await openHeaderDropdown(page, "المناقصات");
    expect(bids.join("|")).toContain("المشاريع");
    expect(bids.join("|")).toContain("المواد");
    await expect(page.locator("header a[href*='/projects/ABC/']").first()).toBeVisible();

    const market = await openHeaderDropdown(page, "السوق");
    expect(market.join("|")).toContain("التوصيل");
    expect(market.join("|")).toMatch(/المواد|المنتجات/);

    const community = await openHeaderDropdown(page, "المجتمع");
    expect(community.join("|")).toContain("التدريب");
    expect(community.join("|")).toContain("الوظائف");
  });

  test("register and login links point to the platform auth routes", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "domcontentloaded" });

    await openLoginPanel(page);
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();

    await page.goto("/projects/ABC", { waitUntil: "domcontentloaded" });
    await page.locator("header button").filter({ hasText: "إنشاء حساب" }).first().click();
    await expect(page.locator("header div.absolute.top-full button").first()).toBeVisible({ timeout: 5_000 });

    await page.locator("header div.absolute.top-full button").filter({ hasText: "مورد" }).first().click();
    await expect(page).toHaveURL(/register=1/);
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});
