import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from './password'

describe('password utils', () => {
  it('hashes and verifies a password', async () => {
    const plain = 'mySecretPassword123'
    const hashed = await hashPassword(plain)
    expect(hashed).not.toBe(plain)

    const valid = await comparePassword(plain, hashed)
    expect(valid).toBe(true)
  })

  it('returns false for wrong password', async () => {
    const hashed = await hashPassword('correct')
    const valid = await comparePassword('wrong', hashed)
    expect(valid).toBe(false)
  })
})
