import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { setCloudflareEnv, type CloudflareEnv } from './server/env'

// Cloudflare Worker entry point.
// setCloudflareEnv stores the Worker bindings on globalThis so they are
// accessible from all server functions via getCloudflareEnv(), regardless
// of module boundaries or code-splitting in the bundle.
export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    if (env?.DATABASE_URL) setCloudflareEnv(env)
    try {
      return await createStartHandler(defaultStreamHandler)(request, env, ctx)
    } catch (err) {
      const msg = err instanceof Error ? err.stack ?? err.message : String(err)
      console.error('[SSR ERROR]', msg)
      return new Response(`Internal Server Error\n\n${msg}`, { status: 500 })
    }
  },
}
