export interface ParsedVocabularyItem {
  word: string
  phonetic: string
  meaning: string
  example?: string
}

// Matches the CLAUDE.md teacher format:  **word** [fo-NET-ik] — English meaning
// Optionally followed by Example: "sentence." on the next line
const VOCAB_LINE_RE = /\*\*([^*]+)\*\*\s+\[([^\]]+)\]\s+[—–-]\s+(.+)/g
const EXAMPLE_LINE_RE = /Example:\s+"([^"]+)"/

export function parseVocabularyFromResponse(text: string): ParsedVocabularyItem[] {
  const items: ParsedVocabularyItem[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const matches = [...line.matchAll(VOCAB_LINE_RE)]

    for (const match of matches) {
      const word = match[1]?.trim()
      const phonetic = match[2]?.trim()
      const meaning = match[3]?.trim()

      if (!word || !phonetic || !meaning) continue
      if (word.length > 60 || meaning.length > 200) continue

      // Look ahead one or two lines for an Example:
      let example: string | undefined
      for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
        const exMatch = EXAMPLE_LINE_RE.exec(lines[j] ?? '')
        if (exMatch?.[1]) {
          example = exMatch[1].trim()
          break
        }
      }

      items.push({ word, phonetic, meaning, example })
    }
  }

  // Deduplicate by word (case-insensitive)
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.word.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
