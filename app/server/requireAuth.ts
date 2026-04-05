import { getWebRequest } from 'vinxi/http'
import { getAuth } from './auth'
import { getDb } from './db'
import { getCloudflareEnv } from './env'
import { eq } from 'drizzle-orm'
import { classes } from './db/schema'

export interface AuthResult {
  userId: string
  classId: string | null
}

export async function requireAuth(): Promise<AuthResult> {
  const auth = getAuth()
  const request = getWebRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) throw new Error('UNAUTHORIZED')

  const userId = session.user.id
  const env = getCloudflareEnv()
  const db = getDb(env.DATABASE_URL)

  const cls = await db.query.classes.findFirst({
    where: eq(classes.userId, userId),
    columns: { id: true },
  })

  return { userId, classId: cls?.id ?? null }
}
