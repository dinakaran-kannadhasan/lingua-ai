import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { redis } from '@/lib/redis/client'
import { ttsPronunciationLimiter } from '@/lib/redis/rateLimiter'
import { assessPronunciation } from '@/lib/ai/pronunciation'
import { anthropicClient, AI_MODEL } from '@/lib/ai/claude'

const PronunciationSchema = z.object({
  // 2MB base64 ≈ 1.5MB decoded ≈ ~10 seconds of audio — prevents memory exhaustion
  audioBase64: z.string().min(1).max(2_000_000),
  referenceText: z.string().min(1).max(500),
  language: z.enum(['french', 'german', 'italian']),
})

const AZURE_USAGE_KEY = 'lingua:azure:pronunciation:seconds'
const AZURE_FREE_LIMIT_SECONDS = 5 * 60 * 60 // 5 hours/month

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body: unknown = await request.json()
  const parsed = PronunciationSchema.safeParse(body)
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

  const { audioBase64, referenceText, language } = parsed.data

  // Rate limit
  const { success } = await ttsPronunciationLimiter.limit(session.user.id)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  // Check Azure free tier usage (~5 hrs/month). Estimate: 5 seconds per request.
  const usedSeconds = (await redis.get<number>(AZURE_USAGE_KEY)) ?? 0

  if (usedSeconds < AZURE_FREE_LIMIT_SECONDS && process.env.AZURE_SPEECH_KEY) {
    try {
      const result = await assessPronunciation({ audioBase64, referenceText, language })
      await redis.incrby(AZURE_USAGE_KEY, 5)
      return NextResponse.json(result)
    } catch {
      // Fall through to Claude fallback
    }
  }

  // Claude fallback when Azure limit reached or key not configured
  const claudeResult = await assessPronunciationFallback({
    referenceText,
    language,
    userId: session.user.id,
  })
  return NextResponse.json(claudeResult)
}

async function assessPronunciationFallback(params: {
  referenceText: string
  language: string
  userId: string
}) {
  // Sanitize referenceText to prevent prompt injection — remove quotes and control characters
  const safeText = params.referenceText.replace(/["\n\r`]/g, ' ').trim()

  const response = await anthropicClient.messages.create({
    model: AI_MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a pronunciation coach. The student attempted to say the following phrase in ${params.language}: <phrase>${safeText}</phrase>. Without hearing the audio, estimate a likely score for a beginner. Return JSON only: {"overallScore": 65, "accuracyScore": 65, "fluencyScore": 60, "completenessScore": 70, "wordScores": [], "fallback": true}`,
      },
    ],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>
  }
  return {
    overallScore: 65,
    accuracyScore: 65,
    fluencyScore: 60,
    completenessScore: 70,
    wordScores: [],
    fallback: true,
  }
}
