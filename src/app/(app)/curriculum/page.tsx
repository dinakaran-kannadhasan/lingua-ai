import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { CurriculumBrowser } from '@/components/curriculum/CurriculumBrowser'
import type { Language } from '@/lib/curriculum/types'

export const metadata: Metadata = {
  title: 'Curriculum — Lingua AI',
  description:
    'Browse your full CEFR-aligned language curriculum. 8 units, 37 sessions per level.',
}

export default async function CurriculumPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const language = userLanguages[0]!.language as Language

  return <CurriculumBrowser language={language} />
}
