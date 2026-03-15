import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HangmanGame, ClassConnection } from '../lib/types';
import { hangmanApi } from '../api/hangman.api';
import { connectionApi } from '../api/connection.api';
import { useAuth } from '../context/AuthContext';
import HangmanDrawing from '../components/hangman/HangmanDrawing';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function HangmanPage() {
  const { t } = useTranslation();
  const { teacher } = useAuth();
  const [connection, setConnection] = useState<ClassConnection | null>(null);
  const [games, setGames] = useState<HangmanGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<HangmanGame | null>(null);
  const [proposeForm, setProposeForm] = useState({ word: '', hint: '', language: 'fr' });
  const [showPropose, setShowPropose] = useState(false);
  const [error, setError] = useState('');

  const classId = teacher?.class?.id;

  async function load(conn: ClassConnection) {
    const r = await hangmanApi.list(conn.id);
    setGames(r.data.data);
    const active = r.data.data.find((g) => g.state === 'ACTIVE');
    if (active) {
      const detail = await hangmanApi.get(active.id);
      setSelectedGame(detail.data.data);
    }
  }

  useEffect(() => {
    connectionApi.list().then((r) => {
      const accepted = r.data.data.find((c) => c.status === 'ACCEPTED');
      if (accepted) {
        setConnection(accepted);
        load(accepted);
      }
    });
  }, []);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    if (!connection) return;
    setError('');
    try {
      await hangmanApi.propose({ ...proposeForm, connectionId: connection.id });
      setProposeForm({ word: '', hint: '', language: 'fr' });
      setShowPropose(false);
      load(connection);
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  async function guess(letter: string) {
    if (!selectedGame) return;
    try {
      const r = await hangmanApi.guess(selectedGame.id, letter);
      setSelectedGame(r.data.data);
      if (connection) load(connection);
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  async function abandon() {
    if (!selectedGame) return;
    await hangmanApi.abandon(selectedGame.id);
    setSelectedGame(null);
    if (connection) load(connection);
  }

  const isProposer = selectedGame?.proposerClassId === classId;
  const canGuess = selectedGame?.state === 'ACTIVE' && !isProposer;

  if (!connection) {
    return (
      <div className="page">
        <h1>{t('hangman.title')}</h1>
        <p className="text-muted">{t('connections.empty')}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{t('hangman.title')}</h1>

      <div className="hangman-layout">
        {/* Game list sidebar */}
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
                <button type="submit" className="btn-primary">{t('hangman.proposeBtn')}</button>
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
                  const r = await hangmanApi.get(g.id);
                  setSelectedGame(r.data.data);
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

        {/* Game board */}
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
              <div className={`result-banner ${selectedGame.winnerClassId === classId ? 'won' : 'lost'}`}>
                {selectedGame.winnerClassId === classId
                  ? `🎉 ${t('hangman.won')} "${selectedGame.word}"`
                  : `💀 ${t('hangman.lost')} "${selectedGame.word}"`}
              </div>
            )}

            {canGuess && (
              <div className="keyboard">
                {ALPHABET.map((letter) => {
                  const guessed = selectedGame.guessedLetters.includes(letter);
                  return (
                    <button
                      key={letter}
                      className={`key ${guessed ? 'guessed' : ''}`}
                      disabled={guessed}
                      onClick={() => guess(letter)}
                    >
                      {letter.toUpperCase()}
                    </button>
                  );
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
  );
}
