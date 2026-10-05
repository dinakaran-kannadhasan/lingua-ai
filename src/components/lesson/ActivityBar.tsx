'use client'

import type { ActivityType } from '@/lib/curriculum/types'

interface ActivityBarProps {
  activities: ActivityType[]
  currentActivity: ActivityType
  onActivityChange: (activity: ActivityType) => void
  disabled?: boolean
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  Listen: '👂',
  Phonetics: '🔤',
  Vocabulary: '📝',
  Grammar: '📖',
  Shadow: '🎤',
  Scenario: '🗺️',
  Quiz: '❓',
  Review: '🔁',
}

export function ActivityBar({
  activities,
  currentActivity,
  onActivityChange,
  disabled = false,
}: ActivityBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {activities.map((activity, i) => {
        const isActive = activity === currentActivity
        return (
          <button
            key={`${activity}-${i}`}
            onClick={() => onActivityChange(activity)}
            disabled={disabled}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'bg-[#0A84FF] text-white shadow-[0_0_16px_rgba(10,132,255,0.4)]'
                : 'bg-white/8 text-white/50 border border-white/10 hover:text-white hover:bg-white/12',
              disabled && !isActive ? 'opacity-50 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{ACTIVITY_ICONS[activity]}</span>
            {activity}
          </button>
        )
      })}
    </div>
  )
}
