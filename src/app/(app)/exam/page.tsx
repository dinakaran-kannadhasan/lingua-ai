import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { getUserLanguages } from '@/lib/db/queries'
import { A1_CURRICULUM, LANGUAGES } from '@/lib/curriculum/data'
import type { Language, CefrLevel } from '@/lib/curriculum/types'

export const metadata: Metadata = {
  title: 'Exam Prep — Lingua AI',
  description:
    'Prepare for your CEFR certification exam with structured practice sessions and mock tests.',
}

const EXAM_SECTIONS = [
  { id: 'listening', label: 'Listening Comprehension', icon: '👂' },
  { id: 'reading', label: 'Reading Comprehension', icon: '📖' },
  { id: 'writing', label: 'Written Production', icon: '✍️' },
  { id: 'speaking', label: 'Oral Production', icon: '🗣️' },
] as const

export default async function ExamPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const level = primaryLang.level as CefrLevel
  const langConfig = LANGUAGES[language]
  const examName = langConfig.levelExams[level]

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Exam Preparation</h1>
        <p className="text-white/50 mt-0.5">
          {langConfig.flag} {examName} · Official exam format
        </p>
      </div>

      {/* Exam overview */}
      <div className="glass-card p-6 border border-[#0A84FF]/20">
        <h2 className="text-xl font-bold text-[#0A84FF] mb-2">{examName}</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          The {examName} exam tests your ability to understand and use familiar everyday
          expressions and basic phrases in {langConfig.name}. Four skills are assessed.
        </p>
        <div className="grid grid-cols-4 gap-3 mt-5">
          {EXAM_SECTIONS.map(s => (
            <div key={s.id} className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-2xl">{s.icon}</div>
              <div className="text-xs text-white/50 mt-1.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic coverage */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Topic Coverage by Unit</h2>
        <div className="space-y-1">
          {A1_CURRICULUM.map(unit => (
            <div
              key={unit.id}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/25 flex items-center justify-center text-xs font-bold text-[#0A84FF] shrink-0 mt-0.5">
                {unit.id}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{unit.title}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {unit.sessions.length} sessions · {unit.estimatedHours}h
                </p>
              </div>
              <span className="text-xs text-white/20 shrink-0 mt-1">
                {unit.sessions.length > 0 ? `${unit.sessions.length} sessions` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Exam CTA */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Full Mock Exam</h2>
        <p className="text-sm text-white/50 mb-5 leading-relaxed">
          Simulate the real exam experience — timed, with all four sections. Complete the
          curriculum first to unlock Unit 8 mock exam sessions.
        </p>
        <Link href="/lesson/8.5" className="btn-primary px-6 py-3 text-sm inline-block">
          Start Mock Exam →
        </Link>
      </div>
    </div>
  )
}
