'use client'

import type { SkillScores } from '@/types/index'

interface SkillBarsProps {
  skills: SkillScores
}

const SKILL_CONFIG: { key: keyof SkillScores; label: string; icon: string }[] = [
  { key: 'reading', label: 'Reading', icon: '📖' },
  { key: 'writing', label: 'Writing', icon: '✍️' },
  { key: 'speaking', label: 'Speaking', icon: '🗣️' },
  { key: 'listening', label: 'Listening', icon: '👂' },
]

export function SkillBars({ skills }: SkillBarsProps) {
  return (
    <div className="space-y-3">
      {SKILL_CONFIG.map(({ key, label, icon }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70 flex items-center gap-1.5">
              <span>{icon}</span>
              {label}
            </span>
            <span className="text-sm font-semibold text-white">{skills[key]}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={skills[key]}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            className="h-2 rounded-full bg-white/10 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] transition-all duration-700"
              style={{ width: `${skills[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
