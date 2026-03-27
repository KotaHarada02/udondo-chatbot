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
  evaluation?: "good" | "bad"
  isGenerating?: boolean
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
      id: generateUUID(),
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Real API response handling via server-sent events (SSE) style streaming
    const fetchResponse = async () => {
      // Add empty assistant message to stream into
      const assistantId = generateUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", isGenerating: true }
      ]);
      setIsTyping(false);

      try {
        // Use NEXT_PUBLIC_API_URL or default to empty string for relative paths (Vercel)
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        if (!apiUrl && process.env.NODE_ENV === "development") {
          apiUrl = "http://127.0.0.1:8000";
        }
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
            user_message_id: userMessage.id,
            assistant_message_id: assistantId,
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
        let buffer = "";

        while (!doneReading) {
          const { value, done } = await reader.read();
          if (done) {
            doneReading = true;
            break;
          }

          const chunkValue = decoder.decode(value, { stream: true });
          buffer += chunkValue;
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  const errorMsg = locale === "ja" ? "接続エラーです。もう一度メッセージの送信をお願いします。" : "Connection error. Please try sending your message again.";
                  aiFullText = aiFullText ? `${aiFullText}\n\n${errorMsg}` : errorMsg;
                  setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: aiFullText, isGenerating: false } : m
                  ));
                } else if (!data.done) {
                  aiFullText += data.content;
                  setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: aiFullText, isGenerating: true } : m
                  ));
                }
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }

        // Streaming finished normally
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, isGenerating: false } : m
        ));

        // Logs are now saved exclusively by the backend to prevent duplicates
        // Note: metadata such as language and tokens are handled there

      } catch (error) {
        console.error("Error fetching chat:", error);
        const errorMsg = locale === "ja" ? "接続エラーです。もう一度メッセージの送信をお願いします。" : "Connection error. Please try sending your message again.";
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: errorMsg, isGenerating: false } : m
        ));
      }
    };

    fetchResponse();
  }

  const handleEvaluate = async (messageId: string, evaluation: "good" | "bad") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, evaluation } : msg
      )
    )

    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl && process.env.NODE_ENV === "development") {
        apiUrl = "http://127.0.0.1:8000";
      }

      await fetch(`${apiUrl}/api/v1/chat/evaluate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          evaluation,
        }),
      });
    } catch (err) {
      console.error("Evaluation error:", err);
    }
  }

  return (
    <div className="relative flex flex-col h-dvh overflow-hidden">
      <StarBackground />
      <ChatHeader mode={mode} onModeChange={setMode} />

      <div className="flex-1 overflow-hidden">
        {mode === "text" ? (
          <TextModeChat messages={messages} isTyping={isTyping} onEvaluate={handleEvaluate} />
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
