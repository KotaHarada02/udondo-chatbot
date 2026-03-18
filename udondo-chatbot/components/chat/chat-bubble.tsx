"use client"

import type { Message } from "@/components/planet-guide-chat"
import { YoutubeCard } from "./youtube-card"

interface ChatBubbleProps {
  message: Message
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user"

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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.youtubeUrl && <YoutubeCard url={message.youtubeUrl} />}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 neon-glow">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  )
}
