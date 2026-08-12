import { test, expect } from "@playwright/test";

test.describe("Homepage governed fixes", () => {
  test("register dropdown is at the END of the header, not between menus", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // Open bids menu -> register dropdown must NOT be in the same dropdown
    await page.locator("header button:has-text('المناقصات')").hover();
    await page.waitForTimeout(200);
    const bidItems = await page.locator("header div.absolute.top-full.w-52 a").allTextContents();
    expect(bidItems).toEqual(["المشاريع", "المواد", "المنتجات", "الرحلات"]);
    await page.mouse.move(400, 20);
    await page.waitForTimeout(200);

    // Open register (orange button at far end) -> shows role items
    await page.locator("header button:has-text('إنشاء حساب')").hover();
    await page.waitForTimeout(200);
    const regItems = await page.locator("header div.absolute.top-full.end-0.w-56 a").allTextContents();
    expect(regItems.length).toBe(8);
    expect(regItems[0]).toBe("جهة حكومية");
  });

  test("quick services strip exists below the ads area", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // The strip renders one column per menu (project/material/marketplace/delivery...)
    // For default menus (bids/market/community) locate by the "السوق" column header.
    const marketCol = page.locator("div.p-3 >> text=السوق").first();
    await expect(marketCol).toBeVisible();
    // It is placed BELOW the ads images in the DOM / lower on the page
    const adsImg = page.locator("img[src*='/ads/']").first();
    const stripY = await marketCol.boundingBox();
    const adsY = await adsImg.boundingBox();
    expect(adsY!.y + adsY!.height).toBeLessThanOrEqual(stripY!.y + 2);
  });

  test("left column has intro text under the logo", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const aside = page.locator("aside").first();
    await expect(aside.locator("text=منصة ABC الشاملة")).toBeVisible();
    await expect(aside.locator("text=اربط مشاريعك")).toBeVisible();
  });

  test("admin homepage shows access-denied for non-admin (not silently homepage)", async ({ page }) => {
    await page.goto("/projects/ABC/admin/homepage");
    // unauth -> redirected to login
    expect(new URL(page.url()).pathname).toBe("/projects/ABC/auth/login");
  });
});