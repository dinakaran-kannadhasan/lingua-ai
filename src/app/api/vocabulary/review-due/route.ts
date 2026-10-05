import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { getReviewDue } from '@/lib/srs/scheduler'

const QuerySchema = z.object({
  language: z.enum(['french', 'german', 'italian']),
})

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({ language: searchParams.get('language') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid language parameter', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const items = await getReviewDue(session.user.id, parsed.data.language)
  return NextResponse.json({ items, count: items.length })
}
