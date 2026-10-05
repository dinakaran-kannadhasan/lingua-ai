import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { upsertUserLanguage, upsertProgress, updateUserName } from '@/lib/db/queries'

const OnboardingSchema = z.object({
  language: z.enum(['french', 'german', 'italian']),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  name: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body: unknown = await request.json()
  const parsed = OnboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { language, level, name } = parsed.data

  await Promise.all([
    updateUserName(session.user.id, name),
    upsertUserLanguage(session.user.id, language, level),
    upsertProgress(session.user.id, language, {}),
  ])

  return NextResponse.json({ success: true })
}
