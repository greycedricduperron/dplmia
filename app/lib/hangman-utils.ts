export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function maskWord(word: string, guessedLetters: string[]): string {
  const normalized = normalize(word)
  return normalized
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : guessedLetters.includes(ch) ? ch : '_'))
    .join(' ')
}

export interface GuessLike {
  letter: string
  correct: boolean
}

export function buildGameView(
  game: {
    id: string
    word: string
    hint: string | null
    language: string
    state: string
    maxWrongGuesses: number
    connectionId: string
    proposerClassId: string
    winnerClassId: string | null
    createdAt: Date
    finishedAt: Date | null
    guesses: GuessLike[]
  },
  classId: string,
) {
  const isProposer = game.proposerClassId === classId
  const guessedLetters: string[] = game.guesses.map((g) => normalize(g.letter))
  const wrongCount = game.guesses.filter((g) => !g.correct).length
  const masked = maskWord(game.word, guessedLetters)

  return {
    id: game.id,
    hint: game.hint,
    language: game.language,
    state: game.state as 'ACTIVE' | 'FINISHED',
    maxWrongGuesses: game.maxWrongGuesses,
    connectionId: game.connectionId,
    proposerClassId: game.proposerClassId,
    winnerClassId: game.winnerClassId,
    createdAt: game.createdAt,
    finishedAt: game.finishedAt,
    maskedWord: masked,
    guessedLetters,
    wrongCount,
    // Only expose the real word to the proposer or when game is finished
    word: isProposer || game.state === 'FINISHED' ? game.word : undefined,
  }
}
