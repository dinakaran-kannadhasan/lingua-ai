'use client'

import Link from 'next/link'
import { useState } from 'react'
import { A1_CURRICULUM, LANGUAGES, LEVEL_INFO } from '@/lib/curriculum/data'
import type { Language } from '@/lib/curriculum/types'

interface CurriculumBrowserProps {
  language: Language
}

const ACTIVITY_COLORS: Record<string, string> = {
  Listen: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Phonetics: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Vocabulary: 'bg-green-500/15 text-green-400 border-green-500/20',
  Grammar: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Shadow: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Scenario: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Quiz: 'bg-red-500/15 text-red-400 border-red-500/20',
  Review: 'bg-white/10 text-white/60 border-white/10',
}

export function CurriculumBrowser({ language }: CurriculumBrowserProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set([1]))
  const langConfig = LANGUAGES[language]

  function toggleUnit(id: number) {
    setExpandedUnits(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalHours = A1_CURRICULUM.reduce((sum, u) => sum + u.estimatedHours, 0)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{langConfig.flag}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {langConfig.name} A1 Curriculum
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            {langConfig.levelExams.A1} · {LEVEL_INFO.A1.name} · {totalHours}h total
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {A1_CURRICULUM.map(unit => {
          const isExpanded = expandedUnits.has(unit.id)
          return (
            <div key={unit.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF]/30 flex items-center justify-center text-sm font-bold text-[#0A84FF] shrink-0">
                    {unit.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{unit.title}</h3>
                    <p className="text-sm text-white/40 mt-0.5">{unit.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-white/40">{unit.estimatedHours}h</span>
                  <span className="text-white/40 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                  {unit.sessions.map(session => (
                    <div
                      key={session.id}
                      className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="text-xs font-mono text-white/30 w-8 shrink-0">
                        {session.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{session.title}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {session.activities.map((activity, i) => (
                            <span
                              key={i}
                              className={`text-xs px-1.5 py-0.5 rounded border ${ACTIVITY_COLORS[activity] ?? ACTIVITY_COLORS.Review}`}
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-white/30 shrink-0">
                        {session.mins}m
                      </span>
                      <Link
                        href={`/lesson/${session.id}`}
                        className="text-xs text-[#0A84FF] hover:text-[#0A84FF]/70 transition-colors shrink-0"
                      >
                        Start →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
