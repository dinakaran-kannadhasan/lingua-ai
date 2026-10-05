'use client'

import { useState, useCallback } from 'react'

export interface ScenarioMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  hidden?: boolean
}

interface UseScenarioSessionOptions {
  scenarioId: string
  language: string
  level: string
}

interface UseScenarioSessionReturn {
  messages: ScenarioMessage[]
  sendMessage: (text: string, opts?: { hidden?: boolean }) => Promise<void>
  isStreaming: boolean
  correctionsCount: number
  error: string | null
  clearError: () => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function useScenarioSession({
  scenarioId,
  language,
  level,
}: UseScenarioSessionOptions): UseScenarioSessionReturn {
  const [messages, setMessages] = useState<ScenarioMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [correctionsCount, setCorrectionsCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const sendMessage = useCallback(
    async (text: string, opts: { hidden?: boolean } = {}) => {
      if (isStreaming) return

      const userMessage: ScenarioMessage = {
        id: generateId(),
        role: 'user',
        content: text || 'Please begin the scenario.',
        hidden: opts.hidden ?? text.length === 0,
      }

      const assistantId = generateId()
      const assistantMessage: ScenarioMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])
      setIsStreaming(true)
      setError(null)

      try {
        const apiMessages = [...messages, userMessage]
          .filter(m => !m.hidden && m.content.trim().length > 0)
          .map(m => ({ role: m.role, content: m.content }))

        const response = await fetch('/api/scenario/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            language,
            level,
            scenarioId,
            correctionsCount,
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
              newCorrections?: number
              error?: string
            }

            if (event.type === 'delta' && event.content) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + event.content! } : m
                )
              )
            } else if (event.type === 'done' && event.newCorrections) {
              setCorrectionsCount(c => c + event.newCorrections!)
            } else if (event.type === 'error') {
              throw new Error(event.error ?? 'Stream error')
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } finally {
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m))
        )
        setIsStreaming(false)
      }
    },
    [isStreaming, messages, language, level, scenarioId, correctionsCount]
  )

  return { messages, sendMessage, isStreaming, correctionsCount, error, clearError }
}
