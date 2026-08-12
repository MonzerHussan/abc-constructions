import { test, expect } from "@playwright/test";

test.describe("Homepage layout shell", () => {
  test("columns and regions are positioned correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const asides = page.locator("aside");
    expect(await asides.count()).toBe(2);

    const leftBox = await asides.nth(0).boundingBox();
    expect(leftBox!).not.toBeNull();
    expect(Math.abs(leftBox!.width - 260)).toBeLessThan(4);

    const rightBox = await asides.nth(1).boundingBox();
    expect(rightBox!).not.toBeNull();
    expect(Math.abs(rightBox!.width - 260)).toBeLessThan(4);

    const headerBox = await page.locator("header").first().boundingBox();
    expect(headerBox!).not.toBeNull();
    expect(headerBox!.height).toBeLessThanOrEqual(72);

    const footerBox = await page.locator("footer").first().boundingBox();
    expect(footerBox!).not.toBeNull();
    // Footer sits at the natural bottom of the document flow
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(Math.abs(footerBox!.y + footerBox!.height - docH)).toBeLessThan(4);
  });

  test("header dropdown menus open on hover, show exact items, close on leave", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // Bids
    await page.locator("header button:has-text('المناقصات')").hover();
    await page.waitForTimeout(250);
    await expect(page.locator("header div.absolute.top-full.w-52 a")).toHaveText([
      "المشاريع",
      "المواد",
      "المنتجات",
      "الرحلات",
    ]);

    // Market
    await page.locator("header button:has-text('السوق')").hover();
    await page.waitForTimeout(250);
    await expect(page.locator("header div.absolute.top-full.w-52 a")).toHaveText([
      "المشاريع",
      "المواد",
      "المنتجات",
      "التوصيل",
    ]);

    // Community
    await page.locator("header button:has-text('المجتمع')").hover();
    await page.waitForTimeout(250);
    await expect(page.locator("header div.absolute.top-full.w-52 a")).toHaveText(["الوظائف", "التدريب"]);

    // Register
    await page.locator("header button:has-text('إنشاء حساب')").first().hover();
    await page.waitForTimeout(250);
    await expect(page.locator("header div.absolute.top-full.w-56 a")).toHaveText([
      "جهة حكومية",
      "مالك مشروع",
      "استشاري",
      "مورد",
      "مقاول",
      "مقاول فرعي",
      "إدارة المشاريع والصيانة",
      "فرد",
    ]);

    // Moving off the header/menu closes all menus
    await page.mouse.move(10, 400);
    await page.waitForTimeout(250);
    await expect(page.locator("header div.absolute.top-full")).toHaveCount(0);
  });

  test("collapsing left sidebar shrinks it to a 48px rail", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const aside = page.locator("aside").first();
    await aside.locator("button").last().click();
    await page.waitForTimeout(350);

    const collapsedBox = await aside.boundingBox();
    expect(collapsedBox!).not.toBeNull();
    expect(Math.abs(collapsedBox!.width - 48)).toBeLessThan(4);
  });
});