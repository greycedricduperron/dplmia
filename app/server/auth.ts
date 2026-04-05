import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from './db'
import { getCloudflareEnv } from './env'
import { user, session, account, verification, teacherProfiles } from './db/schema'

// Cached per Worker isolate — safe because setCloudflareEnv() is called first
// in server.tsx before any server function runs.
let _auth: ReturnType<typeof betterAuth> | null = null
let _cachedDbUrl: string | null = null

export function getAuth() {
  const env = getCloudflareEnv()
  if (_auth && _cachedDbUrl === env.DATABASE_URL) return _auth

  const db = getDb(env.DATABASE_URL)

  _auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_BASE_URL,
    basePath: '/api/auth',
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      microsoft: {
        clientId: env.MICROSOFT_CLIENT_ID,
        clientSecret: env.MICROSOFT_CLIENT_SECRET,
        tenantId: 'common',
      },
      slack: {
        clientId: env.SLACK_CLIENT_ID,
        clientSecret: env.SLACK_CLIENT_SECRET,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            // Create an empty teacher profile for every new OAuth user
            const freshDb = getDb(getCloudflareEnv().DATABASE_URL)
            await freshDb
              .insert(teacherProfiles)
              .values({ userId: newUser.id })
              .onConflictDoNothing()
          },
        },
      },
    },
  })

  _cachedDbUrl = env.DATABASE_URL
  return _auth
}
