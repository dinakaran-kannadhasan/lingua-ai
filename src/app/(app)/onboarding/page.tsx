'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGES, LEVEL_INFO } from '@/lib/curriculum/data'
import type { Language, CefrLevel } from '@/lib/curriculum/types'

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    selectedLang !== null && selectedLevel !== null && name.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          level: selectedLevel,
          name: name.trim(),
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Something went wrong')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Lingua AI</h1>
          <p className="text-white/50">
            Choose your language and starting level to begin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              Which language do you want to learn?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                Object.entries(LANGUAGES) as [Language, (typeof LANGUAGES)[Language]][]
              ).map(([key, lang]) => (
                <button
                  key={key}
                  type="button"
                  data-lang={key}
                  onClick={() => setSelectedLang(key)}
                  className={[
                    'glass-card p-5 text-center transition-all hover:-translate-y-0.5',
                    selectedLang === key
                      ? 'border-[#0A84FF] shadow-[0_0_20px_rgba(10,132,255,0.3)]'
                      : 'hover:border-white/20',
                  ].join(' ')}
                >
                  <div className="text-3xl mb-2">{lang.flag}</div>
                  <div className="font-semibold text-white">{lang.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{lang.native}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              What is your current level?
            </label>
            <div className="grid grid-cols-6 gap-2">
              {LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  data-level={level}
                  onClick={() => setSelectedLevel(level)}
                  className={[
                    'glass-card p-3 text-center transition-all hover:-translate-y-0.5',
                    selectedLevel === level
                      ? 'border-[#0A84FF] shadow-[0_0_16px_rgba(10,132,255,0.3)]'
                      : 'hover:border-white/20',
                  ].join(' ')}
                >
                  <div
                    className={`font-bold text-sm ${selectedLevel === level ? 'text-[#0A84FF]' : 'text-white'}`}
                  >
                    {level}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {LEVEL_INFO[level].name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label
              htmlFor="onboarding-name"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              What should the teacher call you?
            </label>
            <input
              id="onboarding-name"
              name="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name"
              className="glass-input"
              maxLength={50}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading
              ? 'Setting up your account…'
              : selectedLang
                ? `Begin ${LANGUAGES[selectedLang].name} →`
                : 'Select a language to begin'}
          </button>
        </form>
      </div>
    </div>
  )
}
