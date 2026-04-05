import { getRequestContext } from 'cloudflare:workers'

export interface CloudflareEnv {
  DATABASE_URL: string
  JWT_SECRET: string
  R2_BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  NODE_ENV: string
}

/**
 * Returns the Cloudflare environment bindings for the current request.
 *
 * In production (Cloudflare Workers), `getRequestContext()` provides the env
 * object injected by the Workers runtime — including secrets set via wrangler.
 *
 * In local dev, vite.config.ts aliases `cloudflare:workers` to a polyfill
 * that reads from process.env (populated from app/.dev.vars).
 */
export function getCloudflareEnv(): CloudflareEnv {
  return getRequestContext().env as CloudflareEnv
}
