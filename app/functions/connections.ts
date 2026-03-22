import { createServerFn } from '@tanstack/react-start'
import { eq, or, and } from 'drizzle-orm'
import { getDb } from '../server/db'
import { classes, classConnections } from '../server/db/schema'
import { getCloudflareEnv } from '../server/env'
import { requireAuth } from '../server/requireAuth'
import { z } from 'zod'

const classColumns = { id: true, name: true, country: true, language: true } as const
const withClasses = {
  requester: { columns: classColumns },
  receiver: { columns: classColumns },
} as const

export const sendInviteFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().min(1), country: z.string().length(2) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const target = await db.query.classes.findFirst({
      where: and(eq(classes.name, data.name), eq(classes.country, data.country)),
    })
    if (!target) throw new Error('TARGET_NOT_FOUND')
    if (target.id === classId) throw new Error('SELF_INVITE')

    const existing = await db.query.classConnections.findFirst({
      where: or(
        and(eq(classConnections.requesterId, classId), eq(classConnections.receiverId, target.id)),
        and(eq(classConnections.requesterId, target.id), eq(classConnections.receiverId, classId)),
      ),
    })
    if (existing) throw new Error('CONNECTION_EXISTS')

    const [conn] = await db
      .insert(classConnections)
      .values({ requesterId: classId, receiverId: target.id })
      .returning()

    return db.query.classConnections.findFirst({
      where: eq(classConnections.id, conn.id),
      with: withClasses,
    })
  })

export const getConnectionsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { classId } = await requireAuth()
  if (!classId) throw new Error('NO_CLASS')

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  return db.query.classConnections.findMany({
    where: or(
      eq(classConnections.requesterId, classId),
      eq(classConnections.receiverId, classId),
    ),
    with: withClasses,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
})

export const getPendingFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { classId } = await requireAuth()
  if (!classId) throw new Error('NO_CLASS')

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  return db.query.classConnections.findMany({
    where: and(
      eq(classConnections.receiverId, classId),
      eq(classConnections.status, 'PENDING'),
    ),
    with: withClasses,
  })
})

export const acceptConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ connectionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, data.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.receiverId !== classId) throw new Error('FORBIDDEN')
    if (conn.status !== 'PENDING') throw new Error('ALREADY_PROCESSED')

    const [updated] = await db
      .update(classConnections)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(classConnections.id, data.connectionId))
      .returning()

    return db.query.classConnections.findFirst({
      where: eq(classConnections.id, updated.id),
      with: withClasses,
    })
  })

export const rejectConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ connectionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, data.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.receiverId !== classId) throw new Error('FORBIDDEN')
    if (conn.status !== 'PENDING') throw new Error('ALREADY_PROCESSED')

    const [updated] = await db
      .update(classConnections)
      .set({ status: 'REJECTED', updatedAt: new Date() })
      .where(eq(classConnections.id, data.connectionId))
      .returning()

    return db.query.classConnections.findFirst({
      where: eq(classConnections.id, updated.id),
      with: withClasses,
    })
  })

export const removeConnectionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ connectionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, data.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.requesterId !== classId && conn.receiverId !== classId) {
      throw new Error('FORBIDDEN')
    }

    await db.delete(classConnections).where(eq(classConnections.id, data.connectionId))
    return null
  })
