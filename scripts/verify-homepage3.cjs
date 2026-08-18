const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // EN version uses ?lang=en or via cookies; try the API-fetch path by checking /api/homepage localized
  await page.goto("http://localhost:3002/projects/ABC", { waitUntil: "networkidle" });

  const out = await page.evaluate(() => {
    const cta = Array.from(document.querySelectorAll("button"))
      .find((b) => (b.textContent || "").includes("إنشاء حساب") || (b.textContent || "").includes("Create"));
    const res = { ctaBg: null, ctaHover: null, secondary500: null, secondary600: null, accent500: null };
    if (cta) res.ctaBg = getComputedStyle(cta).backgroundColor;
    const linkSecondary = Array.from(document.querySelectorAll("a"))
      .find((a) => (a.className || "").includes("text-secondary-600"));
    if (linkSecondary) res.secondary600Text = getComputedStyle(linkSecondary).color;
    // read CSS vars
    const root = getComputedStyle(document.documentElement);
    res.secondary500 = root.getPropertyValue("--secondary-500").trim();
    res.accent500 = root.getPropertyValue("--accent-500").trim();
    return res;
  });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });