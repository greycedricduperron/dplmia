# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DiplomIA** is a full-stack educational platform for international school exchanges. Teachers create classes, connect with other classes worldwide, share multimedia content (text/image/audio), and play collaborative games (Hangman). Multilingual support (French default, English, Spanish) is core to the product.

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (Vinxi) + TanStack Router |
| Database ORM | Drizzle ORM |
| Database | Neon PostgreSQL (HTTP driver via `@neondatabase/serverless`) |
| File storage | Cloudflare R2 (Worker binding `R2_BUCKET`) |
| Auth | JWT (`jose`) in HTTP-only cookies + bcryptjs |
| i18n | i18next (fr/en/es) |
| Testing | Vitest |
| Deploy | Cloudflare Pages (`cloudflare-pages` preset) |

## Commands

```bash
npm install          # Install all deps
npm run dev          # Vinxi dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations from schema
npm run db:migrate   # Apply migrations to Neon DB
npm run db:studio    # Open Drizzle Studio GUI
npm run test         # Run Vitest tests
npm run test:watch   # Vitest in watch mode
```

## Project Structure

```
app/
├── routes/
│   ├── __root.tsx              # Root layout with AuthProvider
│   ├── index.tsx               # Redirect → /feed
│   ├── login.tsx / register.tsx
│   ├── _auth.tsx               # Protected pathless layout (Navbar + auth check)
│   ├── _auth.{feed,class,connections,gallery,audio,hangman}.tsx
│   └── api/
│       ├── feed.upload-image.ts   # Multipart → R2 (image)
│       └── feed.upload-audio.ts   # Multipart → R2 (audio)
├── server/
│   ├── db/
│   │   ├── schema.ts           # Drizzle tables + relations
│   │   └── index.ts            # getDb(DATABASE_URL) factory
│   ├── auth.ts                 # jose signToken/verifyToken
│   ├── password.ts             # bcryptjs hash/compare
│   ├── cookies.ts              # vinxi/http cookie helpers
│   ├── requireAuth.ts          # Auth guard (replaces Express middleware)
│   ├── env.ts                  # getCloudflareEnv() accessor
│   └── r2.ts                   # R2 bucket helpers
├── functions/                  # createServerFn grouped by domain
│   ├── auth.ts                 # registerFn, loginFn, logoutFn, meFn
│   ├── class.ts                # createClassFn, getMyClassFn, ...
│   ├── connections.ts          # sendInviteFn, getConnectionsFn, ...
│   ├── feed.ts                 # getFeedFn, createTextPostFn, ...
│   └── hangman.ts              # proposeGameFn, guessLetterFn, ...
├── lib/
│   └── hangman-utils.ts        # normalize, maskWord, buildGameView (pure, testable)
├── validators/                 # Zod schemas (auth, class, post, hangman)
├── types/                      # TypeScript interfaces (Teacher, Class, Post, etc.)
├── components/
│   ├── common/                 # Navbar, AudioPlayer, LanguageSwitcher
│   └── hangman/                # HangmanDrawing
├── context/
│   └── AuthContext.tsx         # Global auth state (calls meFn on mount)
├── i18n/
│   ├── index.ts                # i18next init (browser language detection)
│   └── locales/{fr,en,es}/translation.json
├── client.tsx                  # Client entry point
├── ssr.tsx                     # SSR entry point
├── router.tsx                  # Router factory
└── styles.css
```

## Architecture

### Request Flow

```
Browser
  └─ TanStack Router (client-side)
       ├─ _auth.tsx: checks AuthContext → redirect to /login if unauthenticated
       └─ Page components call createServerFn directly (no HTTP round-trip)
            ├─ requireAuth() → reads JWT cookie → verifyToken() with jose
            ├─ getCloudflareEnv() → event.context.cloudflare.env
            └─ getDb(DATABASE_URL) → Neon HTTP driver → PostgreSQL
```

### Server Functions vs API Routes

- **`createServerFn`** (in `app/functions/`) — all data operations (auth, CRUD). Called directly from components.
- **`createAPIFileRoute`** (in `app/routes/api/`) — file uploads only, because multipart FormData can't go through server functions. The upload flow is 2 steps: POST file → get R2 URL → call `createMediaPostFn({ mediaUrl })`.

### Auth Pattern

Every protected server function starts with:
```ts
const { teacherId, classId } = await requireAuth()
```
`requireAuth()` reads the `token` cookie, verifies it with `jose` using `JWT_SECRET` from Cloudflare env, and returns the JWT payload.

After `createClassFn`, the JWT is re-issued with the new `classId` and the cookie is updated.

### Drizzle Important Notes

- **No `@updatedAt`**: Drizzle doesn't auto-update `updatedAt`. Always include `updatedAt: new Date()` manually in every `.update()` on `classConnections`.
- **`getDb()` is not a singleton**: `DATABASE_URL` comes from Cloudflare env per-request context. Never create a module-level db instance.
- **Relational queries**: Use `db.query.table.findFirst({ with: { ... } })` syntax — requires the `relations` exports in `schema.ts`.

### R2 File Storage

R2 is accessed via the `R2_BUCKET` binding in Cloudflare env (not HTTP). The public URL is constructed using `R2_PUBLIC_URL` env var. Old posts with `/uploads/` URLs from the previous Express server will 404 — this is an accepted breaking change.

## Environment Variables

**Local dev** — copy `app/.dev.vars.example` to `app/.dev.vars`:
```
DATABASE_URL=postgresql://...     # Neon HTTP connection string
JWT_SECRET=min-32-chars           # For HMAC-SHA256
R2_PUBLIC_URL=https://....r2.dev  # Public base URL for uploaded files
```

**Production** — set as Cloudflare Pages secrets:
```bash
wrangler pages secret put DATABASE_URL
wrangler pages secret put JWT_SECRET
wrangler pages secret put R2_PUBLIC_URL
```

`NODE_ENV=production` is set in `wrangler.toml` `[vars]`. `nodejs_compat` flag is required for `bcryptjs`.

## First-Time Setup

After the existing monorepo packages (`server/`, `client/`, `shared/`) are removed:

1. `npm install`
2. Copy `app/.dev.vars.example` → `app/.dev.vars` and fill in values
3. `npm run db:generate` — generates SQL migrations from `app/server/db/schema.ts`
4. `npm run db:migrate` — applies migrations to Neon DB
5. `npm run dev` — starts Vinxi dev server (note: first run auto-generates `app/routeTree.gen.ts`)
6. `npm run test` — run Vitest tests

## Tested with Vitest

- `app/server/auth.test.ts` — JWT sign/verify (jose works in Node.js)
- `app/server/password.test.ts` — bcrypt hash/compare round-trips
- `app/lib/hangman-utils.test.ts` — normalize, maskWord, buildGameView (pure functions)
