'use client'

import type { CefrLevel, Language } from '@/lib/curriculum/types'
import { LANGUAGES, LEVEL_INFO } from '@/lib/curriculum/data'

interface CefrTrackerProps {
  currentLevel: CefrLevel
  language: Language
}

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function CefrTracker({ currentLevel, language }: CefrTrackerProps) {
  const currentIndex = LEVELS.indexOf(currentLevel)
  const langConfig = LANGUAGES[language]

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/50">
        Target exam: <span className="text-white/80 font-medium">{langConfig.exam}</span>
      </p>
      <div className="flex gap-2">
        {LEVELS.map((level, i) => {
          const isDone = i < currentIndex
          const isCurrent = i === currentIndex
          const levelInfo = LEVEL_INFO[level]

          const stateClasses = isDone
            ? 'done bg-[#0A84FF]/20 border border-[#0A84FF]/40'
            : isCurrent
              ? 'current bg-[#0A84FF]/30 border-2 border-[#0A84FF] shadow-[0_0_16px_rgba(10,132,255,0.35)]'
              : 'bg-white/5 border border-white/10 opacity-50'

          return (
            <div
              key={level}
              className={`flex-1 rounded-xl p-3 text-center transition-all ${stateClasses}`}
            >
              <div
                className={`text-sm font-bold ${
                  isCurrent
                    ? 'current text-[#0A84FF]'
                    : isDone
                      ? 'done text-[#0A84FF]/80'
                      : 'text-white/40'
                }`}
              >
                {level}
              </div>
              <div className="text-xs text-white/50 mt-0.5 hidden sm:block">
                {levelInfo.name}
              </div>
              {isDone && <div className="text-xs text-[#0A84FF]/70 mt-1">✓</div>}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-white/40 text-center">
        {LEVEL_INFO[currentLevel].targetHours} target hours to complete {currentLevel}
      </p>
    </div>
  )
}
