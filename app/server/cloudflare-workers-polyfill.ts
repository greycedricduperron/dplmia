/**
 * Local dev polyfill for `cloudflare:workers`.
 * In production, Vite resolves this to the real Cloudflare runtime module.
 * In dev, this file is aliased in via vite.config.ts so that
 * `getRequestContext().env` falls back to process.env.
 */
export function getRequestContext() {
  return {
    env: {
      DATABASE_URL: process.env['DATABASE_URL'] ?? '',
      JWT_SECRET: process.env['JWT_SECRET'] ?? '',
      R2_PUBLIC_URL: process.env['R2_PUBLIC_URL'] ?? '',
      NODE_ENV: process.env['NODE_ENV'] ?? 'development',
      R2_BUCKET: undefined,
    },
  }
}
