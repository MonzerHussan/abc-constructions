"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SlideData {
  id: string
  type: string
  title: string
  subtitle: string
  imageUrl: string
  videoUrl: string | null
  posterUrl: string | null
  linkUrl: string | null
}

export default function HomepageCarousel({ slides, dir, fill }: { slides: SlideData[]; dir: "rtl" | "ltr"; fill?: boolean }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])

  useEffect(() => {
    if (paused || count <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, count, next])

  if (count === 0) return null

  return (
    <div
      className={cn("relative overflow-hidden", fill && "h-full")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn("flex transition-transform duration-700 ease-in-out h-full")}
        style={{ transform: `translateX(${dir === "rtl" ? index * 100 : -index * 100}%)` }}
      >
        {slides.map((slide) => {
          const stype = slide.type || "image"
          const isVideo = stype === "video" && Boolean(slide.videoUrl)
          const isText = stype === "text"
          return (
            <div key={slide.id} className="min-w-full relative h-full">
              <div
                className={cn("relative h-[360px] md:h-[440px] w-full overflow-hidden", fill && "min-h-full")}
              >
                {isVideo ? (
                  <video
                    src={slide.videoUrl!}
                    poster={slide.posterUrl || slide.imageUrl || undefined}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : isText ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900" />
                ) : (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover carousel-zoom"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div
                  className={cn(
                    "absolute inset-x-0 p-3 md:p-5",
                    isText ? "inset-y-0 flex flex-col items-center justify-center text-center" : "bottom-0"
                  )}
                >
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow">
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-white/85 text-sm md:text-lg mb-2 max-w-2xl">{slide.subtitle}</p>
                  )}
                  {slide.linkUrl && (
                    <Link
                      href={slide.linkUrl}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-amber-500 text-white rounded-none font-bold hover:bg-amber-600 transition-colors text-sm"
                    >
                      {dir === "rtl" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      ابدأ الآن
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={dir === "rtl" ? next : prev}
            className="absolute top-1/2 -translate-y-1/2 start-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/35 transition-colors"
            aria-label="السابق"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={dir === "rtl" ? prev : next}
            className="absolute top-1/2 -translate-y-1/2 end-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/35 transition-colors"
            aria-label="التالي"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-amber-500" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                aria-label={`شريحة ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}