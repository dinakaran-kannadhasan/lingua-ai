import { describe, it, expect } from 'vitest'
import { auth } from '@/lib/auth/config'

describe('auth config', () => {
  it('exports a valid auth instance', () => {
    expect(auth).toBeDefined()
    expect(typeof auth.handler).toBe('function')
  })
})
