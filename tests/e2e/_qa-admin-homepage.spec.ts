import { test, expect } from "@playwright/test";

test("admin dashboard homepage renders behind login redirect", async ({ page }) => {
  await page.goto("/projects/ABC/admin/homepage");
  // Unauthenticated -> redirected to login with callbackUrl
  expect(new URL(page.url()).pathname).toBe("/projects/ABC/auth/login");
  const cb = new URL(page.url()).searchParams.get("callbackUrl");
  expect(cb).toBe("/projects/ABC/admin/homepage");
});