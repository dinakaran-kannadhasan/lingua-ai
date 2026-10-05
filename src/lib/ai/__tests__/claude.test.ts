import { describe, it, expect, vi } from 'vitest'

// Prevent Anthropic SDK from throwing in jsdom environment
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: vi.fn(), create: vi.fn() }
  },
}))

import { buildSystemPrompt, buildScenarioPrompt } from '@/lib/ai/claude'

describe('buildSystemPrompt', () => {
  it('uses English instructions for A1 level', () => {
    const prompt = buildSystemPrompt({
      language: 'french',
      level: 'A1',
      teacherName: 'Prof. Claire',
      studentName: 'Alex',
      examName: 'DELF A1',
      unitTitle: 'Greetings',
      sessionTitle: 'Formal Greetings',
      activityType: 'Vocabulary',
    })
    expect(prompt).toContain('Explain everything in English')
    expect(prompt).toContain('DELF A1')
    expect(prompt).toContain('Prof. Claire')
    expect(prompt).toContain('Alex')
  })

  it('uses target language instruction for C1 level', () => {
    const prompt = buildSystemPrompt({
      language: 'french',
      level: 'C1',
      teacherName: 'Prof. Claire',
      studentName: 'Alex',
      examName: 'DALF C1',
      unitTitle: 'Academic',
      sessionTitle: 'Discourse',
      activityType: 'Grammar',
    })
    expect(prompt).toContain('Teach entirely in the target language')
  })

  it('includes Shadow activity instructions', () => {
    const prompt = buildSystemPrompt({
      language: 'german',
      level: 'A2',
      teacherName: 'Frau Schmidt',
      studentName: 'Alex',
      examName: 'Goethe A2',
      unitTitle: 'Travel',
      sessionTitle: 'Directions',
      activityType: 'Shadow',
    })
    expect(prompt).toContain('shadow practice')
    expect(prompt).toContain('microphone')
  })

  it('includes Scenario activity instructions', () => {
    const prompt = buildSystemPrompt({
      language: 'italian',
      level: 'B1',
      teacherName: 'Signora Rossi',
      studentName: 'Test',
      examName: 'CILS B1',
      unitTitle: 'Travel',
      sessionTitle: 'At the Restaurant',
      activityType: 'Scenario',
    })
    expect(prompt).toContain('conversation scenario')
    expect(prompt).toContain('Almost!')
  })

  it('includes Quiz activity instructions', () => {
    const prompt = buildSystemPrompt({
      language: 'french',
      level: 'A1',
      teacherName: 'Prof. Claire',
      studentName: 'Test',
      examName: 'DELF A1',
      unitTitle: 'Unit 1',
      sessionTitle: 'Lesson 1',
      activityType: 'Quiz',
    })
    expect(prompt).toContain('multiple-choice')
  })

  it('falls back to Vocabulary instructions for unknown activity', () => {
    const prompt = buildSystemPrompt({
      language: 'french',
      level: 'A1',
      teacherName: 'Prof. Claire',
      studentName: 'Test',
      examName: 'DELF A1',
      unitTitle: 'Unit 1',
      sessionTitle: 'Lesson 1',
      activityType: 'UnknownActivity',
    })
    expect(prompt).toContain('vocabulary items')
  })

  it('snapshot — system prompt structure does not regress', () => {
    const prompt = buildSystemPrompt({
      language: 'italian',
      level: 'B1',
      teacherName: 'Signora Rossi',
      studentName: 'Test',
      examName: 'CILS B1',
      unitTitle: 'Work',
      sessionTitle: 'Job Interview',
      activityType: 'Vocabulary',
    })
    expect(prompt).toMatchSnapshot()
  })
})

describe('buildScenarioPrompt', () => {
  it('includes the scenario name and description', () => {
    const prompt = buildScenarioPrompt({
      language: 'French',
      level: 'A1',
      teacherName: 'Prof. Claire',
      scenarioName: 'At a Café',
      scenarioDescription: 'Order drinks and food from a barista',
    })
    expect(prompt).toContain('At a Café')
    expect(prompt).toContain('Order drinks and food')
    expect(prompt).toContain('Prof. Claire')
  })

  it('includes the correction format', () => {
    const prompt = buildScenarioPrompt({
      language: 'German',
      level: 'A2',
      teacherName: 'Frau Schmidt',
      scenarioName: 'Train Station',
      scenarioDescription: 'Buy a ticket',
    })
    expect(prompt).toContain('Correction:')
    expect(prompt).toContain('correct form')
  })
})
