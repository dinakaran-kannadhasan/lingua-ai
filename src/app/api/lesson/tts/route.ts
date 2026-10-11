import { NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { synthesizeSpeech } from '@/lib/ai/tts'

const BodySchema = z.object({
  text: z.string().min(1).max(1000),
  language: z.string().min(2).max(10),
})

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  const parsed = BodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message, code: 'INVALID_INPUT' },
      { status: 400 }
    )
  }

  const { text, language } = parsed.data

  try {
    const audioContent = await synthesizeSpeech(text, language)
    return NextResponse.json({ audioContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS failed'
    return NextResponse.json({ error: message, code: 'TTS_ERROR' }, { status: 500 })
  }
}
