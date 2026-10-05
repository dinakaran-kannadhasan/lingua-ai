'use client'

import { useShadowMode } from '@/hooks/useShadowMode'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import type { ShadowPhrase } from '@/lib/curriculum/types'

interface ShadowModeProps {
  phrases: ShadowPhrase[]
  language: string
  languageCode: string
  teacherName: string
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#30D158' : score >= 60 ? '#FF9F0A' : '#FF453A'
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center border-4"
        style={{ borderColor: color }}
      >
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-xs text-white/40">overall score</span>
    </div>
  )
}

export function ShadowMode({
  phrases,
  language,
  languageCode,
  teacherName,
}: ShadowModeProps) {
  const {
    currentIndex,
    currentPhrase,
    state,
    result,
    error,
    next,
    prev,
    startRecording,
    reset,
  } = useShadowMode({ phrases, language, languageCode })

  const { speak } = useTextToSpeech()

  const isFirst = currentIndex === 0
  const isLast = currentIndex === phrases.length - 1
  const isRecording = state === 'recording'
  const isScoring = state === 'scoring'

  function speakPhrase() {
    if (!currentPhrase) return
    speak(currentPhrase.text, languageCode)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>{teacherName} • Shadow Mode</span>
        <span>
          {currentIndex + 1} / {phrases.length}
        </span>
      </div>

      {/* Phrase card */}
      {currentPhrase && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-medium text-white leading-snug">
              {currentPhrase.text}
            </p>
            <p className="text-sm text-[#0A84FF] font-mono">[{currentPhrase.phonetic}]</p>
            <p className="text-sm text-white/50">{currentPhrase.english}</p>
          </div>

          {/* TTS button */}
          <button
            onClick={speakPhrase}
            className="btn-secondary flex items-center gap-2 self-start text-sm"
          >
            <span>🔊</span> Hear pronunciation
          </button>
        </div>
      )}

      {/* Instructions */}
      {state === 'idle' && !result && (
        <div className="text-center text-white/40 text-sm">
          Listen first, then press the microphone and repeat the phrase.
        </div>
      )}

      {/* Mic button */}
      {state !== 'result' && (
        <div className="flex justify-center">
          <button
            onClick={startRecording}
            disabled={isScoring}
            aria-label="Record your pronunciation"
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${
              isRecording
                ? 'bg-red-500/30 border-2 border-red-500 animate-pulse scale-110'
                : isScoring
                  ? 'bg-white/10 border-2 border-white/20 opacity-50 cursor-not-allowed'
                  : 'bg-[#0A84FF]/20 border-2 border-[#0A84FF]/60 hover:bg-[#0A84FF]/30 hover:scale-105'
            }`}
          >
            {isScoring ? '⏳' : isRecording ? '⏹' : '🎤'}
          </button>
        </div>
      )}

      {/* Scoring state */}
      {isScoring && (
        <p className="text-center text-sm text-white/40 animate-pulse">
          Scoring your pronunciation…
        </p>
      )}

      {/* Result */}
      {state === 'result' && result && (
        <div className="glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40 mb-1">Your result</p>
              {'fallback' in result &&
                (result as Record<string, unknown>)['fallback'] === true && (
                  <p className="text-xs text-white/30">
                    (estimated — Azure not configured)
                  </p>
                )}
            </div>
            <ScoreRing score={result.overallScore} />
          </div>

          {/* Sub-scores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Accuracy', value: result.accuracyScore },
              { label: 'Fluency', value: result.fluencyScore },
              { label: 'Complete', value: result.completenessScore },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="text-lg font-semibold text-white">{value}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>

          {/* Word breakdown */}
          {result.wordScores.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.wordScores.map((ws, i) => (
                <span
                  key={i}
                  className={`text-sm px-2 py-0.5 rounded ${
                    ws.accuracyScore >= 80
                      ? 'bg-green-500/20 text-green-400'
                      : ws.accuracyScore >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {ws.word}
                </span>
              ))}
            </div>
          )}

          {/* Feedback */}
          {result.overallScore >= 80 && (
            <p className="text-sm text-green-400">
              Excellent! Your pronunciation is very good.
            </p>
          )}
          {result.overallScore >= 60 && result.overallScore < 80 && (
            <p className="text-sm text-yellow-400">
              Good attempt! Listen again and focus on the stressed syllables.
            </p>
          )}
          {result.overallScore < 60 && (
            <p className="text-sm text-red-400">
              Keep practising — try to match the phonetic guide more closely.
            </p>
          )}

          <button onClick={reset} className="btn-secondary text-sm self-start">
            Try again
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-3 border border-red-500/20 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="btn-secondary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={next}
          disabled={isLast}
          className="btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
