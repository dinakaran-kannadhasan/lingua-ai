'use client'

import { useEffect, useRef } from 'react'
import type { LessonMessage } from '@/hooks/useLessonSession'

interface TeacherChatProps {
  messages: LessonMessage[]
  teacherName: string
  studentName: string
  isStreaming: boolean
}

function formatMessage(text: string): string {
  // Very light formatting: bold (**text**) and line breaks
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
}

export function TeacherChat({
  messages,
  teacherName,
  studentName,
  isStreaming,
}: TeacherChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const visible = messages.filter(m => !m.hidden)

  if (visible.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/30 text-sm">Lesson loading…</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2 chat-scroll">
      {visible.map(msg => {
        const isTeacher = msg.role === 'assistant'
        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isTeacher ? 'items-start' : 'items-start flex-row-reverse'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isTeacher
                  ? 'bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#0A84FF]'
                  : 'bg-white/10 border border-white/20 text-white/60'
              }`}
            >
              {isTeacher ? teacherName.charAt(0) : studentName.charAt(0) || 'Y'}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isTeacher
                  ? 'bg-white/8 border border-white/10 text-white/90 rounded-tl-sm'
                  : 'bg-[#0A84FF]/20 border border-[#0A84FF]/25 text-white rounded-tr-sm'
              }`}
            >
              {isTeacher ? (
                <div
                  className="space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: `<p>${formatMessage(msg.content)}</p>`,
                  }}
                />
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.isStreaming && (
                <span className="inline-block ml-1 w-1.5 h-4 bg-[#0A84FF]/60 animate-pulse rounded-full" />
              )}
            </div>
          </div>
        )
      })}

      {isStreaming && visible[visible.length - 1]?.role !== 'assistant' && (
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF]/40 flex items-center justify-center text-xs font-bold text-[#0A84FF] shrink-0">
            {teacherName.charAt(0)}
          </div>
          <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
