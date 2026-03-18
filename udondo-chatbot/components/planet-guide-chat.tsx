"use client"

import { useState, useEffect, useRef } from "react"
import { ChatHeader } from "./chat/chat-header"
import { TextModeChat } from "./chat/text-mode-chat"
import { AvatarModeChat } from "./chat/avatar-mode-chat"
import { ChatInput } from "./chat/chat-input"
import { StarBackground } from "./chat/star-background"
import { I18nProvider, useI18n } from "@/lib/i18n"

export type ChatMode = "text" | "avatar"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  youtubeUrl?: string
}

function PlanetGuideChatInner() {
  const { t } = useI18n()
  const [mode, setMode] = useState<ChatMode>("text")
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t.welcome,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  // YouTube URLを抽出する正規表現
  const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/

  const handleSendMessage = async (content: string) => {
    // 増分表示用にアシスタントの空メッセージを追加
    const assistantId = `assistant-${Date.now()}`
    const userId = `user-${Date.now()}`

    const userMessage: Message = { id: userId, role: "user", content }
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "" }])
    setIsLoading(true)

    // AbortController for canceling
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      // 送信する会話履歴（role, content）
      const payloadMessages = messages
        .map((m) => ({ role: m.role, content: m.content }))
        .concat([{ role: "user", content }])

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulated = ""

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value)
          accumulated += chunk

          // ストリーミングで届いたテキストをアシスタントメッセージに反映
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          )
        }
      }

      // 受信完了後、YouTube URLが含まれていればフィールドを埋める
      const urlMatch = accumulated.match(youtubeRegex)
      if (urlMatch) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, youtubeUrl: urlMatch[0] } : m))
        )
      }
    } catch (err) {
      console.error("chat stream error", err)
      // エラー時はアシスタントメッセージを置き換え
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: "申し訳ありません。応答の取得に失敗しました。" } : m))
      )
    } finally {
      setIsLoading(false)
      controllerRef.current = null
    }
  }

  return (
    <div className="relative flex flex-col h-dvh overflow-hidden">
      <StarBackground />
      <ChatHeader mode={mode} onModeChange={setMode} />

      <div className="flex-1 overflow-hidden">
        {mode === "text" ? (
          <TextModeChat messages={messages} isTyping={isLoading} />
        ) : (
          <AvatarModeChat isTyping={isLoading} latestMessage={messages[messages.length - 1]} />
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

export function PlanetGuideChat() {
  return (
    <I18nProvider>
      <PlanetGuideChatInner />
    </I18nProvider>
  )
}
