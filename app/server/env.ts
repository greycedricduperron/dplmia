export interface CloudflareEnv {
  DATABASE_URL: string
  JWT_SECRET: string
  R2_BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  NODE_ENV: string
}

let _cfEnv: CloudflareEnv | undefined

/**
 * Register Cloudflare env bindings from the Workers request context.
 * Called once per request in the server route / middleware.
 * Falls back to process.env in local dev.
 */
export function setCloudflareEnv(env: CloudflareEnv) {
  _cfEnv = env
}

export function getCloudflareEnv(): CloudflareEnv {
  if (_cfEnv) return _cfEnv

  // Local dev fallback: read from process.env (populated by Vite from .env)
  return {
    DATABASE_URL: process.env['DATABASE_URL'] ?? '',
    JWT_SECRET: process.env['JWT_SECRET'] ?? '',
    R2_BUCKET: undefined as unknown as R2Bucket,
    R2_PUBLIC_URL: process.env['R2_PUBLIC_URL'] ?? '',
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  }
}
