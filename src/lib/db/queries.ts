import { db } from './client'

export async function getUserProgress(userId: string, language: string) {
  return db.progress.findUnique({
    where: { userId_language: { userId, language } },
  })
}

export async function getUserLanguages(userId: string) {
  return db.userLanguage.findMany({
    where: { userId },
    orderBy: { startedAt: 'asc' },
  })
}

export async function upsertUserLanguage(
  userId: string,
  language: string,
  level: string
) {
  return db.userLanguage.upsert({
    where: { userId_language: { userId, language } },
    update: { level },
    create: { userId, language, level },
  })
}

export async function upsertProgress(
  userId: string,
  language: string,
  data: {
    hoursCompleted?: number
    wordsLearned?: number
    sessionsCompleted?: number
    streakDays?: number
    lastActiveAt?: Date
    skills?: object
    completedSessions?: string[]
    currentUnit?: number
    currentSession?: string
  }
) {
  return db.progress.upsert({
    where: { userId_language: { userId, language } },
    update: data,
    create: { userId, language, ...data },
  })
}

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  })
}

export async function updateUserName(userId: string, name: string) {
  return db.user.update({
    where: { id: userId },
    data: { name },
  })
}

export async function saveScenarioSession(data: {
  userId: string
  language: string
  scenarioType: string
  conversation: Array<{ role: string; content: string }>
  correctionsCount: number
}) {
  return db.scenarioSession.create({
    data: {
      userId: data.userId,
      language: data.language,
      scenarioType: data.scenarioType,
      conversation: data.conversation,
      correctionsCount: data.correctionsCount,
    },
  })
}

export async function saveLessonSession(data: {
  userId: string
  language: string
  level: string
  unitId: number
  sessionId: string
  activityType: string
  conversation: Array<{ role: string; content: string }>
  durationSecs: number
}) {
  return db.lessonSession.create({
    data: {
      userId: data.userId,
      language: data.language,
      level: data.level,
      unitId: data.unitId,
      sessionId: data.sessionId,
      activityType: data.activityType,
      conversation: data.conversation,
      durationSecs: data.durationSecs,
      completedAt: new Date(),
    },
  })
}
