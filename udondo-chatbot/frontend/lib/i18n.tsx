"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Locale = "ja" | "en" | "zh" | "ko"

interface Translations {
  header: {
    title: string
    subtitle: string
  }
  mode: {
    text: string
    voice: string
  }
  input: {
    placeholder: string
    voiceInput: string
    send: string
    footer: string
  }
  avatar: {
    altText: string
  }
  welcome: string
}

const translations: Record<Locale, Translations> = {
  ja: {
    header: {
      title: "惑星",
      subtitle: "案内人",
    },
    mode: {
      text: "テキスト",
      voice: "音声",
    },
    input: {
      placeholder: "メッセージを入力...",
      voiceInput: "音声入力",
      send: "送信",
      footer: "惑星のウドンドへようこそ",
    },
    avatar: {
      altText: "惑星案内人",
    },
    welcome:
      "ようこそ、惑星のウドンドへ！私は惑星案内人です。宇宙で一番美味しいうどんをご案内します。何かご質問はありますか？",
  },
  en: {
    header: {
      title: "Planet",
      subtitle: "Guide",
    },
    mode: {
      text: "Text",
      voice: "Voice",
    },
    input: {
      placeholder: "Enter your message...",
      voiceInput: "Voice input",
      send: "Send",
      footer: "Welcome to Planet Udonudo",
    },
    avatar: {
      altText: "Planet Guide",
    },
    welcome:
      "Welcome to Planet Udonudo! I'm your Planet Guide. Let me show you the most delicious udon in the universe. Do you have any questions?",
  },
  zh: {
    header: {
      title: "星球",
      subtitle: "向导",
    },
    mode: {
      text: "文字",
      voice: "语音",
    },
    input: {
      placeholder: "输入消息...",
      voiceInput: "语音输入",
      send: "发送",
      footer: "欢迎来到乌冬星球",
    },
    avatar: {
      altText: "星球向导",
    },
    welcome: "欢迎来到乌冬星球！我是星球向导。让我为您介绍宇宙中最美味的乌冬面。您有什么问题吗？",
  },
  ko: {
    header: {
      title: "행성",
      subtitle: "가이드",
    },
    mode: {
      text: "텍스트",
      voice: "음성",
    },
    input: {
      placeholder: "메시지를 입력하세요...",
      voiceInput: "음성 입력",
      send: "보내기",
      footer: "우동도 행성에 오신 것을 환영합니다",
    },
    avatar: {
      altText: "행성 가이드",
    },
    welcome:
      "우동도 행성에 오신 것을 환영합니다! 저는 행성 가이드입니다. 우주에서 가장 맛있는 우동을 안내해 드리겠습니다. 질문이 있으신가요?",
  },
}

const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
  localeNames: Record<Locale, string>
  availableLocales: Locale[]
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja")

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const value: I18nContextType = {
    locale,
    setLocale,
    t: translations[locale],
    localeNames,
    availableLocales: ["ja", "en", "zh", "ko"],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
