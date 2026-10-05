'use client'

import { useVocabularyReview } from '@/hooks/useVocabularyReview'
import type { SrsRating } from '@/lib/srs/scheduler'

interface ReviewClientProps {
  language: string
  languageName: string
}

const RATING_BUTTONS: Array<{
  rating: SrsRating
  label: string
  color: string
  description: string
}> = [
  {
    rating: 'Again',
    label: 'Again',
    color: 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30',
    description: 'Forgot it',
  },
  {
    rating: 'Hard',
    label: 'Hard',
    color: 'bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30',
    description: 'Struggled',
  },
  {
    rating: 'Good',
    label: 'Good',
    color: 'bg-[#0A84FF]/20 border-[#0A84FF]/40 text-[#0A84FF] hover:bg-[#0A84FF]/30',
    description: 'Recalled ok',
  },
  {
    rating: 'Easy',
    label: 'Easy',
    color: 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30',
    description: 'Perfect',
  },
]

export function ReviewClient({ language, languageName }: ReviewClientProps) {
  const {
    state,
    currentItem,
    remaining,
    sessionCorrect,
    sessionTotal,
    error,
    reveal,
    rate,
  } = useVocabularyReview(language)

  if (state === 'loading') {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-white/40 animate-pulse">Loading your review queue…</p>
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="glass-card p-8 text-center flex flex-col gap-4">
        <div className="text-4xl">🎉</div>
        <h2 className="text-lg font-semibold text-white">All done for today!</h2>
        <p className="text-sm text-white/50">
          No {languageName} words are due for review right now. Keep up your lessons to
          add more vocabulary.
        </p>
      </div>
    )
  }

  if (state === 'done') {
    const accuracy =
      sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0
    return (
      <div className="glass-card p-8 text-center flex flex-col gap-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-lg font-semibold text-white">Session complete!</h2>
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <div className="text-2xl font-bold text-white">{sessionTotal}</div>
            <div className="text-white/40">cards reviewed</div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {accuracy}%
            </div>
            <div className="text-white/40">accuracy</div>
          </div>
        </div>
        <p className="text-sm text-white/50">
          Come back tomorrow for your next scheduled review.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3 text-sm text-white/40">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0A84FF] transition-all duration-300"
            style={{
              width:
                remaining > 0
                  ? `${(1 - remaining / (remaining + sessionTotal)) * 100}%`
                  : '100%',
            }}
          />
        </div>
        <span>{remaining} left</span>
      </div>

      {/* Flashcard */}
      {currentItem && (
        <div className="glass-card p-6 flex flex-col gap-4 min-h-[260px]">
          {/* Question side — always visible */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-white">
                {currentItem.word}
              </span>
              <span className="text-sm text-[#0A84FF] font-mono">
                [{currentItem.phonetic}]
              </span>
            </div>
            <div className="text-xs text-white/30 uppercase tracking-wider">
              Seen {currentItem.timesCorrect + currentItem.timesWrong}× ·{' '}
              {currentItem.timesCorrect} correct
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Answer side */}
          {state === 'question' ? (
            <button
              onClick={reveal}
              className="flex-1 flex items-center justify-center text-white/30 hover:text-white/50 text-sm transition-colors"
            >
              Tap to reveal meaning
            </button>
          ) : (
            <div className="flex flex-col gap-2 animate-in fade-in duration-200">
              <p className="text-white font-medium">{currentItem.meaning}</p>
              {currentItem.example && (
                <p className="text-sm text-white/50 italic">
                  &ldquo;{currentItem.example}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-3 border-red-500/20 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Rating buttons — only shown after reveal */}
      {(state === 'revealed' || state === 'rating') && (
        <div className="grid grid-cols-4 gap-2">
          {RATING_BUTTONS.map(({ rating, label, color, description }) => (
            <button
              key={rating}
              onClick={() => void rate(rating)}
              disabled={state === 'rating'}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border transition-all disabled:opacity-50 ${color}`}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs opacity-70">{description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
