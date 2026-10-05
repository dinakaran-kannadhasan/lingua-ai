import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShadowMode } from '@/hooks/useShadowMode'
import type { ShadowPhrase } from '@/lib/curriculum/types'

const PHRASES: ShadowPhrase[] = [
  { text: 'Bonjour', phonetic: 'bon-ZHOOR', english: 'Hello' },
  { text: 'Merci', phonetic: 'mair-SEE', english: 'Thank you' },
  { text: 'Au revoir', phonetic: 'oh ruh-VWAHR', english: 'Goodbye' },
]

describe('useShadowMode', () => {
  let hook: ReturnType<typeof renderHook<ReturnType<typeof useShadowMode>, unknown>>

  beforeEach(() => {
    hook = renderHook(() =>
      useShadowMode({ phrases: PHRASES, language: 'french', languageCode: 'fr-FR' })
    )
  })

  it('initialises at index 0 with idle state', () => {
    const { currentIndex, state, result } = hook.result.current
    expect(currentIndex).toBe(0)
    expect(state).toBe('idle')
    expect(result).toBeNull()
  })

  it('shows the first phrase', () => {
    expect(hook.result.current.currentPhrase).toEqual(PHRASES[0])
  })

  it('advances to next phrase', () => {
    act(() => hook.result.current.next())
    expect(hook.result.current.currentIndex).toBe(1)
    expect(hook.result.current.currentPhrase).toEqual(PHRASES[1])
  })

  it('does not go past the last phrase', () => {
    act(() => hook.result.current.next())
    act(() => hook.result.current.next())
    act(() => hook.result.current.next()) // one past the end
    expect(hook.result.current.currentIndex).toBe(PHRASES.length - 1)
  })

  it('goes back to previous phrase', () => {
    act(() => hook.result.current.next())
    act(() => hook.result.current.prev())
    expect(hook.result.current.currentIndex).toBe(0)
  })

  it('does not go before index 0', () => {
    act(() => hook.result.current.prev())
    expect(hook.result.current.currentIndex).toBe(0)
  })

  it('resets result and error on next/prev', () => {
    act(() => hook.result.current.next())
    const { result: scoreResult } = hook.result.current
    expect(scoreResult).toBeNull()
    expect(hook.result.current.error).toBeNull()
  })

  it('reset() clears result and returns to idle', () => {
    act(() => hook.result.current.reset())
    expect(hook.result.current.state).toBe('idle')
    expect(hook.result.current.result).toBeNull()
  })
})
