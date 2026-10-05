import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { LANGUAGES, SHADOW_PHRASES } from '@/lib/curriculum/data'
import { ShadowMode } from '@/components/lesson/ShadowMode'
import type { Language, CefrLevel } from '@/lib/curriculum/types'

export const metadata = { title: 'Shadow Mode — Lingua AI' }

export default async function ShadowPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const level = primaryLang.level as CefrLevel
  const langConfig = LANGUAGES[language]

  const levelPhrases = SHADOW_PHRASES[language]?.[level]
  const phrases = levelPhrases ?? SHADOW_PHRASES[language]?.A1 ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
          {langConfig.name} · {level} · Shadow Mode
        </p>
        <h1 className="text-2xl font-bold text-white">Pronunciation Practice</h1>
        <p className="text-sm text-white/50 mt-1">
          Listen to each phrase, then repeat it aloud. Your pronunciation is scored
          instantly.
        </p>
      </div>

      {phrases.length > 0 ? (
        <ShadowMode
          phrases={phrases}
          language={language}
          languageCode={langConfig.code}
          teacherName={langConfig.teacher}
        />
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-white/50">
            No shadow phrases available for your current level yet.
          </p>
        </div>
      )}
    </div>
  )
}
