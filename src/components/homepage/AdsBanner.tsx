"use client"

import Link from "next/link"
import Image from "next/image"

export interface AdData {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string | null
  animation: string
}

const ANIM_CLASS: Record<string, string> = {
  fade: "ad-anim-fade",
  slide: "ad-anim-slide",
  bounce: "ad-anim-bounce",
  pulse: "ad-anim-pulse",
}

export default function AdsBanner({ ads }: { ads: AdData[] }) {
  if (ads.length === 0) return null

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-4 ${ads.length === 1 ? "grid-cols-1" : ads.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {ads.map((ad) => {
            const anim = ANIM_CLASS[ad.animation] ?? "ad-anim-fade"
            const inner = (
              <div
                className={`relative h-36 rounded-2xl overflow-hidden border border-surface-200 ${anim} card-hover`}
              >
                <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent p-5 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-lg mb-1">{ad.title}</h3>
                  {ad.subtitle && <p className="text-white/85 text-sm">{ad.subtitle}</p>}
                </div>
              </div>
            )
            return ad.linkUrl ? (
              <Link key={ad.id} href={ad.linkUrl}>
                {inner}
              </Link>
            ) : (
              <div key={ad.id}>{inner}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
