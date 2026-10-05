import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: vi.fn(), create: vi.fn() }
  },
}))

import { buildScenarioPrompt } from '@/lib/ai/claude'
import { SCENARIOS } from '@/lib/curriculum/data'

describe('SCENARIOS data', () => {
  it('has exactly 6 scenarios', () => {
    expect(SCENARIOS).toHaveLength(6)
  })

  it('each scenario has required fields', () => {
    for (const s of SCENARIOS) {
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.description).toBeTruthy()
      expect(s.emoji).toBeTruthy()
    }
  })

  it('scenario IDs are unique', () => {
    const ids = SCENARIOS.map(s => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('includes all expected scenario IDs', () => {
    const ids = SCENARIOS.map(s => s.id)
    expect(ids).toContain('cafe')
    expect(ids).toContain('hotel')
    expect(ids).toContain('restaurant')
  })
})

describe('buildScenarioPrompt for each scenario', () => {
  it('generates valid prompts for all 6 scenarios', () => {
    for (const scenario of SCENARIOS) {
      const prompt = buildScenarioPrompt({
        language: 'French',
        level: 'A1',
        teacherName: 'Prof. Claire',
        scenarioName: scenario.name,
        scenarioDescription: scenario.description,
      })
      expect(prompt).toContain(scenario.name)
      expect(prompt).toContain('Prof. Claire')
      expect(prompt.length).toBeGreaterThan(100)
    }
  })
})
