import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import type Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth/config'
import { anthropicClient, AI_MODEL, buildSystemPrompt } from '@/lib/ai/claude'
import { lessonChatLimiter } from '@/lib/redis/rateLimiter'
import { saveLessonSession } from '@/lib/db/queries'
import { LANGUAGES } from '@/lib/curriculum/data'
import type { Language } from '@/lib/curriculum/types'
import { parseVocabularyFromResponse } from '@/lib/srs/vocabularyParser'
import { saveVocabularyItem } from '@/lib/srs/scheduler'

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const ChatSchema = z.object({
  messages: z.array(MessageSchema).max(100),
  language: z.enum(['french', 'german', 'italian']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  activityType: z.string().min(1),
  sessionId: z.string().min(1),
  unitId: z.number().int().positive(),
  unitTitle: z.string(),
  sessionTitle: z.string(),
  studentName: z.string().default(''),
  startedAt: z.number().optional(),
})

function isTextBlock(block: Anthropic.ContentBlock): block is Anthropic.TextBlock {
  return block.type === 'text'
}

const encoder = new TextEncoder()

function sseChunk(data: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body: unknown = await request.json()
  const parsed = ChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { success: rateLimitOk } = await lessonChatLimiter.limit(session.user.id)
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  const {
    messages,
    language,
    level,
    activityType,
    sessionId,
    unitId,
    unitTitle,
    sessionTitle,
    studentName,
    startedAt,
  } = parsed.data

  const langConfig = LANGUAGES[language as Language]
  const examName = langConfig.levelExams[level as 'A1'] ?? langConfig.exam

  const systemPrompt = buildSystemPrompt({
    language: language as Language,
    level,
    teacherName: langConfig.teacher,
    studentName: studentName || (session.user.name ?? ''),
    examName,
    unitTitle,
    sessionTitle,
    activityType,
  })

  // If no messages, provide a start prompt
  const apiMessages =
    messages.length === 0
      ? [{ role: 'user' as const, content: 'Please begin the lesson.' }]
      : messages.map(m => ({ role: m.role, content: m.content }))

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = anthropicClient.messages.stream({
          model: AI_MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages: apiMessages,
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(sseChunk({ type: 'delta', content: event.delta.text }))
          }
        }

        const finalMsg = await stream.finalMessage()
        const assistantText = finalMsg.content
          .filter(isTextBlock)
          .map(b => b.text)
          .join('')

        const durationSecs = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0

        const allMessages = [
          ...apiMessages,
          { role: 'assistant' as const, content: assistantText },
        ]

        // Fire and forget — don't block the stream
        void saveLessonSession({
          userId: session.user.id,
          language,
          level,
          unitId,
          sessionId,
          activityType,
          conversation: allMessages,
          durationSecs,
        }).catch(err => console.error('Failed to save lesson session:', err))

        // Extract and save vocabulary items from Vocabulary activity responses
        if (activityType === 'Vocabulary' && assistantText) {
          const vocabItems = parseVocabularyFromResponse(assistantText)
          for (const item of vocabItems) {
            void saveVocabularyItem({
              userId: session.user.id,
              language,
              word: item.word,
              phonetic: item.phonetic,
              meaning: item.meaning,
              example: item.example,
            }).catch(() => null)
          }
        }

        controller.enqueue(sseChunk({ type: 'done' }))
      } catch (err) {
        console.error('Lesson chat stream error:', err)
        controller.enqueue(sseChunk({ type: 'error', error: 'Stream failed' }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
