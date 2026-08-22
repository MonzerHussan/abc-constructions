import { expect, type Page } from "@playwright/test";

/** Scope to the dynamic onboarding survey step (progress bar + section nav). */
function surveyRoot(page: Page) {
  return page.locator(".space-y-3").filter({
    has: page.locator(".h-1.bg-secondary-500"),
  });
}

/** Wait until DynamicSurveyStep finished loading template + progress. */
export async function waitForDynamicSurveyReady(page: Page) {
  const root = surveyRoot(page);
  await expect(root).toBeVisible({ timeout: 60_000 });
  await expect(root.locator(".animate-spin")).toHaveCount(0, { timeout: 60_000 });
  await expect(root.locator("h3").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/تعذّر تحميل الاستبيان|لا يوجد استبيان مهيّأ|Could not load the survey|No survey template/i)).toHaveCount(0);
}

/** Pick sensible defaults for the visible survey section. */
async function answerCurrentSurveySection(page: Page) {
  const root = surveyRoot(page);
  const blocks = root.locator(".space-y-2 .space-y-1");
  const count = await blocks.count();

  for (let i = 0; i < count; i++) {
    const block = blocks.nth(i);
    const choiceButtons = block.locator("button.border.rounded-none");
    if (await choiceButtons.count()) {
      const preferNo = block.locator("button.border.rounded-none", { hasText: /^لا$|^No$/i });
      if (await preferNo.count()) {
        await preferNo.first().click();
        continue;
      }

      let selected = false;
      for (let j = 0; j < (await choiceButtons.count()); j++) {
        const btn = choiceButtons.nth(j);
        const cls = (await btn.getAttribute("class")) ?? "";
        if (cls.includes("border-secondary-500")) {
          selected = true;
          break;
        }
      }
      if (!selected) await choiceButtons.first().click();
      continue;
    }

    const textarea = block.locator("textarea");
    if (await textarea.count()) {
      if (!(await textarea.inputValue())) await textarea.fill("QA E2E note");
      continue;
    }

    const input = block.locator('input:not([type="hidden"])');
    if (await input.count()) {
      const field = input.first();
      if (await field.getAttribute("readonly")) continue;
      if (await field.inputValue()) continue;
      const type = (await field.getAttribute("type")) ?? "text";
      if (type === "email") await field.fill("qa-e2e@qa.abc.test");
      else if (type === "tel") await field.fill("501234567");
      else if (type === "date") await field.fill("2020-01-01");
      else await field.fill("QA E2E");
      continue;
    }

    const select = block.locator("select");
    if (await select.count()) {
      const options = await select.locator("option").count();
      if (options > 1) await select.selectOption({ index: 1 });
    }
  }
}

/** Walk every visible dynamic survey section until submit completes the flow. */
export async function completeDynamicSurvey(page: Page, maxSections = 30) {
  await waitForDynamicSurveyReady(page);

  for (let section = 0; section < maxSections; section++) {
    await answerCurrentSurveySection(page);

    const submit = page.getByRole("button", { name: /إرسال الطلب|Submit Application|درخواست جمع/i });
    if (await submit.isVisible()) {
      await submit.click();
      return;
    }

    const next = surveyRoot(page).getByRole("button", { name: /^(التالي|Next|اگلا)$/ });
    await expect(next).toBeVisible();
    await next.click();
    await page.locator(".animate-spin").waitFor({ state: "hidden", timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(400);
  }

  throw new Error(`Dynamic survey did not finish within ${maxSections} sections`);
}

/** Wizard footer "Next" on onboarding steps 1–2 (hidden on step 3). */
export async function clickOnboardingWizardNext(page: Page) {
  await page
    .locator(".flex.items-center.justify-between")
    .filter({ has: page.getByRole("button", { name: /السابق|Back|پیچھے/i }) })
    .getByRole("button", { name: /^(التالي|Next|اگلا)$/ })
    .click();
}
