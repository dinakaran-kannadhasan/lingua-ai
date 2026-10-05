'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLessonSession } from '@/hooks/useLessonSession'
import { TeacherChat } from './TeacherChat'
import { ActivityBar } from './ActivityBar'
import { VoicePanel } from './VoicePanel'
import type { ActivityType, Language } from '@/lib/curriculum/types'

interface LessonClientProps {
  sessionId: string
  sessionTitle: string
  unitId: number
  unitTitle: string
  activities: ActivityType[]
  language: Language
  level: string
  teacherName: string
  examName: string
  studentName: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function LessonClient({
  sessionId,
  sessionTitle,
  unitId,
  unitTitle,
  activities,
  language,
  level,
  teacherName,
  studentName,
}: LessonClientProps) {
  const [currentActivity, setCurrentActivity] = useState<ActivityType>(
    activities[0] ?? 'Vocabulary'
  )
  const [elapsed, setElapsed] = useState(0)
  const [inputText, setInputText] = useState('')
  const autoStarted = useRef(false)

  const { messages, sendMessage, isStreaming, error, clearError } = useLessonSession({
    sessionId,
    unitId,
    unitTitle,
    sessionTitle,
    language,
    level,
    currentActivity,
    studentName,
  })

  // Auto-start the lesson on mount
  useEffect(() => {
    if (!autoStarted.current) {
      autoStarted.current = true
      void sendMessage('', { hidden: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Session timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const lastTeacherMessage = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && !m.isStreaming)?.content

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isStreaming) return
    setInputText('')
    await sendMessage(text)
  }, [inputText, isStreaming, sendMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  function handleActivityChange(activity: ActivityType) {
    setCurrentActivity(activity)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Unit {unitId} · {unitTitle}
          </p>
          <h1 className="text-lg font-semibold text-white mt-0.5">{sessionTitle}</h1>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono text-white/60">{formatDuration(elapsed)}</div>
          <p className="text-xs text-white/30">session time</p>
        </div>
      </div>

      {/* Activity Bar */}
      <ActivityBar
        activities={activities}
        currentActivity={currentActivity}
        onActivityChange={handleActivityChange}
        disabled={isStreaming}
      />

      {/* Main layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chat column */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-red-500/15 border-b border-red-500/20 flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400/60 hover:text-red-400 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Messages — flex column so TeacherChat's overflow-y-auto can resolve */}
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <TeacherChat
              messages={messages}
              teacherName={teacherName}
              studentName={studentName}
              isStreaming={isStreaming}
            />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={isStreaming ? 'Teacher is responding…' : 'Type your answer…'}
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

        {/* Voice panel */}
        <div className="w-52 shrink-0">
          <VoicePanel
            language={language}
            lastTeacherMessage={lastTeacherMessage}
            onTranscript={text => {
              setInputText(text)
            }}
            disabled={isStreaming}
          />
        </div>
      </div>
    </div>
  )
}
