import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { scheduleReview } from '@/lib/srs/scheduler'

const RateSchema = z.object({
  vocabularyId: z.string().min(1),
  rating: z.enum(['Again', 'Hard', 'Good', 'Easy']),
})

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body: unknown = await request.json()
  const parsed = RateSchema.safeParse(body)
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

  await scheduleReview(parsed.data.vocabularyId, parsed.data.rating, session.user.id)
  return NextResponse.json({ ok: true })
}
