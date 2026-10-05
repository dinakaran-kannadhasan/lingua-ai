import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'

export const metadata: Metadata = {
  title: 'Dashboard — Lingua AI',
  description: "Your language learning progress, today's lesson, and skill overview.",
}
import { getUserLanguages, getUserProgress } from '@/lib/db/queries'
import { LANGUAGES, LEVEL_INFO, A1_CURRICULUM } from '@/lib/curriculum/data'
import type { Language, CefrLevel } from '@/lib/curriculum/types'
import { CefrTracker } from '@/components/progress/CefrTracker'
import { SkillBars } from '@/components/progress/SkillBars'
import type { SkillScores } from '@/types/index'

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

export default async function DashboardPage() {
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

  const allSessions = A1_CURRICULUM.flatMap(u =>
    u.sessions.map(s => ({ ...s, unitId: u.id, unitTitle: u.title }))
  )
  const currentSessionId = progress?.currentSession ?? '1.1'
  // A1_CURRICULUM always has sessions — allSessions is never empty at this point
  const todaySession = allSessions.find(s => s.id === currentSessionId) ?? allSessions[0]!

  const hoursCompleted = progress?.hoursCompleted ?? 0
  const targetHours = levelInfo.targetHours
  const hoursPercent = Math.min(100, Math.round((hoursCompleted / targetHours) * 100))

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{session.user.name ? `, ${session.user.name}` : ''}
          </h1>
          <p className="text-white/50 mt-0.5">
            {langConfig.flag} {langConfig.name} · {level} {levelInfo.name}
          </p>
        </div>
        {(progress?.streakDays ?? 0) > 0 && (
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-2xl font-bold text-[#FF9F0A]">
              🔥 {progress?.streakDays}
            </div>
            <div className="text-xs text-white/50">day streak</div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Hours completed',
            value: hoursCompleted.toFixed(1),
            sub: `of ${targetHours}h target`,
          },
          {
            label: 'Words learned',
            value: String(progress?.wordsLearned ?? 0),
            sub: 'total vocabulary',
          },
          {
            label: 'Sessions done',
            value: String(progress?.sessionsCompleted ?? 0),
            sub: 'lessons completed',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass-card p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="text-3xl font-light text-white">{stat.value}</div>
            <div className="text-sm font-medium text-white mt-1">{stat.label}</div>
            <div className="text-xs text-white/40 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's Lesson + Hour Tracker */}
      <div className="grid grid-cols-5 gap-4">
        {/* Today's Lesson */}
        <div className="col-span-3 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Today&apos;s Lesson</h2>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              Session {currentSessionId}
            </span>
          </div>
          <div>
            <p className="text-white/50 text-sm">Unit {todaySession.unitId}</p>
            <h3 className="text-xl font-semibold text-white mt-0.5">
              {todaySession.title}
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {todaySession.activities.map((activity, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/20"
              >
                {activity}
              </span>
            ))}
          </div>
          <Link
            href={`/lesson/${currentSessionId}`}
            className="btn-primary w-full py-3 text-base block text-center"
          >
            Start Lesson →
          </Link>
        </div>

        {/* Hour Tracker */}
        <div className="col-span-2 glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Progress to {level}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">{hoursCompleted.toFixed(1)}h</span>
              <span className="text-white/50">{targetHours}h</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] transition-all duration-1000"
                style={{ width: `${hoursPercent}%` }}
              />
            </div>
            <p className="text-xs text-white/40 text-center">{hoursPercent}% complete</p>
          </div>
          <SkillBars skills={skills} />
        </div>
      </div>

      {/* CEFR Tracker */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your CEFR Journey</h2>
        <CefrTracker currentLevel={level} language={language} />
      </div>

      {/* Unique Features Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            href: '/shadow',
            emoji: '🎤',
            title: 'Shadow Mode',
            desc: 'Perfect your pronunciation with native-speed audio',
          },
          {
            href: '/scenario',
            emoji: '🗺️',
            title: 'Scenario Room',
            desc: '6 real-world survival conversations',
          },
          {
            href: '/review',
            emoji: '🧠',
            title: 'Vocabulary Review',
            desc: 'Spaced repetition — never forget a word',
          },
        ].map(f => (
          <Link
            key={f.href}
            href={f.href}
            className="glass-card p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 block"
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="text-xs text-white/50 mt-1">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
