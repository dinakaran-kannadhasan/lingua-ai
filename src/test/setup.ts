import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Web Speech API not available in jsdom
Object.defineProperty(window, 'SpeechRecognition', { value: vi.fn(), writable: true })
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn(),
  writable: true,
})
Object.defineProperty(window, 'speechSynthesis', {
  value: { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => []) },
  writable: true,
})

vi.mock('@/lib/db/client', () => ({
  db: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    progress: { findUnique: vi.fn(), upsert: vi.fn() },
    vocabulary: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    lessonSession: { create: vi.fn(), update: vi.fn() },
  },
}))
