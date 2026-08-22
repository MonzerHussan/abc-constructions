import { test, expect } from "@playwright/test";
import { expectInlineLoginRedirect, waitForInlineLogin } from "./helpers/portal-auth";

test("admin dashboard homepage renders behind login redirect", async ({ page }) => {
  await page.goto("/projects/ABC/admin/homepage");
  await waitForInlineLogin(page, "/projects/ABC/admin/homepage");
  expectInlineLoginRedirect(page.url(), "/projects/ABC/admin/homepage");
});
