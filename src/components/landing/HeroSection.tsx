"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { HERO_SLIDES, PLATFORM_HOME, PLATFORM_LOGIN } from "@/lib/landing-content";

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const count = HERO_SLIDES.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const slide = HERO_SLIDES[index];

  return (
    <section className="relative h-[520px] w-full overflow-hidden bg-[#0A2540] md:h-[600px]">
      {HERO_SLIDES.map((s, i) => (
        <div key={s.image} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}>
          <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/95 via-[#0A2540]/60 to-[#0A2540]/30" />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4 pb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            End-To-End Project Management Services
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">{slide.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={PLATFORM_HOME}
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-[#0A2540] hover:bg-amber-400 transition-colors"
            >
              Open ABC Platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={PLATFORM_LOGIN}
              className="inline-flex items-center rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Login to Platform
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-amber-400" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}