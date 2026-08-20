"use client"

import AdCard, { adGridClass, type AdView } from "./AdCard"

export default function AdsBanner({ ads }: { ads: AdView[] }) {
  if (ads.length === 0) return null

  return (
    <section className="w-full py-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className={`grid gap-2 ${adGridClass(ads.length)}`}>
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </div>
    </section>
  )
}