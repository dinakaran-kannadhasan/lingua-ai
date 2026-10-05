import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { getUserLanguages, getUserProgress } from '@/lib/db/queries'
import { LANGUAGES, LEVEL_INFO } from '@/lib/curriculum/data'
import type { Language, CefrLevel } from '@/lib/curriculum/types'
import { CefrTracker } from '@/components/progress/CefrTracker'
import { SkillBars } from '@/components/progress/SkillBars'
import type { SkillScores } from '@/types/index'

export const metadata: Metadata = {
  title: 'Progress — Lingua AI',
  description:
    'Track your CEFR level, skill scores, and study hours across reading, writing, speaking, and listening.',
}

function parseSkills(raw: unknown): SkillScores {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const s = raw as Record<string, unknown>
    return {
      reading: typeof s['reading'] === 'number' ? s['reading'] : 0,
      writing: typeof s['writing'] === 'number' ? s['writing'] : 0,
      speaking: typeof s['speaking'] === 'number' ? s['speaking'] : 0,
      listening: typeof s['listening'] === 'number' ? s['listening'] : 0,
    }
  }
  return { reading: 0, writing: 0, speaking: 0, listening: 0 }
}

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const userLanguages = await getUserLanguages(session.user.id)
  if (userLanguages.length === 0) redirect('/onboarding')

  const primaryLang = userLanguages[0]!
  const language = primaryLang.language as Language
  const level = primaryLang.level as CefrLevel
  const langConfig = LANGUAGES[language]
  const levelInfo = LEVEL_INFO[level]

  const progress = await getUserProgress(session.user.id, language)
  const skills = parseSkills(progress?.skills)
  const hoursCompleted = progress?.hoursCompleted ?? 0
  const targetHours = levelInfo.targetHours
  const hoursPercent = Math.min(100, Math.round((hoursCompleted / targetHours) * 100))

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Progress</h1>
        <p className="text-white/50 mt-0.5">
          {langConfig.flag} {langConfig.name} · {level} {levelInfo.name}
        </p>
      </div>

      {/* CEFR Journey */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-5">CEFR Journey</h2>
        <CefrTracker currentLevel={level} language={language} />
      </div>

      {/* Hours Progress */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Hours to {level} Completion
          </h2>
          <span className="text-2xl font-light text-white">
            {hoursCompleted.toFixed(1)}
            <span className="text-sm text-white/40">/{targetHours}h</span>
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6]"
            style={{ width: `${hoursPercent}%` }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          {hoursPercent}% complete · {(targetHours - hoursCompleted).toFixed(1)}h
          remaining
        </p>
      </div>

      {/* Skill Breakdown */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Skill Breakdown</h2>
        <SkillBars skills={skills} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Words Learned', value: progress?.wordsLearned ?? 0, icon: '📝' },
          {
            label: 'Sessions Completed',
            value: progress?.sessionsCompleted ?? 0,
            icon: '✅',
          },
          { label: 'Day Streak', value: progress?.streakDays ?? 0, icon: '🔥' },
          { label: 'Current Unit', value: progress?.currentUnit ?? 1, icon: '📚' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/50 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Exam Target */}
      <div className="glass-card p-6 border border-[#0A84FF]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Target Exam</h2>
            <p className="text-2xl font-bold text-[#0A84FF] mt-1">
              {langConfig.levelExams[level]}
            </p>
            <p className="text-sm text-white/40 mt-1">
              Official {langConfig.exam} certification
            </p>
          </div>
          <Link href="/exam" className="btn-primary px-5 py-2.5 text-sm">
            Exam Prep →
          </Link>
        </div>
      </div>
    </div>
  )
}
