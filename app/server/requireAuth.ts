import { getAuthCookie } from './cookies'
import { verifyToken, type JwtPayload } from './auth'
import { getCloudflareEnv } from './env'

export async function requireAuth(): Promise<JwtPayload> {
  const token = getAuthCookie()
  if (!token) throw new Error('UNAUTHORIZED')

  const env = getCloudflareEnv()
  try {
    return await verifyToken(token, env.JWT_SECRET)
  } catch {
    throw new Error('UNAUTHORIZED')
  }
}
