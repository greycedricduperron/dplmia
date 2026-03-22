import { createServerFn } from '@tanstack/react-start'
import { eq, and } from 'drizzle-orm'
import { getDb } from '../server/db'
import { classes } from '../server/db/schema'
import { signToken } from '../server/auth'
import { setAuthCookie } from '../server/cookies'
import { getCloudflareEnv } from '../server/env'
import { requireAuth } from '../server/requireAuth'
import { CreateClassSchema, UpdateClassSchema, SearchClassSchema } from '../validators'

export const createClassFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreateClassSchema.parse(data))
  .handler(async ({ data }) => {
    const { teacherId } = await requireAuth()
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const existing = await db.query.classes.findFirst({
      where: eq(classes.teacherId, teacherId),
    })
    if (existing) throw new Error('ALREADY_HAS_CLASS')

    const [cls] = await db
      .insert(classes)
      .values({ ...data, teacherId })
      .returning()

    // Re-issue token with classId
    const token = await signToken({ teacherId, classId: cls.id }, env.JWT_SECRET)
    setAuthCookie(token, env.NODE_ENV === 'production')

    return cls
  })

export const getMyClassFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { teacherId } = await requireAuth()
  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const cls = await db.query.classes.findFirst({
    where: eq(classes.teacherId, teacherId),
    with: {
      teacher: {
        columns: { id: true, name: true, email: true, country: true, language: true, createdAt: true },
      },
    },
  })
  if (!cls) throw new Error('NO_CLASS')
  return cls
})

export const updateClassFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateClassSchema.parse(data))
  .handler(async ({ data }) => {
    const { teacherId } = await requireAuth()
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const cls = await db.query.classes.findFirst({ where: eq(classes.teacherId, teacherId) })
    if (!cls) throw new Error('NO_CLASS')

    const [updated] = await db
      .update(classes)
      .set(data)
      .where(eq(classes.id, cls.id))
      .returning()
    return updated
  })

export const deleteClassFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { teacherId } = await requireAuth()
  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const cls = await db.query.classes.findFirst({ where: eq(classes.teacherId, teacherId) })
  if (!cls) throw new Error('NO_CLASS')

  await db.delete(classes).where(eq(classes.id, cls.id))
  return null
})

export const searchClassFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => SearchClassSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAuth()
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const cls = await db.query.classes.findFirst({
      where: and(eq(classes.name, data.name), eq(classes.country, data.country)),
      columns: { id: true, name: true, country: true, language: true },
    })
    return cls ?? null
  })
