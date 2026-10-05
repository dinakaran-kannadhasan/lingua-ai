'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useScenarioSession } from '@/hooks/useScenarioSession'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import type { ScenarioConfig } from '@/lib/curriculum/types'

interface ScenarioChatProps {
  scenario: ScenarioConfig
  language: string
  level: string
  languageCode: string
  teacherName: string
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export function ScenarioChat({
  scenario,
  language,
  level,
  languageCode,
  teacherName,
}: ScenarioChatProps) {
  const [inputText, setInputText] = useState('')
  const autoStarted = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, isStreaming, correctionsCount, error, clearError } =
    useScenarioSession({ scenarioId: scenario.id, language, level })

  const {
    transcript,
    isRecording,
    start: startRec,
    stop: stopRec,
    clearTranscript,
  } = useVoiceRecorder({
    language: languageCode,
    onTranscript: text => setInputText(text),
  })

  const { speak } = useTextToSpeech()

  // Auto-start scenario
  useEffect(() => {
    if (!autoStarted.current) {
      autoStarted.current = true
      void sendMessage('', { hidden: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speak last assistant message aloud
  const speakLast = useCallback(() => {
    const last = [...messages]
      .reverse()
      .find(m => m.role === 'assistant' && !m.isStreaming)
    if (last) speak(last.content, languageCode)
  }, [messages, speak, languageCode])

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isStreaming) return
    setInputText('')
    clearTranscript()
    await sendMessage(text)
  }, [inputText, isStreaming, sendMessage, clearTranscript])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const visibleMessages = messages.filter(m => !m.hidden)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Scenario header */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{scenario.emoji}</span>
          <div>
            <h2 className="font-semibold text-white">{scenario.name}</h2>
            <p className="text-xs text-white/50">{scenario.description}</p>
          </div>
        </div>
        <div className="text-right text-xs text-white/40">
          <div>{teacherName}</div>
          {correctionsCount > 0 && (
            <div className="text-[#FF9F0A]">
              {correctionsCount} correction{correctionsCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 glass-card overflow-y-auto p-4 flex flex-col gap-3 chat-scroll">
        {visibleMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
            Starting scenario…
          </div>
        )}

        {visibleMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0A84FF]/20 border border-[#0A84FF]/30 text-white'
                  : 'bg-white/8 border border-white/10 text-white/90'
              }`}
            >
              {msg.isStreaming && msg.content === '' ? (
                <span className="animate-pulse text-white/40">●●●</span>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between glass-card px-4 py-2 border-red-500/20 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="text-red-400/60 hover:text-red-400 text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <div className="glass-card p-3 flex flex-col gap-2">
        {/* Voice / TTS controls */}
        <div className="flex gap-2">
          <button
            onClick={isRecording ? stopRec : startRec}
            aria-label={isRecording ? 'Stop recording' : `Speak in ${language}`}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              isRecording
                ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                : 'bg-white/8 border border-white/15 text-white/60 hover:text-white'
            }`}
          >
            {isRecording ? '⏹ Stop' : '🎤 Speak'}
          </button>
          <button
            onClick={speakLast}
            disabled={isStreaming}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/8 border border-white/15 text-white/60 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            🔊 Hear
          </button>
          {transcript && (
            <span className="text-xs text-white/40 self-center truncate">
              {transcript}
            </span>
          )}
        </div>

        {/* Text input row */}
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={
              isStreaming ? `${teacherName} is responding…` : `Reply in ${language}…`
            }
            rows={2}
            className="flex-1 glass-input resize-none text-sm py-2"
          />
          <button
            onClick={() => void handleSend()}
            disabled={isStreaming || !inputText.trim()}
            className="btn-primary px-4 py-2 text-sm self-end disabled:opacity-40"
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  )
}
