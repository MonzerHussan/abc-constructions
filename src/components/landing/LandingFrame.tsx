"use client";

import Link from "next/link";

const SRCDOC = `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Intelligent Projects UAE | AI Solutions, Digital Transformation &amp; Business Consultancy in Dubai</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@700;800&family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" crossorigin href="/assets/index-BL-Xqwoj.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/index-DiTxhc56.js"></script>
  </body>
</html>`;

export default function LandingFrame() {
  return (
    <>
      <iframe
        srcDoc={SRCDOC}
        title="Intelligent Projects UAE"
        className="fixed inset-0 block h-full w-full border-0"
      />
      <Link
        href="/projects/ABC"
        dir="ltr"
        className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#0A2540] px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/25 transition hover:bg-[#123a5e]"
      >
        منصة ABC
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </>
  );
}