import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all .env vars (including non-VITE_ ones) and inject into process.env
  // so server functions can read DATABASE_URL, JWT_SECRET, etc.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tanstackStart({ srcDirectory: 'app' }),
      viteReact(),
    ],
  }
})
