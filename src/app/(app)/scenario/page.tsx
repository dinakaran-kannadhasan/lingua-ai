import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { SCENARIOS, LANGUAGES } from '@/lib/curriculum/data'
import type { Language } from '@/lib/curriculum/types'

export const metadata = { title: 'Scenario Room — Lingua AI' }

export default async function ScenarioPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const langConfig = LANGUAGES[language]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
          {langConfig.name} · Scenario Room
        </p>
        <h1 className="text-2xl font-bold text-white">Real-World Conversations</h1>
        <p className="text-sm text-white/50 mt-1">
          Practice survival conversations. {langConfig.teacher} plays the native speaker —
          you play yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCENARIOS.map(scenario => (
          <Link
            key={scenario.id}
            href={`/scenario/${scenario.id}`}
            data-scenario={scenario.id}
            className="glass-card p-5 flex items-start gap-4 hover:border-[#0A84FF]/40 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <span className="text-3xl">{scenario.emoji}</span>
            <div>
              <h2 className="font-semibold text-white group-hover:text-[#0A84FF] transition-colors">
                {scenario.name}
              </h2>
              <p className="text-sm text-white/50 mt-0.5">{scenario.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
