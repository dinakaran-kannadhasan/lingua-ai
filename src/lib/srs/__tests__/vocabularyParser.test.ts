import { describe, it, expect } from 'vitest'
import { parseVocabularyFromResponse } from '@/lib/srs/vocabularyParser'

const SAMPLE_RESPONSE = `
Here are today's vocabulary words:

**bonjour** [bon-ZHOOR] — hello / good day
Example: "Bonjour, comment allez-vous?" (Hello, how are you?)
Cultural note: Used any time before evening.

**merci** [mair-SEE] — thank you
Example: "Merci beaucoup!" (Thank you very much!)

**s'il vous plaît** [seel voo PLAY] — please (formal)

Now use one of these words in a sentence.
`

describe('parseVocabularyFromResponse', () => {
  it('extracts all vocabulary items with correct fields', () => {
    const items = parseVocabularyFromResponse(SAMPLE_RESPONSE)
    expect(items).toHaveLength(3)
  })

  it('parses word, phonetic and meaning correctly', () => {
    const items = parseVocabularyFromResponse(SAMPLE_RESPONSE)
    const bonjour = items.find(i => i.word === 'bonjour')
    expect(bonjour).toBeDefined()
    expect(bonjour?.phonetic).toBe('bon-ZHOOR')
    expect(bonjour?.meaning).toBe('hello / good day')
  })

  it('captures example sentence when present', () => {
    const items = parseVocabularyFromResponse(SAMPLE_RESPONSE)
    const bonjour = items.find(i => i.word === 'bonjour')
    expect(bonjour?.example).toContain('Bonjour')
  })

  it('sets example to undefined when not present', () => {
    const items = parseVocabularyFromResponse(SAMPLE_RESPONSE)
    const sil = items.find(i => i.word === "s'il vous plaît")
    expect(sil?.example).toBeUndefined()
  })

  it('deduplicates repeated words', () => {
    const doubleResponse = SAMPLE_RESPONSE + `\n**bonjour** [bon-ZHOOR] — hello again`
    const items = parseVocabularyFromResponse(doubleResponse)
    const bonjourItems = items.filter(i => i.word === 'bonjour')
    expect(bonjourItems).toHaveLength(1)
  })

  it('returns empty array for text with no vocabulary items', () => {
    const items = parseVocabularyFromResponse('Just some plain text without any vocab.')
    expect(items).toHaveLength(0)
  })

  it('ignores items with overly long words or meanings', () => {
    const longWord = `**${'a'.repeat(61)}** [foo-BAR] — meaning`
    const longMeaning = `**word** [foo-BAR] — ${'x'.repeat(201)}`
    expect(parseVocabularyFromResponse(longWord)).toHaveLength(0)
    expect(parseVocabularyFromResponse(longMeaning)).toHaveLength(0)
  })

  it('handles em-dash and en-dash separators', () => {
    const withEnDash = `**café** [kah-FAY] – coffee shop`
    const items = parseVocabularyFromResponse(withEnDash)
    expect(items).toHaveLength(1)
    expect(items[0]?.meaning).toBe('coffee shop')
  })
})
