import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { LANGUAGES } from '@/lib/curriculum/data'
import { ReviewClient } from './ReviewClient'
import type { Language } from '@/lib/curriculum/types'

export const metadata = { title: 'Vocabulary Review — Lingua AI' }

export default async function ReviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const langConfig = LANGUAGES[language]

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
          {langConfig.name} · Vocabulary Review
        </p>
        <h1 className="text-2xl font-bold text-white">Flashcard Review</h1>
        <p className="text-sm text-white/50 mt-1">
          Words scheduled for today using spaced repetition.
        </p>
      </div>

      <ReviewClient language={language} languageName={langConfig.name} />
    </div>
  )
}
