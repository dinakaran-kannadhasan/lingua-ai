import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { A1_CURRICULUM, LANGUAGES } from '@/lib/curriculum/data'
import { LessonClient } from '@/components/lesson/LessonClient'
import type { Language, ActivityType } from '@/lib/curriculum/types'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const level = primaryLang.level
  const langConfig = LANGUAGES[language]

  // Find the session in the curriculum
  const matchingUnit = A1_CURRICULUM.find(u => u.sessions.some(s => s.id === sessionId))
  const matchingSession = matchingUnit?.sessions.find(s => s.id === sessionId)

  if (!matchingUnit || !matchingSession) redirect('/curriculum')

  return (
    <LessonClient
      sessionId={sessionId}
      sessionTitle={matchingSession.title}
      unitId={matchingUnit.id}
      unitTitle={matchingUnit.title}
      activities={matchingSession.activities as ActivityType[]}
      language={language}
      level={level}
      teacherName={langConfig.teacher}
      examName={langConfig.levelExams[level as 'A1'] ?? langConfig.exam}
      studentName={session.user.name ?? ''}
    />
  )
}
