"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  isWelcome?: boolean
}

function generateUUID(): string {
  return crypto.randomUUID()
}

function PlanetGuideChatInner() {
  const { t, locale } = useI18n()
  const [mode, setMode] = useState<ChatMode>("text")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t.welcome,
      isWelcome: true,
    },
  ])
  const prevLocaleRef = useRef(locale)
  const [sessionId] = useState<string>(() => generateUUID())

  // Update welcome message when language changes
  useEffect(() => {
    if (prevLocaleRef.current !== locale) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isWelcome ? { ...msg, content: t.welcome } : msg
        )
      )
      prevLocaleRef.current = locale
    }
  }, [locale, t.welcome])
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Real API response handling via server-sent events (SSE) style streaming
    const fetchResponse = async () => {
      // Add empty assistant message to stream into
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" }
      ]);
      setIsTyping(false);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // Prepare history format for API
        const history = messages
          .filter(m => !m.isWelcome) // Or include welcome msg, up to you. Usually we ignore static messages.
          .map(m => ({ role: m.role, content: m.content }));

        const response = await fetch(`${apiUrl}/api/v1/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            history: history,
            language: locale === "ja" ? "ja" : "en",
            session_id: sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let doneReading = false;
        let aiFullText = "";

        while (!doneReading) {
          const { value, done } = await reader.read();
          if (done) {
            doneReading = true;
            break;
          }

          const chunkValue = decoder.decode(value, { stream: true });
          const lines = chunkValue.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  aiFullText += `\nError: ${data.error}`;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId ? { ...m, content: aiFullText } : m
                  ));
                } else if (!data.done) {
                  aiFullText += data.content;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId ? { ...m, content: aiFullText } : m
                  ));
                }
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }

        // Logs are now saved exclusively by the backend to prevent duplicates
        // Note: metadata such as language and tokens are handled there

      } catch (error) {
        console.error("Error fetching chat:", error);
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: "サーバーに接続できませんでした。もう一度お試しください。" } : m
        ));
      }
    };

    fetchResponse();
  }

  return (
    <div className="relative flex flex-col h-dvh overflow-hidden">
      <StarBackground />
      <ChatHeader mode={mode} onModeChange={setMode} />

      <div className="flex-1 overflow-hidden">
        {mode === "text" ? (
          <TextModeChat messages={messages} isTyping={isTyping} />
        ) : (
          <AvatarModeChat isTyping={isTyping} latestMessage={messages[messages.length - 1]} />
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} />
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
