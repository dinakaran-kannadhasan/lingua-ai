import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { anthropicClient, AI_MODEL, buildScenarioPrompt } from '@/lib/ai/claude'
import { lessonChatLimiter } from '@/lib/redis/rateLimiter'
import { saveScenarioSession } from '@/lib/db/queries'
import { LANGUAGES, SCENARIOS } from '@/lib/curriculum/data'
import type { Language } from '@/lib/curriculum/types'
import type Anthropic from '@anthropic-ai/sdk'

const ScenarioChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .max(100),
  language: z.enum(['french', 'german', 'italian']),
  level: z.string().min(1),
  scenarioId: z.string().min(1),
  correctionsCount: z.number().int().min(0).default(0),
})

function sseChunk(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

function isTextBlock(block: Anthropic.ContentBlock): block is Anthropic.TextBlock {
  return block.type === 'text'
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body: unknown = await request.json()
  const parsed = ScenarioChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const { messages, language, level, scenarioId, correctionsCount } = parsed.data

  const { success } = await lessonChatLimiter.limit(session.user.id)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  const scenario = SCENARIOS.find(s => s.id === scenarioId)
  if (!scenario) {
    return NextResponse.json(
      { error: 'Unknown scenario', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  const langConfig = LANGUAGES[language as Language]
  const systemPrompt = buildScenarioPrompt({
    language: langConfig.name,
    level,
    teacherName: langConfig.teacher,
    scenarioName: scenario.name,
    scenarioDescription: scenario.description,
  })

  const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> =
    messages.map(m => ({
      role: m.role,
      content: m.content,
    }))

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = anthropicClient.messages.stream({
          model: AI_MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages,
        })

        let fullContent = ''

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullContent += event.delta.text
            controller.enqueue(sseChunk({ type: 'delta', content: event.delta.text }))
          }
        }

        // Count corrections in final response
        const correctionMatches = fullContent.match(/💡\s*\*\*Correction:/g)
        const newCorrections = correctionMatches?.length ?? 0

        // Fire-and-forget: save if conversation is long enough
        if (messages.length >= 2) {
          const allMessages = [
            ...messages,
            { role: 'assistant' as const, content: fullContent },
          ]
          void saveScenarioSession({
            userId: session.user.id,
            language,
            scenarioType: scenarioId,
            conversation: allMessages,
            correctionsCount: correctionsCount + newCorrections,
          }).catch(() => null)
        }

        const finalResult = await stream.finalMessage()
        const finalText = finalResult.content
          .filter(isTextBlock)
          .map(b => b.text)
          .join('')
        controller.enqueue(
          sseChunk({
            type: 'done',
            fullContent: fullContent || finalText,
            newCorrections,
          })
        )
      } catch (err) {
        controller.enqueue(
          sseChunk({
            type: 'error',
            error: err instanceof Error ? err.message : 'Stream error',
          })
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
