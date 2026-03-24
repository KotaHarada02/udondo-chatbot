"use client"

import type { Message } from "@/components/planet-guide-chat"
import { YoutubeCard } from "./youtube-card"

interface ChatBubbleProps {
  message: Message
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user"

  const parseContent = (content: string) => {
    // リンクの後に改行や句読点が来ても正しくURLだけを抽出する正規表現
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const parts = content.split(urlRegex)
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 text-blue-400 hover:text-blue-300 break-all transition-colors"
          >
            {part}
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // extract youtube URLs from content
  const extractYoutubeUrls = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const urls = content.match(urlRegex) || [];
    return urls.filter(url => 
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/.test(url)
    );
  }

  const youtubeUrls = Array.from(new Set([...extractYoutubeUrls(message.content), ...(message.youtubeUrl ? [message.youtubeUrl] : [])]));

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-sm">🪐</span>
        </div>
      )}

      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card border border-border/50 text-card-foreground rounded-tl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{parseContent(message.content)}</p>
        </div>

        {youtubeUrls.map((url, i) => (
          <YoutubeCard key={i} url={url} />
        ))}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 neon-glow">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  )
}
