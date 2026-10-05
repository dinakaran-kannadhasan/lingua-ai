export interface SkillScores {
  reading: number
  writing: number
  speaking: number
  listening: number
}

export interface UserProgressData {
  language: string
  level: string
  hoursCompleted: number
  wordsLearned: number
  sessionsCompleted: number
  streakDays: number
  skills: SkillScores
  completedSessions: string[]
  currentUnit: number
  currentSession: string
}
