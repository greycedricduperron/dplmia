import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { HangmanGame, ClassConnection } from '../types'
import {
  proposeGameFn,
  listGamesFn,
  getGameFn,
  guessLetterFn,
  abandonGameFn,
} from '../functions/hangman'
import { getConnectionsFn } from '../functions/connections'
import { useAuth } from '../context/AuthContext'
import HangmanDrawing from '../components/hangman/HangmanDrawing'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const Route = createFileRoute('/_auth/hangman')({
  component: HangmanPage,
})

function HangmanPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [connection, setConnection] = useState<ClassConnection | null>(null)
  const [games, setGames] = useState<HangmanGame[]>([])
  const [selectedGame, setSelectedGame] = useState<HangmanGame | null>(null)
  const [proposeForm, setProposeForm] = useState({ word: '', hint: '', language: 'fr' })
  const [showPropose, setShowPropose] = useState(false)
  const [error, setError] = useState('')

  const classId = user?.class?.id

  async function load(conn: ClassConnection) {
    const result = await listGamesFn({ data: { connectionId: conn.id } })
    const gameList = result as HangmanGame[]
    setGames(gameList)
    const active = gameList.find((g) => g.state === 'ACTIVE')
    if (active) {
      const detail = await getGameFn({ data: { gameId: active.id } })
      setSelectedGame(detail as HangmanGame)
    }
  }

  useEffect(() => {
    getConnectionsFn().then((r) => {
      const accepted = (r as ClassConnection[]).find((c) => c.status === 'ACCEPTED')
      if (accepted) {
        setConnection(accepted)
        load(accepted)
      }
    })
  }, [])

  async function propose(e: React.FormEvent) {
    e.preventDefault()
    if (!connection) return
    setError('')
    try {
      await proposeGameFn({ data: { ...proposeForm, connectionId: connection.id } })
      setProposeForm({ word: '', hint: '', language: 'fr' })
      setShowPropose(false)
      load(connection)
    } catch (err: any) {
      const msg = err.message
      if (msg === 'ACTIVE_GAME_EXISTS') setError(t('hangman.activeGame'))
      else setError(t('common.error'))
    }
  }

  async function guess(letter: string) {
    if (!selectedGame) return
    try {
      const result = await guessLetterFn({ data: { gameId: selectedGame.id, letter } })
      setSelectedGame(result as HangmanGame)
      if (connection) load(connection)
    } catch (err: any) {
      setError(t('common.error'))
    }
  }

  async function abandon() {
    if (!selectedGame) return
    await abandonGameFn({ data: { gameId: selectedGame.id } })
    setSelectedGame(null)
    if (connection) load(connection)
  }

  const isProposer = selectedGame?.proposerClassId === classId
  const canGuess = selectedGame?.state === 'ACTIVE' && !isProposer

  if (!connection) {
    return (
      <div className="page">
        <h1>{t('hangman.title')}</h1>
        <p className="text-muted">{t('connections.empty')}</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{t('hangman.title')}</h1>

      <div className="hangman-layout">
        <div className="hangman-sidebar">
          <button className="btn-primary btn-sm" onClick={() => setShowPropose(!showPropose)}>
            + {t('hangman.propose')}
          </button>

          {showPropose && (
            <div className="card">
              {error && <p className="error">{error}</p>}
              <form onSubmit={propose}>
                <input
                  placeholder={t('hangman.word')}
                  value={proposeForm.word}
                  onChange={(e) => setProposeForm({ ...proposeForm, word: e.target.value })}
                  required
                />
                <input
                  placeholder={t('hangman.hint')}
                  value={proposeForm.hint}
                  onChange={(e) => setProposeForm({ ...proposeForm, hint: e.target.value })}
                />
                <select
                  value={proposeForm.language}
                  onChange={(e) => setProposeForm({ ...proposeForm, language: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
                <button type="submit" className="btn-primary">
                  {t('hangman.proposeBtn')}
                </button>
              </form>
            </div>
          )}

          <div className="games-list">
            {games.length === 0 && <p className="text-muted">{t('hangman.noGames')}</p>}
            {games.map((g) => (
              <div
                key={g.id}
                className={`game-item ${selectedGame?.id === g.id ? 'active' : ''}`}
                onClick={async () => {
                  const result = await getGameFn({ data: { gameId: g.id } })
                  setSelectedGame(result as HangmanGame)
                }}
              >
                <span className={`badge badge-${g.state.toLowerCase()}`}>
                  {t(`hangman.${g.state.toLowerCase()}`)}
                </span>
                <span>{g.maskedWord}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedGame && (
          <div className="hangman-board card">
            <div className="hangman-top">
              <HangmanDrawing wrongCount={selectedGame.wrongCount} />
              <div className="hangman-info">
                <div className="masked-word">{selectedGame.maskedWord}</div>
                {selectedGame.hint && <p className="hint">💡 {selectedGame.hint}</p>}
                <p>
                  {t('hangman.wrong')}: {selectedGame.wrongCount} / {selectedGame.maxWrongGuesses}
                </p>
                {isProposer && <p className="text-muted">🔤 {t('hangman.youProposed')}</p>}
              </div>
            </div>

            {selectedGame.state === 'FINISHED' && (
              <div
                className={`result-banner ${selectedGame.winnerClassId === classId ? 'won' : 'lost'}`}
              >
                {selectedGame.winnerClassId === classId
                  ? `🎉 ${t('hangman.won')} "${selectedGame.word}"`
                  : `💀 ${t('hangman.lost')} "${selectedGame.word}"`}
              </div>
            )}

            {canGuess && (
              <div className="keyboard">
                {ALPHABET.map((letter) => {
                  const guessed = selectedGame.guessedLetters.includes(letter)
                  return (
                    <button
                      key={letter}
                      className={`key ${guessed ? 'guessed' : ''}`}
                      disabled={guessed}
                      onClick={() => guess(letter)}
                    >
                      {letter.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            )}

            {isProposer && selectedGame.state === 'ACTIVE' && (
              <button className="btn-danger btn-sm" onClick={abandon}>
                {t('hangman.abandon')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
