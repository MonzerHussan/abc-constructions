const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3002/projects/ABC", { waitUntil: "networkidle" });

  // Switch to EN via the language switcher if possible, else check RTL headings
  const out = await page.evaluate(() => {
    const bodyText = Array.from(document.querySelectorAll("section, footer"))
      .filter((s) => s.getBoundingClientRect().top > 700)
      .map((s) => ({
        top: Math.round(s.getBoundingClientRect().top),
        text: (s.textContent || "").trim().slice(0, 60),
      }));

    // Find the create-account CTA (gold check)
    const cta = Array.from(document.querySelectorAll("button"))
      .find((b) => (b.textContent || "").includes("حساب") || (b.textContent || "").includes("إنشاء"));
    const stats = Array.from(document.querySelectorAll("p"))
      .filter((p) => /^[0-9,]{3,}\+$/.test((p.textContent || "").trim()))
      .map((p) => ({ v: p.textContent.trim(), color: getComputedStyle(p).color }));

    const zones = Array.from(document.querySelectorAll("main > div:nth-child(2) > div > section > div"))
      .map((z) => {
        const r = z.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, radius: getComputedStyle(z).borderRadius };
      });

    const guestBtn = Array.from(document.querySelectorAll("main button"))
      .find((b) => (b.textContent || "").includes("ضيف") || (b.textContent || "").includes("تسجيل"));
    const gb = guestBtn ? { radius: getComputedStyle(guestBtn).borderRadius, text: (guestBtn.textContent || "").trim().slice(0, 30) } : null;

    return { bodyText, cta: cta ? { text: cta.textContent.trim().slice(0, 20), cls: cta.className } : null, stats, zones, guestBtn: gb };
  });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });