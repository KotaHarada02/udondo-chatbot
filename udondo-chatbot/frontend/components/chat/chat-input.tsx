"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface ChatInputProps {
  onSendMessage: (content: string) => void
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("")
  const { t } = useI18n()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className="relative z-10 px-4 py-3 border-t border-border/50 bg-card/80 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-accent hover:bg-accent/10"
          aria-label={t.input.voiceInput}
        >
          <Mic className="w-5 h-5" />
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.input.placeholder}
          className="flex-1 bg-secondary/50 border-border/50 focus-visible:ring-accent placeholder:text-muted-foreground/60"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground orange-glow disabled:opacity-50 disabled:shadow-none"
          aria-label={t.input.send}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground/60 mt-2">{t.input.footer}</p>
    </div>
  )
}
