export interface CloudflareEnv {
  DATABASE_URL: string
  BETTER_AUTH_API_KEY: string
  BETTER_AUTH_BASE_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  MICROSOFT_CLIENT_ID: string
  MICROSOFT_CLIENT_SECRET: string
  SLACK_CLIENT_ID: string
  SLACK_CLIENT_SECRET: string
  R2_BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  NODE_ENV: string
}

export function setCloudflareEnv(env: CloudflareEnv): void {
  // Destructure immediately into a plain object — the Cloudflare env may be a
  // Proxy with context-bound getters that stop working outside the fetch handler.
  ;(globalThis as Record<string, unknown>)['__cfEnv'] = {
    DATABASE_URL: env.DATABASE_URL,
    BETTER_AUTH_API_KEY: env.BETTER_AUTH_API_KEY,
    BETTER_AUTH_BASE_URL: env.BETTER_AUTH_BASE_URL,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: env.MICROSOFT_CLIENT_SECRET,
    SLACK_CLIENT_ID: env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: env.SLACK_CLIENT_SECRET,
    R2_BUCKET: env.R2_BUCKET,
    R2_PUBLIC_URL: env.R2_PUBLIC_URL,
    NODE_ENV: env.NODE_ENV,
  }
}

export function getCloudflareEnv(): CloudflareEnv {
  const stored = (globalThis as Record<string, unknown>)['__cfEnv'] as
    | CloudflareEnv
    | undefined
  if (stored) return stored

  // Local dev fallback: process.env is populated from app/.dev.vars via loadEnv
  return {
    DATABASE_URL: process.env['DATABASE_URL'] ?? '',
    BETTER_AUTH_API_KEY: process.env['BETTER_AUTH_API_KEY'] ?? '',
    BETTER_AUTH_BASE_URL: process.env['BETTER_AUTH_BASE_URL'] ?? 'http://localhost:5173',
    GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] ?? '',
    GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
    MICROSOFT_CLIENT_ID: process.env['MICROSOFT_CLIENT_ID'] ?? '',
    MICROSOFT_CLIENT_SECRET: process.env['MICROSOFT_CLIENT_SECRET'] ?? '',
    SLACK_CLIENT_ID: process.env['SLACK_CLIENT_ID'] ?? '',
    SLACK_CLIENT_SECRET: process.env['SLACK_CLIENT_SECRET'] ?? '',
    R2_BUCKET: undefined as unknown as R2Bucket,
    R2_PUBLIC_URL: process.env['R2_PUBLIC_URL'] ?? '',
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  }
}
