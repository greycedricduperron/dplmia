export interface CloudflareEnv {
  DATABASE_URL: string
  JWT_SECRET: string
  R2_BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  NODE_ENV: string
}

/**
 * Store the Cloudflare env on globalThis so it is visible across all modules
 * in the same Worker isolate, regardless of code-splitting or module boundaries.
 * Called once per request in ssr.tsx before the TanStack Start handler runs.
 */
export function setCloudflareEnv(env: CloudflareEnv): void {
  // Destructure immediately into a plain object — the Cloudflare env may be a
  // Proxy with context-bound getters that stop working outside the fetch handler.
  ;(globalThis as Record<string, unknown>)['__cfEnv'] = {
    DATABASE_URL: env.DATABASE_URL,
    JWT_SECRET: env.JWT_SECRET,
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
    JWT_SECRET: process.env['JWT_SECRET'] ?? '',
    R2_BUCKET: undefined as unknown as R2Bucket,
    R2_PUBLIC_URL: process.env['R2_PUBLIC_URL'] ?? '',
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  }
}
