"use client"

import type { ChatMode } from "@/components/planet-guide-chat"
import { MessageSquare, Mic, Globe } from "lucide-react"
import { useI18n, type Locale } from "@/lib/i18n"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

export function ChatHeader({ mode, onModeChange }: ChatHeaderProps) {
  const { t, locale, setLocale, localeNames, availableLocales } = useI18n()

  return (
    <header className="relative z-10 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden orange-glow flex-shrink-0">
            <img src="/images/image.png" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">{t.header.title}</span>
            {t.header.subtitle}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-2"
              >
                <Globe className="w-4 h-4 mr-1 sm:mr-1.5" />
                <span className="text-xs whitespace-nowrap hidden sm:inline-block">{localeNames[locale]}</span>
                <span className="text-xs whitespace-nowrap sm:hidden">{locale === "ja" ? "JA" : "EN"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50">
              {availableLocales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc as Locale)}
                  className={`cursor-pointer ${locale === loc ? "bg-primary/20 text-primary" : ""}`}
                >
                  {localeNames[loc]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode toggle */}
          <div className="flex items-center bg-secondary/80 rounded-full p-1 border border-border/50 flex-shrink-0">
            <button
              onClick={() => onModeChange("text")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                mode === "text"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.mode.text}</span>
            </button>
            <button
              onClick={() => onModeChange("avatar")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                mode === "avatar"
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.mode.voice}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
