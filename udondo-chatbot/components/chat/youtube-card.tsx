"use client"

import { Play, ExternalLink } from "lucide-react"

interface YoutubeCardProps {
  url: string
}

export function YoutubeCard({ url }: YoutubeCardProps) {
  // Extract video ID from YouTube URL
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]

  if (!videoId) return null

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors group"
    >
      <div className="relative aspect-video">
        <img
          src={thumbnailUrl || "/placeholder.svg"}
          alt="YouTube video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40 flex items-center justify-center group-hover:bg-background/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center orange-glow">
            <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">YouTube動画</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </a>
  )
}
