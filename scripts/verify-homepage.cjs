const { chromium } = require("playwright");

const BASE = "http://localhost:3002";

function r(v) {
  return Math.round(v * 100) / 100;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/projects/ABC`, { waitUntil: "networkidle" });

  const report = await page.evaluate(() => {
    const r = (v) => Math.round(v * 100) / 100;
    function info(el, tag) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag,
        x: r.x, y: r.y, w: r.width, h: r.height,
        radius: r.width > 0 && r.height > 0 ? cs.borderRadius : "?",
        bg: cs.backgroundColor,
        text: (el.textContent || "").trim().slice(0, 40),
      };
    }

    const out = { main: null, left: null, header: null, carousel: null, zones: [], adsBand: null, stats: null, videosTitle: null, footer: null };

    const main = document.querySelector("main");
    if (main) out.main = { x: r(main.getBoundingClientRect().x), y: r(main.getBoundingClientRect().y), w: r(main.getBoundingClientRect().width), h: r(main.getBoundingClientRect().height) };
    const left = document.querySelector("main > section");
    if (left) out.left = info(left, "left-column");
    const header = document.querySelector("header");
    if (header) out.header = info(header, "header");
    const panels = document.querySelectorAll("main section, header");
    const zones = document.querySelectorAll("main > div:nth-child(2) > div > section > div");
    zones.forEach((z, i) => { if (i < 3) out.zones.push(info(z, `zone-${i + 1}`)); });

    const grid = document.querySelector("main > div:nth-child(2)");
    if (grid) {
      const gridKids = grid.children;
      for (let i = 0; i < gridKids.length; i++) {
        const gc = gridKids[i];
        out.adsBand = info(gc, "ads-band-or-row");
      }
    }

    const after = document.querySelectorAll("main ~ *");
    return out;
  });

  // Also collect text headings below main
  const bodyText = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section, footer"));
    const top = sections.filter((s) => {
      const r = s.getBoundingClientRect();
      return r.top > 700;
    }).map((s) => ({
      tag: s.tagName,
      top: Math.round(s.getBoundingClientRect().top),
      text: (s.textContent || "").trim().slice(0, 60),
    }));
    return top;
  });

  console.log(JSON.stringify({ report, bodyText }, null, 2));

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });