import { describe, it, expect } from 'vitest'
import { normalize, maskWord, buildGameView } from './hangman-utils'

describe('normalize', () => {
  it('lowercases and strips accents', () => {
    expect(normalize('Éléphant')).toBe('elephant')
    expect(normalize('CAFÉ')).toBe('cafe')
    expect(normalize('naïve')).toBe('naive')
  })
})

describe('maskWord', () => {
  it('masks unguessed letters with _', () => {
    expect(maskWord('chat', [])).toBe('_ _ _ _')
    expect(maskWord('chat', ['c', 'a'])).toBe('c a _ _')
  })

  it('preserves spaces', () => {
    expect(maskWord('bon jour', ['b', 'o', 'n'])).toBe('b o n   j o _ _')
  })

  it('reveals fully guessed word', () => {
    expect(maskWord('cat', ['c', 'a', 't'])).toBe('c a t')
  })
})

describe('buildGameView', () => {
  const baseGame = {
    id: 'game-1',
    word: 'bonjour',
    hint: null,
    language: 'fr',
    state: 'ACTIVE',
    maxWrongGuesses: 6,
    connectionId: 'conn-1',
    proposerClassId: 'class-a',
    winnerClassId: null,
    createdAt: new Date(),
    finishedAt: null,
    guesses: [],
  }

  it('hides word from non-proposer in active game', () => {
    const view = buildGameView(baseGame, 'class-b')
    expect(view.word).toBeUndefined()
  })

  it('shows word to proposer', () => {
    const view = buildGameView(baseGame, 'class-a')
    expect(view.word).toBe('bonjour')
  })

  it('shows word to everyone when finished', () => {
    const view = buildGameView({ ...baseGame, state: 'FINISHED' }, 'class-b')
    expect(view.word).toBe('bonjour')
  })

  it('counts wrong guesses correctly', () => {
    const game = {
      ...baseGame,
      guesses: [
        { letter: 'z', correct: false },
        { letter: 'x', correct: false },
        { letter: 'b', correct: true },
      ],
    }
    const view = buildGameView(game, 'class-b')
    expect(view.wrongCount).toBe(2)
    expect(view.guessedLetters).toEqual(['z', 'x', 'b'])
  })
})
