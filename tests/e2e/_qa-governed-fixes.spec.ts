import { test, expect } from "@playwright/test";
import { expectInlineLoginRedirect, openHeaderDropdown, waitForInlineLogin } from "./helpers/portal-auth";

test.describe("Homepage fixes (/projects/ABC)", () => {
  test("homepage renders default content without DB seed", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    await expect(page.locator("main")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("footer")).toBeVisible({ timeout: 20_000 });

    // HOMEPAGE_DEFAULTS carousel + left-block vision copy (portal shell)
    await expect(page.getByText("مناقصات المشاريع").first()).toBeVisible();
    await expect(page.getByText("رؤيتنا").first()).toBeVisible();
    await expect(
      page.getByText(/أن نكون المنصة الرقمية الأولى/).first()
    ).toBeVisible();
  });

  test("marketplace quick access link is available in the header links", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    const marketItems = await openHeaderDropdown(page, "السوق");
    expect(marketItems.join("|")).toMatch(/المواد|المنتجات|المشاريع/);

    const marketLink = page.locator("header a[href='/projects/ABC/marketplace']").first();
    await expect(marketLink).toBeVisible();
  });

  test("carousel and ads area render placeholder media from defaults", async ({ page }) => {
    await page.goto("/projects/ABC", { waitUntil: "load" });

    await expect(page.getByText("مناقصات المشاريع").first()).toBeVisible();

    const adsText = await page.locator("body").innerText();
    expect(adsText).toContain("اشترك الآن");
  });

  test("admin homepage shows access-denied for non-admin (not silently homepage)", async ({ page }) => {
    await page.goto("/projects/ABC/admin/homepage", { waitUntil: "load" });
    await waitForInlineLogin(page);
    expectInlineLoginRedirect(page.url());
  });
});
