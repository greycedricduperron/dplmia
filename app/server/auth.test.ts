import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from './auth'

const SECRET = 'test-secret-at-least-32-characters-long'

describe('JWT auth utils', () => {
  it('signs and verifies a token with classId', async () => {
    const payload = { teacherId: 'teacher-1', classId: 'class-1' }
    const token = await signToken(payload, SECRET)
    expect(typeof token).toBe('string')

    const decoded = await verifyToken(token, SECRET)
    expect(decoded.teacherId).toBe('teacher-1')
    expect(decoded.classId).toBe('class-1')
  })

  it('signs and verifies a token with null classId', async () => {
    const payload = { teacherId: 'teacher-2', classId: null }
    const token = await signToken(payload, SECRET)
    const decoded = await verifyToken(token, SECRET)
    expect(decoded.classId).toBeNull()
  })

  it('throws on invalid token', async () => {
    await expect(verifyToken('invalid.token.here', SECRET)).rejects.toThrow()
  })

  it('throws on wrong secret', async () => {
    const token = await signToken({ teacherId: 'x', classId: null }, SECRET)
    await expect(verifyToken(token, 'wrong-secret')).rejects.toThrow()
  })
})
