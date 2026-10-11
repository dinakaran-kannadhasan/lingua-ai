import { createHash } from 'crypto'
import { redis } from '@/lib/redis/client'

// Neural2 voices (highest quality) per language code, female to match teacher personas
const VOICES: Record<string, { languageCode: string; name: string }> = {
  'fr-FR': { languageCode: 'fr-FR', name: 'fr-FR-Neural2-C' },
  'de-DE': { languageCode: 'de-DE', name: 'de-DE-Neural2-C' },
  'it-IT': { languageCode: 'it-IT', name: 'it-IT-Neural2-A' },
  'en-US': { languageCode: 'en-US', name: 'en-US-Neural2-F' },
}

const CACHE_TTL_SECONDS = 3600

function cacheKey(text: string, langCode: string): string {
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 20)
  return `tts:${langCode}:${hash}`
}

export async function synthesizeSpeech(text: string, langCode: string): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CLOUD_TTS_API_KEY not configured')

  const key = cacheKey(text, langCode)

  // Cache read — skip silently if Redis is not configured or unreachable
  try {
    const cached = await redis.get<string>(key)
    if (cached) return cached
  } catch {
    // continue without cache
  }

  const voice = VOICES[langCode] ?? { languageCode: langCode, name: langCode }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.85,
        },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google TTS ${response.status}: ${body}`)
  }

  const data = (await response.json()) as { audioContent: string }

  // Cache write — skip silently if Redis is not configured or unreachable
  try {
    await redis.set(key, data.audioContent, { ex: CACHE_TTL_SECONDS })
  } catch {
    // continue without caching
  }

  return data.audioContent
}
