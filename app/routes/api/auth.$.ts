import { createAPIFileRoute } from '@tanstack/react-start/api'
import { getAuth } from '../../server/auth'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: ({ request }) => getAuth().handler(request),
  POST: ({ request }) => getAuth().handler(request),
})
