import { createServerFn } from '@tanstack/react-start'
import { eq, and, or } from 'drizzle-orm'
import { getDb } from '../server/db'
import { classConnections, hangmanGames, hangmanGuesses } from '../server/db/schema'
import { getCloudflareEnv } from '../server/env'
import { requireAuth } from '../server/requireAuth'
import { ProposeWordSchema, GuessLetterSchema } from '../validators'
import { normalize, buildGameView } from '../lib/hangman-utils'
import { z } from 'zod'

export const proposeGameFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ProposeWordSchema.parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, data.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.status !== 'ACCEPTED') throw new Error('CONNECTION_NOT_ACCEPTED')
    if (conn.requesterId !== classId && conn.receiverId !== classId) {
      throw new Error('FORBIDDEN')
    }

    const activeGame = await db.query.hangmanGames.findFirst({
      where: and(
        eq(hangmanGames.connectionId, data.connectionId),
        eq(hangmanGames.state, 'ACTIVE'),
      ),
    })
    if (activeGame) throw new Error('ACTIVE_GAME_EXISTS')

    const [game] = await db
      .insert(hangmanGames)
      .values({
        word: data.word.toLowerCase(),
        hint: data.hint,
        language: data.language,
        connectionId: data.connectionId,
        proposerClassId: classId,
      })
      .returning()

    const fullGame = await db.query.hangmanGames.findFirst({
      where: eq(hangmanGames.id, game.id),
      with: { guesses: true },
    })
    return buildGameView(fullGame!, classId)
  })

export const listGamesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ connectionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, data.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.requesterId !== classId && conn.receiverId !== classId) {
      throw new Error('FORBIDDEN')
    }

    const games = await db.query.hangmanGames.findMany({
      where: eq(hangmanGames.connectionId, data.connectionId),
      with: { guesses: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })

    return games.map((g) => buildGameView(g, classId))
  })

export const getGameFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ gameId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const game = await db.query.hangmanGames.findFirst({
      where: eq(hangmanGames.id, data.gameId),
      with: { guesses: true },
    })
    if (!game) throw new Error('NOT_FOUND')

    const conn = await db.query.classConnections.findFirst({
      where: eq(classConnections.id, game.connectionId),
    })
    if (!conn) throw new Error('NOT_FOUND')
    if (conn.requesterId !== classId && conn.receiverId !== classId) {
      throw new Error('FORBIDDEN')
    }

    return buildGameView(game, classId)
  })

export const guessLetterFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({ gameId: z.string().uuid(), letter: z.string().length(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const game = await db.query.hangmanGames.findFirst({
      where: eq(hangmanGames.id, data.gameId),
      with: { guesses: true },
    })
    if (!game) throw new Error('NOT_FOUND')
    if (game.state !== 'ACTIVE') throw new Error('GAME_FINISHED')
    if (game.proposerClassId === classId) throw new Error('PROPOSER_CANNOT_GUESS')

    const letter = normalize(data.letter)

    const alreadyGuessed = game.guesses.some((g) => normalize(g.letter) === letter)
    if (alreadyGuessed) throw new Error('ALREADY_GUESSED')

    const normalizedWord = normalize(game.word)
    const correct = normalizedWord.includes(letter)

    await db.insert(hangmanGuesses).values({ gameId: data.gameId, classId, letter, correct })

    const allGuesses = [...game.guesses, { letter, correct, classId }]
    const guessedLetters = allGuesses.map((g) => normalize(g.letter))
    const wrongCount = allGuesses.filter((g) => !g.correct).length

    const wordLetters = [...new Set(normalizedWord.replace(/ /g, '').split(''))]
    const allRevealed = wordLetters.every((ch) => guessedLetters.includes(ch))
    const lost = wrongCount >= game.maxWrongGuesses

    if (allRevealed || lost) {
      await db
        .update(hangmanGames)
        .set({
          state: 'FINISHED',
          finishedAt: new Date(),
          winnerClassId: allRevealed ? classId : null,
        })
        .where(eq(hangmanGames.id, data.gameId))
    }

    const updated = await db.query.hangmanGames.findFirst({
      where: eq(hangmanGames.id, data.gameId),
      with: { guesses: true },
    })
    return buildGameView(updated!, classId)
  })

export const abandonGameFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ gameId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { classId } = await requireAuth()
    if (!classId) throw new Error('NO_CLASS')

    const env = getCloudflareEnv()
    const db = getDb(env.DATABASE_URL)

    const game = await db.query.hangmanGames.findFirst({
      where: eq(hangmanGames.id, data.gameId),
    })
    if (!game) throw new Error('NOT_FOUND')
    if (game.proposerClassId !== classId) throw new Error('ONLY_PROPOSER_CAN_ABANDON')
    if (game.state !== 'ACTIVE') throw new Error('GAME_FINISHED')

    await db
      .update(hangmanGames)
      .set({ state: 'FINISHED', finishedAt: new Date() })
      .where(eq(hangmanGames.id, data.gameId))

    return null
  })
