import { describe, it, expect } from 'vitest'

describe('db client', () => {
  it('exports a db instance', async () => {
    const { db } = await import('@/lib/db/client')
    expect(db).toBeDefined()
  })
})
