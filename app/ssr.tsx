import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { setCloudflareEnv, type CloudflareEnv } from './server/env'

const handler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    setCloudflareEnv(env)
    return handler(request, env, ctx)
  },
}
