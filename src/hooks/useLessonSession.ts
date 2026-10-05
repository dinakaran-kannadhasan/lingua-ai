'use client'

import { useState, useCallback } from 'react'
import type { ActivityType, Language } from '@/lib/curriculum/types'

export interface LessonMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  hidden?: boolean
}

interface UseLessonSessionOptions {
  sessionId: string
  unitId: number
  unitTitle: string
  sessionTitle: string
  language: Language
  level: string
  currentActivity: ActivityType
  studentName?: string
}

interface UseLessonSessionReturn {
  messages: LessonMessage[]
  sendMessage: (text: string, opts?: { hidden?: boolean }) => Promise<void>
  isStreaming: boolean
  error: string | null
  clearError: () => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function useLessonSession(
  options: UseLessonSessionOptions
): UseLessonSessionReturn {
  const {
    sessionId,
    unitId,
    unitTitle,
    sessionTitle,
    language,
    level,
    currentActivity,
    studentName = '',
  } = options

  const [messages, setMessages] = useState<LessonMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const sendMessage = useCallback(
    async (text: string, opts: { hidden?: boolean } = {}) => {
      if (isStreaming) return

      const userMessage: LessonMessage = {
        id: generateId(),
        role: 'user',
        content: text || 'Please begin the lesson.',
        hidden: opts.hidden ?? text.length === 0,
      }

      const assistantId = generateId()
      const assistantMessage: LessonMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])
      setIsStreaming(true)
      setError(null)

      try {
        // Build the messages array for the API (only non-hidden, non-empty messages)
        const apiMessages = [...messages, userMessage]
          .filter(m => !m.hidden && m.content.trim().length > 0)
          .map(m => ({ role: m.role, content: m.content }))

        const response = await fetch('/api/lesson/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            language,
            level,
            activityType: currentActivity,
            sessionId,
            unitId,
            unitTitle,
            sessionTitle,
            studentName,
          }),
        })

        if (!response.ok) {
          const errData = (await response.json()) as { error?: string }
          throw new Error(errData.error ?? `Request failed: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            const event = JSON.parse(raw) as {
              type: 'delta' | 'done' | 'error'
              content?: string
              error?: string
            }

            if (event.type === 'delta' && event.content) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + event.content! } : m
                )
              )
            } else if (event.type === 'error') {
              throw new Error(event.error ?? 'Stream error')
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        // Remove the empty assistant message on error
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } finally {
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        )
        setIsStreaming(false)
      }
    },
    [
      isStreaming,
      messages,
      language,
      level,
      currentActivity,
      sessionId,
      unitId,
      unitTitle,
      sessionTitle,
      studentName,
    ]
  )

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    clearError,
  }
}
