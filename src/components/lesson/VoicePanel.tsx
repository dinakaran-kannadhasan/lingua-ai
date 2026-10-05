'use client'

import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import type { Language } from '@/lib/curriculum/types'
import { LANGUAGES } from '@/lib/curriculum/data'

interface VoicePanelProps {
  language: Language
  lastTeacherMessage?: string
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoicePanel({
  language,
  lastTeacherMessage,
  onTranscript,
  disabled = false,
}: VoicePanelProps) {
  const langCode = LANGUAGES[language].code

  const {
    isRecording,
    transcript,
    isSupported: sttSupported,
    start,
    stop,
  } = useVoiceRecorder({ language: langCode, onTranscript })

  const {
    speak,
    stop: stopSpeech,
    isSpeaking,
    isSupported: ttsSupported,
  } = useTextToSpeech()

  function handleMicClick() {
    if (isRecording) stop()
    else start()
  }

  function handleSpeakClick() {
    if (isSpeaking) {
      stopSpeech()
    } else if (lastTeacherMessage) {
      speak(lastTeacherMessage, langCode)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* TTS — hear teacher */}
      {ttsSupported && (
        <div className="glass-card p-4">
          <p className="text-xs text-white/40 mb-3">Hear teacher</p>
          <button
            onClick={handleSpeakClick}
            disabled={disabled || !lastTeacherMessage}
            className={[
              'w-full py-2.5 rounded-xl text-sm font-medium transition-all',
              isSpeaking
                ? 'bg-[#5E5CE6] text-white shadow-[0_0_16px_rgba(94,92,230,0.4)]'
                : 'bg-white/8 text-white/60 border border-white/10 hover:text-white hover:bg-white/12',
              disabled || !lastTeacherMessage ? 'opacity-40 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
          </button>
        </div>
      )}

      {/* STT — speak to teacher */}
      <div className="glass-card p-4 flex flex-col items-center gap-4">
        <p className="text-xs text-white/40 self-start">
          Speak in {LANGUAGES[language].name}
        </p>

        {sttSupported ? (
          <>
            <button
              onClick={handleMicClick}
              disabled={disabled}
              aria-label={`Speak in ${LANGUAGES[language].name}`}
              className={[
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all',
                isRecording
                  ? 'bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'bg-[#0A84FF]/20 border-2 border-[#0A84FF]/50 hover:bg-[#0A84FF]/30 hover:border-[#0A84FF]',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isRecording ? '⏹' : '🎤'}
            </button>
            <p className="text-xs text-white/40">
              {isRecording ? 'Recording… tap to stop' : 'Tap to speak'}
            </p>

            {transcript && (
              <div className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white/70 border border-white/10">
                <p className="text-xs text-white/30 mb-1">You said:</p>
                {transcript}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-white/30 text-center">
            Voice input not supported in this browser
          </p>
        )}
      </div>
    </div>
  )
}
