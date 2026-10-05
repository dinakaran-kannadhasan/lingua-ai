'use client'

import { useState, useCallback, useEffect } from 'react'
import type { SrsRating } from '@/lib/srs/scheduler'

interface VocabItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string | null
  timesCorrect: number
  timesWrong: number
}

type ReviewState = 'loading' | 'question' | 'revealed' | 'rating' | 'done' | 'empty'

interface UseVocabularyReviewReturn {
  state: ReviewState
  currentItem: VocabItem | undefined
  remaining: number
  sessionCorrect: number
  sessionTotal: number
  error: string | null
  reveal: () => void
  rate: (rating: SrsRating) => Promise<void>
}

export function useVocabularyReview(language: string): UseVocabularyReviewReturn {
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [state, setState] = useState<ReviewState>('loading')
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    setState('loading')
    try {
      const res = await fetch(`/api/vocabulary/review-due?language=${language}`)
      if (!res.ok) throw new Error('Failed to load review queue')
      const data = (await res.json()) as { items: VocabItem[] }
      setQueue(data.items)
      setCurrentIndex(0)
      setState(data.items.length === 0 ? 'empty' : 'question')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
      setState('empty')
    }
  }, [language])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQueue()
  }, [loadQueue])

  const reveal = useCallback(() => {
    if (state === 'question') setState('revealed')
  }, [state])

  const rate = useCallback(
    async (rating: SrsRating) => {
      const item = queue[currentIndex]
      if (!item) return

      setState('rating')
      try {
        await fetch('/api/vocabulary/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vocabularyId: item.id, rating }),
        })

        if (rating !== 'Again') setSessionCorrect(c => c + 1)
        setSessionTotal(t => t + 1)

        const nextIndex = currentIndex + 1
        if (nextIndex >= queue.length) {
          setState('done')
        } else {
          setCurrentIndex(nextIndex)
          setState('question')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Rating failed')
        setState('revealed')
      }
    },
    [queue, currentIndex]
  )

  return {
    state,
    currentItem: queue[currentIndex],
    remaining: Math.max(0, queue.length - currentIndex),
    sessionCorrect,
    sessionTotal,
    error,
    reveal,
    rate,
  }
}
