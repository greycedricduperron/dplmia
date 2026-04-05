import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load all .env vars (including non-VITE_ ones) and inject into process.env
  // so server functions can read DATABASE_URL, JWT_SECRET, etc.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  const isProduction = mode === 'production'

  return {
    plugins: [
      // Cloudflare plugin requires workerd which doesn't run on Windows.
      // Only load it for production builds.
      isProduction && cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tanstackStart({ srcDirectory: 'app' }),
      viteReact(),
    ],
    resolve: {
      alias: isProduction
        ? {}
        : {
            // In dev, alias the Cloudflare runtime module to a local polyfill
            // that reads from process.env (populated above from .dev.vars).
            // In production, @cloudflare/vite-plugin resolves this natively.
            'cloudflare:workers': resolve(
              __dirname,
              'app/server/cloudflare-workers-polyfill.ts',
            ),
          },
    },
    // Tell Rollup to keep `cloudflare:workers` as an external import in the
    // SSR/Worker bundle. The module is a built-in of the Cloudflare Workers
    // runtime and must not be bundled — it is resolved at runtime by workerd.
    ssr: {
      external: ['cloudflare:workers'],
    },
  }
})
