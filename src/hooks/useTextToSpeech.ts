'use client'

import { useState, useCallback, useRef } from 'react'

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

// Web Speech fallback: preferred voice names per language code, ordered by quality
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
  for (const name of preferred) {
    const match = voices.find(
      v => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes(name)
    )
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith(lang.slice(0, 2))) ?? null
}

function speakWebSpeech(text: string, lang: string, onEnd: () => void): void {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.85
  utterance.pitch = 1
  const trySpeak = () => {
    const voice = pickBestVoice(lang)
    if (voice) utterance.voice = voice
    utterance.onend = onEnd
    utterance.onerror = onEnd
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
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    (typeof window.speechSynthesis !== 'undefined' || typeof Audio !== 'undefined')

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string, lang = 'fr-FR') => {
      if (!isSupported) return
      stop()
      setIsSpeaking(true)

      fetch('/api/lesson/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      })
        .then(async res => {
          if (!res.ok) throw new Error(`TTS API ${res.status}`)
          return res.json() as Promise<{ audioContent: string }>
        })
        .then(data => {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
          audioRef.current = audio
          audio.onended = () => {
            audioRef.current = null
            setIsSpeaking(false)
          }
          audio.onerror = () => {
            audioRef.current = null
            setIsSpeaking(false)
          }
          return audio.play()
        })
        .catch(() => {
          // Fall back to Web Speech API when Google TTS is unavailable
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            speakWebSpeech(text, lang, () => setIsSpeaking(false))
          } else {
            setIsSpeaking(false)
          }
        })
    },
    [isSupported, stop]
  )

  return { speak, stop, isSpeaking, isSupported }
}
