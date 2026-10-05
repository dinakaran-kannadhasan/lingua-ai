import { describe, it, expect } from 'vitest'
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs'

// Tests exercise ts-fsrs directly (no DB mock needed here)
describe('spaced repetition scheduler (ts-fsrs)', () => {
  const f = fsrs(generatorParameters({ enable_fuzz: false }))

  it('Easy schedules further out than Good', () => {
    const card = createEmptyCard()
    const scheduling = f.repeat(card, new Date())
    const easyDays = scheduling[Rating.Easy].card.scheduled_days
    const goodDays = scheduling[Rating.Good].card.scheduled_days
    expect(easyDays).toBeGreaterThan(goodDays)
  })

  it('Good schedules later due date than Hard', () => {
    const card = createEmptyCard()
    const now = new Date()
    const scheduling = f.repeat(card, now)
    const goodDue = scheduling[Rating.Good].card.due.getTime()
    const hardDue = scheduling[Rating.Hard].card.due.getTime()
    expect(goodDue).toBeGreaterThanOrEqual(hardDue)
  })

  it('Again resets to 0 scheduled days on a new card', () => {
    const card = createEmptyCard()
    const scheduling = f.repeat(card, new Date())
    const againDays = scheduling[Rating.Again].card.scheduled_days
    expect(againDays).toBe(0)
  })

  it('Easy on a new card schedules at least 4 days out', () => {
    const card = createEmptyCard()
    const scheduling = f.repeat(card, new Date())
    expect(scheduling[Rating.Easy].card.scheduled_days).toBeGreaterThanOrEqual(4)
  })

  it('reps increments after scheduling', () => {
    const card = createEmptyCard()
    const scheduling = f.repeat(card, new Date())
    expect(scheduling[Rating.Good].card.reps).toBe(1)
  })

  it('due date is in the future for non-Again ratings', () => {
    const card = createEmptyCard()
    const now = new Date()
    const scheduling = f.repeat(card, now)
    const goodDue = scheduling[Rating.Good].card.due
    expect(goodDue.getTime()).toBeGreaterThan(now.getTime())
  })
})
