import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './client'

export const lessonChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'lingua:chat',
})

export const ttsPronunciationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
  prefix: 'lingua:pronunciation',
})
