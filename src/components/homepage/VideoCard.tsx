"use client"

import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"

export interface VideoData {
  id: string
  title: string
  description: string
  videoUrl: string
  posterUrl: string | null
}

export default function VideoCard({ video }: { video: VideoData }) {
  const hasVideo = Boolean(video.videoUrl)

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden card-hover shadow-sm">
      <div className="relative aspect-video bg-surface-900">
        {video.posterUrl ? (
          <Image
            src={video.posterUrl}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
            <Play className="w-12 h-12 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          {hasVideo ? (
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="تشغيل الفيديو"
            >
              <Play className="w-6 h-6 text-white fill-white" />
            </a>
          ) : (
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-surface-900 text-sm mb-1">{video.title}</h4>
        {video.description && <p className="text-xs text-surface-500 line-clamp-2">{video.description}</p>}
      </div>
    </div>
  )
}

export function HomepageVideoGroup({ videos }: { videos: VideoData[] }) {
  if (videos.length === 0) return null
  return (
    <div className="grid gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

export { Link }
