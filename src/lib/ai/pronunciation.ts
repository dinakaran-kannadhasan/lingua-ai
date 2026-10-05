import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export interface PronunciationResult {
  overallScore: number
  accuracyScore: number
  fluencyScore: number
  completenessScore: number
  wordScores: WordScore[]
}

export interface WordScore {
  word: string
  accuracyScore: number
  errorType: string
}

const LANGUAGE_MAP: Record<string, string> = {
  french: 'fr-FR',
  german: 'de-DE',
  italian: 'it-IT',
}

export async function assessPronunciation(params: {
  audioBase64: string
  referenceText: string
  language: string
}): Promise<PronunciationResult> {
  const { audioBase64, referenceText, language } = params

  const speechKey = process.env.AZURE_SPEECH_KEY
  const speechRegion = process.env.AZURE_SPEECH_REGION ?? 'eastus'

  if (!speechKey) throw new Error('AZURE_SPEECH_KEY not configured')

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
  speechConfig.speechRecognitionLanguage = LANGUAGE_MAP[language] ?? 'fr-FR'

  const audioBuffer = Buffer.from(audioBase64, 'base64')
  const pushStream = sdk.AudioInputStream.createPushStream()
  pushStream.write(
    audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer
  )
  pushStream.close()

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    true
  )

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
  pronunciationConfig.applyTo(recognizer)

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(result => {
      recognizer.close()

      if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
        reject(new Error(`Recognition failed: ${sdk.ResultReason[result.reason]}`))
        return
      }

      const assessment = sdk.PronunciationAssessmentResult.fromResult(result)
      const wordScores: WordScore[] = []

      const details = assessment as unknown as {
        detailResult?: {
          Words?: Array<{
            Word: string
            PronunciationAssessment: { AccuracyScore: number; ErrorType: string }
          }>
        }
      }
      if (details.detailResult?.Words) {
        for (const w of details.detailResult.Words) {
          wordScores.push({
            word: w.Word,
            accuracyScore: w.PronunciationAssessment.AccuracyScore,
            errorType: w.PronunciationAssessment.ErrorType,
          })
        }
      }

      resolve({
        overallScore: assessment.pronunciationScore,
        accuracyScore: assessment.accuracyScore,
        fluencyScore: assessment.fluencyScore,
        completenessScore: assessment.completenessScore,
        wordScores,
      })
    }, reject)
  })
}
