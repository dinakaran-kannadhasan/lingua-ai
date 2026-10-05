import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.SpeechRecognition = vi.fn() as unknown as typeof SpeechRecognition
global.webkitSpeechRecognition = vi.fn() as unknown as typeof SpeechRecognition
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
} as unknown as SpeechSynthesis

vi.mock('@/lib/db/client', () => ({
  db: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    progress: { findUnique: vi.fn(), upsert: vi.fn() },
    vocabulary: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    lessonSession: { create: vi.fn(), update: vi.fn() },
  },
}))
