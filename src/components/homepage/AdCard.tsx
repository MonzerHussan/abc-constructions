"use client"

import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { isUsableMediaUrl } from "@/lib/utils"

export interface AdView {
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

export function adGridClass(count: number) {
  if (count <= 1) return "lg:grid-cols-1"
  if (count === 2) return "sm:grid-cols-2"
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3"
  return "sm:grid-cols-2 lg:grid-cols-4"
}

export default function AdCard({ ad, className }: { ad: AdView; className?: string }) {
  const anim = ANIM_CLASS[ad.animation] ?? "ad-anim-fade"
  const type = ad.type || "image"
  const withText = type === "text" || type === "mixed"
  const isVideo = type === "video"
  const hasVideo = isUsableMediaUrl(ad.videoUrl)
  const hasImage = isUsableMediaUrl(ad.imageUrl)
  const imageUrl = hasImage ? ad.imageUrl.trim() : null
  const posterUrl = isUsableMediaUrl(ad.posterUrl)
    ? ad.posterUrl!.trim()
    : imageUrl ?? undefined

  const media = isVideo && hasVideo ? (
    <video
      src={ad.videoUrl!}
      poster={posterUrl}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  ) : imageUrl ? (
    <Image src={imageUrl} alt={ad.title} fill className="object-cover" />
  ) : null

  const inner = (
    <div
      className={`relative flex h-36 w-full overflow-hidden rounded-none border border-surface-200 bg-surface-900 shadow-sm ${anim} ${className ?? ""}`}
    >
      {media}
      {withText ? (
        <div
          className={`absolute inset-0 flex flex-col p-2.5 text-white ${
            media
              ? "justify-end bg-gradient-to-t from-black/85 via-black/45 to-black/20"
              : "justify-center gap-1.5 bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900"
          }`}
        >
          <h3 className="font-bold text-lg leading-snug line-clamp-1">{ad.title}</h3>
          {ad.subtitle && <p className="text-sm text-white/90 line-clamp-2">{ad.subtitle}</p>}
          {ad.body && <p className="text-xs text-white/75 line-clamp-3">{ad.body}</p>}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-2 pt-5 text-white bg-gradient-to-t from-black/75 to-transparent">
          <h3 className="font-bold text-base line-clamp-1">{ad.title}</h3>
          {ad.subtitle && <p className="text-xs text-white/85 line-clamp-2">{ad.subtitle}</p>}
        </div>
      )}
      {isVideo && hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 shadow-lg ring-4 ring-white/30">
            <Play className="h-5 w-5 text-white fill-white" />
          </span>
        </div>
      )}
    </div>
  )

  const href = isVideo && hasVideo ? ad.videoUrl : ad.linkUrl
  if (!href) return inner
  if (isVideo && hasVideo)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  return <Link href={href}>{inner}</Link>
}