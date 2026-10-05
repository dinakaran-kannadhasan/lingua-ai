'use client'

import { useState, useCallback } from 'react'

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

// Preferred voice name substrings per language code, ordered by quality.
// macOS/Chrome ship these neural voices; fall back to any matching lang if none found.
const PREFERRED_VOICES: Record<string, string[]> = {
  'fr-FR': ['Thomas', 'Amelie', 'Marie', 'Google français', 'fr-FR'],
  'de-DE': ['Anna', 'Markus', 'Google Deutsch', 'de-DE'],
  'it-IT': ['Alice', 'Luca', 'Google italiano', 'it-IT'],
  'en-US': ['Samantha', 'Google US English', 'en-US'],
}

function pickBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const preferred = PREFERRED_VOICES[lang] ?? [lang]

  // Try each preferred name in order
  for (const name of preferred) {
    const match = voices.find(
      v => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes(name)
    )
    if (match) return match
  }

  // Fall back to any voice matching the language
  return voices.find(v => v.lang.startsWith(lang.slice(0, 2))) ?? null
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isSupported =
    typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'

  const speak = useCallback(
    (text: string, lang = 'fr-FR') => {
      if (!isSupported) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.85 // slightly slower than default — more natural for language learning
      utterance.pitch = 1

      // Chrome loads voices asynchronously on first call — retry after voices load
      const trySpeak = () => {
        const voice = pickBestVoice(lang)
        if (voice) utterance.voice = voice
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        trySpeak()
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null
          trySpeak()
        }
      }
    },
    [isSupported]
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported }
}
