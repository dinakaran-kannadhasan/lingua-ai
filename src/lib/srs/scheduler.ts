import { createEmptyCard, fsrs, generatorParameters, Rating, State } from 'ts-fsrs'
import { db } from '@/lib/db/client'

const params = generatorParameters({ enable_fuzz: true })
const f = fsrs(params)

export type SrsRating = 'Again' | 'Hard' | 'Good' | 'Easy'

const ratingMap: Record<SrsRating, Rating> = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
}

export async function scheduleReview(
  vocabularyId: string,
  rating: SrsRating,
  userId: string
) {
  const vocab = await db.vocabulary.findUnique({ where: { id: vocabularyId } })
  // Ownership check — silently ignore requests for vocabulary that doesn't belong to this user
  if (!vocab || vocab.userId !== userId) return

  const card = createEmptyCard()
  card.due = vocab.nextReviewAt
  card.stability = vocab.easeFactor
  card.difficulty = Math.max(0, Math.min(10, 1 - (vocab.easeFactor - 1.3) / 1.2))
  card.elapsed_days = vocab.intervalDays
  card.scheduled_days = vocab.intervalDays
  card.reps = vocab.timesCorrect + vocab.timesWrong
  card.lapses = vocab.timesWrong
  card.state =
    vocab.timesCorrect === 0 && vocab.timesWrong === 0 ? State.New : State.Review

  const scheduling = f.repeat(card, new Date()) as unknown as Record<
    number,
    { card: typeof card }
  >
  // ratingMap only contains valid Rating values (Again=1, Hard=2, Good=3, Easy=4) — always present
  const next = scheduling[ratingMap[rating]]!.card

  await db.vocabulary.update({
    where: { id: vocabularyId },
    data: {
      easeFactor: next.stability,
      intervalDays: next.scheduled_days,
      nextReviewAt: next.due,
      timesCorrect: rating !== 'Again' ? vocab.timesCorrect + 1 : vocab.timesCorrect,
      timesWrong: rating === 'Again' ? vocab.timesWrong + 1 : vocab.timesWrong,
    },
  })
}

export async function getReviewDue(userId: string, language: string) {
  return db.vocabulary.findMany({
    where: {
      userId,
      language,
      nextReviewAt: { lte: new Date() },
    },
    orderBy: { nextReviewAt: 'asc' },
    take: 20,
  })
}

export async function saveVocabularyItem(params: {
  userId: string
  language: string
  word: string
  phonetic: string
  meaning: string
  example?: string
}) {
  const existing = await db.vocabulary.findFirst({
    where: {
      userId: params.userId,
      language: params.language,
      word: params.word.toLowerCase(),
    },
  })
  if (existing) return existing

  return db.vocabulary.create({
    data: {
      userId: params.userId,
      language: params.language,
      word: params.word.toLowerCase(),
      phonetic: params.phonetic,
      meaning: params.meaning,
      example: params.example,
    },
  })
}
