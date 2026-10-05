'use client'

import { useState, useRef, useCallback } from 'react'

// Minimal Web Speech API types (not in all TypeScript DOM lib versions)
interface SpeechRecognitionResultAlt {
  readonly transcript: string
  readonly confidence: number
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
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getSpeechRecognitionClass(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface UseVoiceRecorderOptions {
  language?: string
  onTranscript?: (text: string) => void
}

interface UseVoiceRecorderReturn {
  isRecording: boolean
  transcript: string
  isSupported: boolean
  start: () => void
  stop: () => void
  clearTranscript: () => void
}

export function useVoiceRecorder({
  language = 'fr-FR',
  onTranscript,
}: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const isSupported = getSpeechRecognitionClass() !== null

  const start = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass()
    if (!SpeechRecognitionClass || isRecording) return

    const recognition = new SpeechRecognitionClass()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const text = event.results[0]?.[0]?.transcript ?? ''
      setTranscript(text)
      onTranscript?.(text)
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [isRecording, language, onTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const clearTranscript = useCallback(() => setTranscript(''), [])

  return { isRecording, transcript, isSupported, start, stop, clearTranscript }
}
