"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/components/planet-guide-chat"
import { ChatBubble } from "./chat-bubble"

interface TextModeChatProps {
  messages: Message[]
  isTyping: boolean
  onEvaluate?: (id: string, evaluation: "good" | "bad") => void
}

export function TextModeChat({ messages, isTyping, onEvaluate }: TextModeChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div ref={scrollRef} className="relative z-10 h-full overflow-y-auto px-4 py-4 space-y-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onEvaluate={onEvaluate} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/images/image.png" alt="AI Typing" className="w-full h-full object-cover" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
