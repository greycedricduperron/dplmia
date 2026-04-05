import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '../server/db'
import { teachers } from '../server/db/schema'
import { hashPassword, comparePassword } from '../server/password'
import { signToken } from '../server/auth'
import { setAuthCookie, clearAuthCookie } from '../server/cookies'
import { getCloudflareEnv } from '../server/env'
import { requireAuth } from '../server/requireAuth'
import { RegisterSchema, LoginSchema } from '../validators'

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => RegisterSchema.parse(data))
  .handler(async ({ data }) => {
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const existing = await db.query.teachers.findFirst({
      where: eq(teachers.email, data.email),
    })
    if (existing) throw new Error('EMAIL_TAKEN')

    const passwordHash = await hashPassword(data.password)
    let teacher: typeof teachers.$inferSelect
    try {
      ;[teacher] = await db
        .insert(teachers)
        .values({
          name: data.name,
          email: data.email,
          passwordHash,
          language: data.language,
          country: data.country,
        })
        .returning()
    } catch (e: unknown) {
      const cause = (e as { cause?: { message?: string } })?.cause
      throw new Error(`DB_ERROR: ${(e as Error).message} | cause: ${cause?.message ?? 'none'}`)
    }

    const token = await signToken({ teacherId: teacher.id, classId: null }, env.JWT_SECRET)
    setAuthCookie(token, env.NODE_ENV === 'production')

    const { passwordHash: _, ...safe } = teacher
    return { ...safe, class: null }
  })

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => LoginSchema.parse(data))
  .handler(async ({ data }) => {
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const teacher = await db.query.teachers.findFirst({
      where: eq(teachers.email, data.email),
      with: { class: true },
    })
    if (!teacher) throw new Error('INVALID_CREDENTIALS')

    const valid = await comparePassword(data.password, teacher.passwordHash)
    if (!valid) throw new Error('INVALID_CREDENTIALS')

    const token = await signToken(
      { teacherId: teacher.id, classId: teacher.class?.id ?? null },
      env.JWT_SECRET,
    )
    setAuthCookie(token, env.NODE_ENV === 'production')

    const { passwordHash: _, ...safe } = teacher
    return safe
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  clearAuthCookie()
  return null
})

export const meFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { teacherId } = await requireAuth()
  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const teacher = await db.query.teachers.findFirst({
    where: eq(teachers.id, teacherId),
    with: { class: true },
  })
  if (!teacher) throw new Error('NOT_FOUND')

  const { passwordHash: _, ...safe } = teacher
  return safe
})
