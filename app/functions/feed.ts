import { createServerFn } from '@tanstack/react-start'
import { eq, or, and, inArray, desc, count } from 'drizzle-orm'
import { getDb } from '../server/db'
import { classes, classConnections, posts, comments } from '../server/db/schema'
import { getCloudflareEnv } from '../server/env'
import { requireAuth } from '../server/requireAuth'
import { CreatePostSchema, CreateCommentSchema } from '../validators'
import { z } from 'zod'

const classColumns = { id: true, name: true, country: true, language: true } as const

async function getAcceptedConnection(db: ReturnType<typeof getDb>, classId: string) {
  return db.query.classConnections.findFirst({
    where: and(
      eq(classConnections.status, 'ACCEPTED'),
      or(
        eq(classConnections.requesterId, classId),
        eq(classConnections.receiverId, classId),
      ),
    ),
  })
}

export const getFeedFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { classId } = await requireAuth()
  if (!classId) throw new Error('NO_CLASS')

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const conn = await getAcceptedConnection(db, classId)
  if (!conn) throw new Error('NO_CONNECTION')

  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      mediaType: posts.mediaType,
      mediaUrl: posts.mediaUrl,
      classId: posts.classId,
      createdAt: posts.createdAt,
      class: {
        id: classes.id,
        name: classes.name,
        country: classes.country,
        language: classes.language,
      },
      commentCount: count(comments.id),
    })
    .from(posts)
    .leftJoin(classes, eq(posts.classId, classes.id))
    .leftJoin(comments, eq(comments.postId, posts.id))
    .where(inArray(posts.classId, [classId, partnerClassId]))
    .groupBy(posts.id, classes.id, classes.name, classes.country, classes.language)
    .orderBy(desc(posts.createdAt))

  return result
})

export const getGalleryFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { classId } = await requireAuth()
  if (!classId) throw new Error('NO_CLASS')

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const conn = await getAcceptedConnection(db, classId)
  if (!conn) throw new Error('NO_CONNECTION')

  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId

  return db.query.posts.findMany({
    where: and(
      inArray(posts.classId, [classId, partnerClassId]),
      eq(posts.mediaType, 'IMAGE'),
    ),
    with: { class: { columns: classColumns } },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
})

export const getAudioFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { classId } = await requireAuth()
  if (!classId) throw new Error('NO_CLASS')

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const conn = await getAcceptedConnection(db, classId)
  if (!conn) throw new Error('NO_CONNECTION')

  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId

  return db.query.posts.findMany({
    where: and(
      inArray(posts.classId, [classId, partnerClassId]),
      eq(posts.mediaType, 'AUDIO'),
    ),
    with: { class: { columns: classColumns } },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
})

export const createTextPostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreatePostSchema.parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const [post] = await db
      .insert(posts)
      .values({ ...data, mediaType: 'TEXT', classId })
      .returning()

    return db.query.posts.findFirst({
      where: eq(posts.id, post.id),
      with: { class: { columns: classColumns } },
    })
  })

export const createMediaPostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        content: z.string().max(5000).optional(),
        mediaUrl: z.string().url(),
        mediaType: z.enum(['IMAGE', 'AUDIO']),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const [post] = await db
      .insert(posts)
      .values({ title: data.title, content: data.content, mediaType: data.mediaType, mediaUrl: data.mediaUrl, classId })
      .returning()

    return db.query.posts.findFirst({
      where: eq(posts.id, post.id),
      with: { class: { columns: classColumns } },
    })
  })

export const deletePostFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const post = await db.query.posts.findFirst({ where: eq(posts.id, data.postId) })
    if (!post) throw new Error('NOT_FOUND')
    if (post.classId !== classId) throw new Error('FORBIDDEN')

    await db.delete(posts).where(eq(posts.id, data.postId))
    return null
  })

export const getCommentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await requireAuth()
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    return db.query.comments.findMany({
      where: eq(comments.postId, data.postId),
      with: { class: { columns: classColumns } },
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    })
  })

export const addCommentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ postId: z.string().uuid(), content: z.string().min(1).max(1000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const post = await db.query.posts.findFirst({ where: eq(posts.id, data.postId) })
    if (!post) throw new Error('NOT_FOUND')

    const conn = await getAcceptedConnection(db, classId)
    if (!conn) throw new Error('NO_CONNECTION')

    const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId
    if (post.classId !== classId && post.classId !== partnerClassId) {
      throw new Error('FORBIDDEN')
    }

    const [comment] = await db
      .insert(comments)
      .values({ postId: data.postId, classId, content: data.content })
      .returning()

    return db.query.comments.findFirst({
      where: eq(comments.id, comment.id),
      with: { class: { columns: classColumns } },
    })
  })

export const deleteCommentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ commentId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, data.commentId),
    })
    if (!comment) throw new Error('NOT_FOUND')
    if (comment.classId !== classId) throw new Error('FORBIDDEN')

    await db.delete(comments).where(eq(comments.id, data.commentId))
    return null
  })
