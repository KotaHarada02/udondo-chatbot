"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/components/planet-guide-chat"
import { YoutubeCard } from "./youtube-card"

interface ChatBubbleProps {
  message: Message
  onEvaluate?: (id: string, evaluation: "good" | "bad") => void
}

export function ChatBubble({ message, onEvaluate }: ChatBubbleProps) {
  const isUser = message.role === "user"


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
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/images/image.png" alt="AI" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 relative overflow-hidden transition-all duration-300 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : `bg-card border text-card-foreground rounded-tl-sm ${
                  message.isGenerating 
                    ? "border-accent/50 shadow-[0_0_15px_rgba(255,165,0,0.15)]" 
                    : "border-border/50"
                }`
          }`}
        >
          {/* Subtle loading background sweep effect */}
          {!isUser && message.isGenerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-pulse" />
          )}

          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words relative z-10">
            {!message.content && message.isGenerating ? (
              <div className="flex gap-1 h-5 items-center px-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 text-blue-400 hover:text-blue-300 break-all transition-colors"
                      />
                    ),
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 inline-block w-full" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-2" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.isGenerating && message.content && (
                  <span className="inline-block w-2 h-3.5 ml-1 bg-accent/80 animate-pulse align-baseline" />
                )}
              </>
            )}
          </div>
        </div>

        {youtubeUrls.map((url, i) => (
          <YoutubeCard key={i} url={url} />
        ))}

        {!isUser && !message.isWelcome && onEvaluate && (
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => onEvaluate(message.id, "good")}
              className={`p-1.5 rounded-full transition-colors ${message.evaluation === "good" ? "text-green-400 bg-white/10" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
              title="高く評価"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEvaluate(message.id, "bad")}
              className={`p-1.5 rounded-full transition-colors ${message.evaluation === "bad" ? "text-red-400 bg-white/10" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
              title="低く評価"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 neon-glow">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  )
}
