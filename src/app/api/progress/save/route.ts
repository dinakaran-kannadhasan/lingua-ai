import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserProgress, upsertProgress } from '@/lib/db/queries'

const SaveProgressSchema = z.object({
  language: z.enum(['french', 'german', 'italian']),
  sessionId: z.string().min(1),
  hoursAdded: z.number().min(0).max(10),
  wordsLearned: z.number().int().min(0).optional().default(0),
  skills: z
    .object({
      reading: z.number().min(0).max(100).optional(),
      writing: z.number().min(0).max(100).optional(),
      speaking: z.number().min(0).max(100).optional(),
      listening: z.number().min(0).max(100).optional(),
    })
    .optional(),
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
  const parsed = SaveProgressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { language, sessionId, hoursAdded, wordsLearned, skills } = parsed.data
  const userId = session.user.id

  const existing = await getUserProgress(userId, language)

  // Streak logic
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastActive = new Date(existing?.lastActiveAt ?? 0)
  lastActive.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  )
  const newStreak =
    diffDays === 0
      ? (existing?.streakDays ?? 1)
      : diffDays === 1
        ? (existing?.streakDays ?? 0) + 1
        : 1

  // Merge skill scores (take the max of existing + new)
  const existingSkills =
    existing?.skills &&
    typeof existing.skills === 'object' &&
    !Array.isArray(existing.skills)
      ? (existing.skills as Record<string, unknown>)
      : {}

  const mergedSkills = {
    reading: Math.max(
      typeof existingSkills['reading'] === 'number' ? existingSkills['reading'] : 0,
      skills?.reading ?? 0
    ),
    writing: Math.max(
      typeof existingSkills['writing'] === 'number' ? existingSkills['writing'] : 0,
      skills?.writing ?? 0
    ),
    speaking: Math.max(
      typeof existingSkills['speaking'] === 'number' ? existingSkills['speaking'] : 0,
      skills?.speaking ?? 0
    ),
    listening: Math.max(
      typeof existingSkills['listening'] === 'number' ? existingSkills['listening'] : 0,
      skills?.listening ?? 0
    ),
  }

  // Add session to completed list (avoid duplicates)
  const completedSessions = Array.from(
    new Set([...(existing?.completedSessions ?? []), sessionId])
  )

  const updated = await upsertProgress(userId, language, {
    hoursCompleted: (existing?.hoursCompleted ?? 0) + hoursAdded,
    wordsLearned: (existing?.wordsLearned ?? 0) + wordsLearned,
    sessionsCompleted: (existing?.sessionsCompleted ?? 0) + 1,
    streakDays: newStreak,
    lastActiveAt: new Date(),
    skills: mergedSkills,
    completedSessions,
    currentSession: sessionId,
  })

  return NextResponse.json({ success: true, progress: updated })
}
