import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { setCloudflareEnv, type CloudflareEnv } from './server/env'

const handler = createStartHandler(defaultStreamHandler)

// In production (Cloudflare Worker), export { fetch } with env binding setup.
// In dev mode, export the handler directly (no workerd, process.env is used).
export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    if (env?.DATABASE_URL) setCloudflareEnv(env)
    return handler(request, env, ctx)
  },
}
