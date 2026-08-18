"use client"

import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"

export interface ZoneView {
  id: string
  type: string
  title: string
  subtitle: string
  body: string
  imageUrl: string
  videoUrl: string | null
  posterUrl: string | null
  linkUrl: string | null
  animation: string
}

const ANIM_CLASS: Record<string, string> = {
  fade: "ad-anim-fade",
  slide: "ad-anim-slide",
  bounce: "ad-anim-bounce",
  pulse: "ad-anim-pulse",
}

export default function ZoneCard({ zone, className }: { zone: ZoneView; className?: string }) {
  const anim = ANIM_CLASS[zone.animation] ?? "ad-anim-fade"
  const type = zone.type || "text"
  const withText = type === "text" || type === "mixed"
  const isVideo = type === "video"
  const hasVideo = Boolean(zone.videoUrl)
  const hasImage = Boolean(zone.imageUrl)

  const media = isVideo && hasVideo ? (
    <video
      src={zone.videoUrl!}
      poster={zone.posterUrl || zone.imageUrl || undefined}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  ) : hasImage ? (
    <Image src={zone.imageUrl} alt={zone.title} fill className="object-cover" />
  ) : null

  const inner = (
    <div
      className={`relative flex h-full w-full min-h-0 overflow-hidden rounded-none border border-surface-200 bg-surface-900 shadow-sm ${anim} ${className ?? ""}`}
    >
      {media}
      {withText ? (
        <div
          className={`absolute inset-0 flex flex-col p-2 text-white ${
            media
              ? "justify-end bg-gradient-to-t from-black/85 via-black/45 to-black/20"
              : "justify-center gap-1.5 bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900"
          }`}
        >
          <h3 className="font-bold text-base leading-snug line-clamp-2">{zone.title}</h3>
          {zone.subtitle && <p className="text-xs text-white/90 line-clamp-2">{zone.subtitle}</p>}
          {zone.body && <p className="text-[11px] text-white/75 line-clamp-3">{zone.body}</p>}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-1.5 pt-4 text-white bg-gradient-to-t from-black/75 to-transparent">
          <h3 className="font-bold text-sm line-clamp-1">{zone.title}</h3>
          {zone.subtitle && <p className="text-[11px] text-white/85 line-clamp-2">{zone.subtitle}</p>}
        </div>
      )}
      {isVideo && hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 shadow-lg ring-4 ring-white/30">
            <Play className="h-5 w-5 text-white fill-white" />
          </span>
        </div>
      )}
    </div>
  )

  const href = isVideo && hasVideo ? zone.videoUrl : zone.linkUrl
  if (!href) return inner
  if (isVideo && hasVideo)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </a>
    )
  return (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  )
}
