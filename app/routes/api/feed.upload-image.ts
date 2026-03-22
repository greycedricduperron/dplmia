import { createFileRoute } from '@tanstack/react-router'
import { getEvent } from 'vinxi/http'
import { verifyToken } from '../../server/auth'
import { getCookie } from 'vinxi/http'
import type { CloudflareEnv } from '../../server/env'

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export const Route = createFileRoute('/api/feed/upload-image')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const event = getEvent()
        const env = (event.context as { cloudflare: { env: CloudflareEnv } }).cloudflare.env

        const token = getCookie('token')
        if (!token) return new Response('Unauthorized', { status: 401 })

        let payload
        try {
          payload = await verifyToken(token, env.JWT_SECRET)
        } catch {
          return new Response('Unauthorized', { status: 401 })
        }
        if (!payload.classId) return new Response('No class assigned', { status: 400 })

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        if (!file) return new Response('No file provided', { status: 400 })
        if (!IMAGE_MIMES.includes(file.type)) {
          return new Response('Invalid file type', { status: 400 })
        }
        if (file.size > MAX_SIZE) return new Response('File too large (max 5MB)', { status: 400 })

        const ext = file.name.split('.').pop() ?? 'jpg'
        const key = `images/${crypto.randomUUID()}.${ext}`

        await env.R2_BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        })

        const url = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
        return Response.json({ success: true, data: { url } })
      },
    },
  },
})
