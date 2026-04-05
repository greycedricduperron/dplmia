import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

// Cloudflare Worker entry point.
// The env bindings (DATABASE_URL, JWT_SECRET, R2_BUCKET, R2_PUBLIC_URL) are
// accessed per-request via getRequestContext() from cloudflare:workers —
// no global singleton needed.
export default {
  fetch: createStartHandler(defaultStreamHandler),
}
