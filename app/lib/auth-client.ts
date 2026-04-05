import { createAuthClient } from 'better-auth/react'

// createAuthClient is safe to call during SSR — it does not make network
// requests on initialization, it only sets up the client configuration.
// The baseURL is always the current origin; fallback covers SSR context.
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173',
})
