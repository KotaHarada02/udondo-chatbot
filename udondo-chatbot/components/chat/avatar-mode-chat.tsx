"use client"

import type { Message } from "@/components/planet-guide-chat"
import { WaveformVisualizer } from "./waveform-visualizer"
import { YoutubeCard } from "./youtube-card"
import { useI18n } from "@/lib/i18n"

interface AvatarModeChatProps {
  isTyping: boolean
  latestMessage?: Message
}

export function AvatarModeChat({ isTyping, latestMessage }: AvatarModeChatProps) {
  const { t } = useI18n()

  const hasYoutubeUrl = latestMessage?.youtubeUrl

  return (
    <div className="relative z-10 h-full flex flex-col items-center px-4 py-6 overflow-y-auto">
      {/* Spacer to push content to center when no URL */}
      <div className={`flex-1 ${hasYoutubeUrl ? "min-h-4" : ""}`} />

      {/* Avatar Container - Reduced size when YouTube card is shown */}
      <div className={`relative float-animation ${hasYoutubeUrl ? "scale-75" : ""} transition-transform duration-300`}>
        {/* Outer glow ring */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-xl animate-pulse" />

        {/* Avatar frame */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-accent/50 neon-glow overflow-hidden bg-card/50 backdrop-blur-sm">
          {/* Futuristic inner frame */}
          <div className="absolute inset-2 rounded-full border border-primary/30" />
          <div className="absolute inset-4 rounded-full border border-accent/20" />

          {/* Avatar placeholder - Use translated alt text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/image.png" alt={t.avatar.altText} className="w-full h-full object-cover" />
          </div>

          {/* Scanning line effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-pulse"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            />
          </div>
        </div>

        {/* Orbital rings */}
        <div
          className="absolute -inset-8 rounded-full border border-dashed border-accent/20 animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="absolute -inset-12 rounded-full border border-dotted border-primary/20 animate-spin"
          style={{ animationDuration: "30s", animationDirection: "reverse" }}
        />
      </div>

      {/* Waveform - Reduced margin when YouTube card is shown */}
      <div className={`${hasYoutubeUrl ? "mt-4" : "mt-8"} transition-all duration-300`}>
        <WaveformVisualizer isActive={isTyping} />
      </div>

      {/* Latest message display */}
      {latestMessage && latestMessage.role === "assistant" && (
        <div className={`${hasYoutubeUrl ? "mt-3" : "mt-6"} w-full max-w-sm space-y-2`}>
          <div className="text-center">
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">{latestMessage.content}</p>
            </div>
          </div>

          {latestMessage.youtubeUrl && (
            <div className="max-w-xs mx-auto">
              <YoutubeCard url={latestMessage.youtubeUrl} />
            </div>
          )}
        </div>
      )}

      {/* Spacer to push content to center when no URL */}
      <div className="flex-1" />
    </div>
  )
}
