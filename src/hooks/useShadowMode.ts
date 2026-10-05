'use client'

import { useState, useCallback } from 'react'
import type { ShadowPhrase } from '@/lib/curriculum/types'
import type { PronunciationResult } from '@/lib/ai/pronunciation'

type ShadowState = 'idle' | 'listening' | 'recording' | 'scoring' | 'result'

interface UseShadowModeOptions {
  phrases: ShadowPhrase[]
  language: string
  languageCode: string
}

interface UseShadowModeReturn {
  currentIndex: number
  currentPhrase: ShadowPhrase | undefined
  state: ShadowState
  result: PronunciationResult | null
  error: string | null
  next: () => void
  prev: () => void
  startRecording: () => void
  stopRecording: () => void
  reset: () => void
}

// Minimal Web Speech API types
interface SpeechRecognitionResultAlt {
  readonly transcript: string
}
interface SpeechRecognitionResultItem {
  readonly length: number
  readonly isFinal: boolean
  [index: number]: SpeechRecognitionResultAlt
}
interface SpeechRecognitionResultEvent extends Event {
  readonly results: {
    readonly length: number
    [index: number]: SpeechRecognitionResultItem
  }
}
interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getSRClass(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useShadowMode({
  phrases,
  language,
  languageCode,
}: UseShadowModeOptions): UseShadowModeReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [state, setState] = useState<ShadowState>('idle')
  const [result, setResult] = useState<PronunciationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentPhrase = phrases[currentIndex]

  const next = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, phrases.length - 1))
    setResult(null)
    setState('idle')
    setError(null)
  }, [phrases.length])

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
    setResult(null)
    setState('idle')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setState('idle')
    setError(null)
  }, [])

  const scoreAudio = useCallback(
    async (audioBlob: Blob, referenceText: string) => {
      setState('scoring')
      try {
        const arrayBuffer = await audioBlob.arrayBuffer()
        // Use browser-native base64 encoding — avoids relying on Node.js Buffer polyfill in client code
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

        const res = await fetch('/api/lesson/pronunciation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64, referenceText, language }),
        })

        if (!res.ok) throw new Error('Scoring failed')
        const data = (await res.json()) as PronunciationResult
        setResult(data)
        setState('result')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Scoring failed')
        setState('idle')
      }
    },
    [language]
  )

  const startRecording = useCallback(() => {
    if (state !== 'idle' && state !== 'result') return
    if (!currentPhrase) return

    const SRClass = getSRClass()
    if (!SRClass) {
      // No Web Speech API — use MediaRecorder for audio blob
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream)
          const chunks: BlobPart[] = []

          recorder.ondataavailable = e => chunks.push(e.data)
          recorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop())
            const blob = new Blob(chunks, { type: 'audio/webm' })
            void scoreAudio(blob, currentPhrase.text)
          }

          setState('recording')
          recorder.start()
          // Auto-stop after 8 seconds
          setTimeout(() => {
            if (recorder.state === 'recording') recorder.stop()
          }, 8000)
        })
        .catch(() => setError('Microphone access denied'))
      return
    }

    // Use Web Speech API for transcript-based scoring (no binary audio)
    const recognition = new SRClass()
    recognition.lang = languageCode
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      // Create a fake score based on word overlap for Web Speech fallback
      const refWords = currentPhrase.text.toLowerCase().split(/\s+/)
      const spokenWords = transcript.toLowerCase().split(/\s+/)
      const matches = spokenWords.filter(w => refWords.includes(w)).length
      const overallScore = Math.round((matches / refWords.length) * 100)

      setResult({
        overallScore: Math.min(overallScore + 20, 100), // small bonus for attempting
        accuracyScore: overallScore,
        fluencyScore: overallScore,
        completenessScore: Math.round((spokenWords.length / refWords.length) * 100),
        wordScores: refWords.map(word => ({
          word,
          accuracyScore: spokenWords.includes(word) ? 100 : 0,
          errorType: spokenWords.includes(word) ? 'None' : 'Omission',
        })),
      })
      setState('result')
    }

    recognition.onerror = () => {
      setError('Could not capture audio. Please try again.')
      setState('idle')
    }

    recognition.onend = () => {
      setState(s => (s === 'recording' ? 'idle' : s))
    }

    setState('recording')
    recognition.start()
  }, [state, currentPhrase, languageCode, scoreAudio])

  const stopRecording = useCallback(() => {
    setState('idle')
  }, [])

  return {
    currentIndex,
    currentPhrase,
    state,
    result,
    error,
    next,
    prev,
    startRecording,
    stopRecording,
    reset,
  }
}
