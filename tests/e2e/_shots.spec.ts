import { test } from "@playwright/test";

test("screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "shot-home.png", fullPage: false });
  await page.goto("/projects/ABC/admin/homepage", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "shot-admin.png", fullPage: false });
});