"use client"

import { useState } from "react"
import { Play, ExternalLink } from "lucide-react"

interface YoutubeCardProps {
  url: string
}

export function YoutubeCard({ url }: YoutubeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Extract video ID from YouTube URL (handles watch?v=, youtu.be, shorts, embed)
  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
    return match?.[1] || null
  }
  
  const videoId = extractVideoId(url)

  if (!videoId) return null

  if (isPlaying) {
    return (
      <div className="block overflow-hidden rounded-xl border border-border/50 bg-card/50 aspect-video">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

  return (
    <div
      onClick={() => setIsPlaying(true)}
      className="cursor-pointer block overflow-hidden rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors group"
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
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">YouTube動画</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          title="YouTubeで開く"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      </div>
    </div>
  )
}
