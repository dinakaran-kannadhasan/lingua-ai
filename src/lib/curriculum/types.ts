export type ActivityType =
  | 'Listen'
  | 'Phonetics'
  | 'Vocabulary'
  | 'Grammar'
  | 'Shadow'
  | 'Scenario'
  | 'Quiz'
  | 'Review'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type Language = 'french' | 'german' | 'italian'

export interface CurriculumSession {
  id: string
  title: string
  mins: number
  activities: ActivityType[]
}

export interface CurriculumUnit {
  id: number
  title: string
  description: string
  estimatedHours: number
  sessions: CurriculumSession[]
}

export interface LanguageConfig {
  name: string
  native: string
  flag: string
  code: string
  teacher: string
  exam: string
  levelExams: Record<CefrLevel, string>
}

export interface LevelInfo {
  name: string
  targetHours: number
}

export interface ShadowPhrase {
  text: string
  phonetic: string
  english: string
}

export interface ScenarioConfig {
  id: string
  emoji: string
  name: string
  description: string
}
