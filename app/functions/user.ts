import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from 'vinxi/http'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../server/db'
import { getCloudflareEnv } from '../server/env'
import { getAuth } from '../server/auth'
import { requireAuth } from '../server/requireAuth'
import { teacherProfiles, classes } from '../server/db/schema'

export const meFn = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = getAuth()
  const request = getWebRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return null

  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const profile = await db.query.teacherProfiles.findFirst({
    where: eq(teacherProfiles.userId, session.user.id),
  })

  const cls = await db.query.classes.findFirst({
    where: eq(classes.userId, session.user.id),
  })

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    language: profile?.language ?? null,
    country: profile?.country ?? null,
    onboardingComplete: !!(profile?.language && profile?.country),
    class: cls ?? null,
  }
})

export const saveOnboardingFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      language: z.string().length(2),
      country: z.string().length(2),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { userId } = await requireAuth()
    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    await db
      .update(teacherProfiles)
      .set({ language: data.language, country: data.country })
      .where(eq(teacherProfiles.userId, userId))

    return { success: true }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const auth = getAuth()
  const request = getWebRequest()
  await auth.api.signOut({ headers: request.headers })
  return null
})
