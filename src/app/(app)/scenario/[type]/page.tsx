import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { SCENARIOS, LANGUAGES } from '@/lib/curriculum/data'
import { ScenarioChat } from '@/components/lesson/ScenarioChat'
import type { Language } from '@/lib/curriculum/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const scenario = SCENARIOS.find(s => s.id === type)
  return { title: scenario ? `${scenario.name} — Lingua AI` : 'Scenario — Lingua AI' }
}

export default async function ScenarioTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params

  const scenario = SCENARIOS.find(s => s.id === type)
  if (!scenario) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const level = primaryLang.level
  const langConfig = LANGUAGES[language]

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 h-[calc(100vh-4rem)] flex flex-col gap-3">
      {/* Back link */}
      <Link
        href="/scenario"
        className="text-sm text-white/40 hover:text-white/60 flex items-center gap-1 w-fit"
      >
        ← All scenarios
      </Link>

      <div className="flex-1 min-h-0">
        <ScenarioChat
          scenario={scenario}
          language={language}
          level={level}
          languageCode={langConfig.code}
          teacherName={langConfig.teacher}
        />
      </div>
    </div>
  )
}
