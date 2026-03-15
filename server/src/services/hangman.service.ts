import { prisma } from '../config/prisma';
import { ProposeWordInput } from '@dplmia/shared';

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function maskWord(word: string, guessedLetters: string[]): string {
  const normalized = normalize(word);
  return normalized
    .split('')
    .map((ch) => (ch === ' ' ? ' ' : guessedLetters.includes(ch) ? ch : '_'))
    .join(' ');
}

function buildGameView(game: any, classId: string) {
  const isProposer = game.proposerClassId === classId;
  const guessedLetters: string[] = game.guesses.map((g: any) => normalize(g.letter));
  const wrongCount = game.guesses.filter((g: any) => !g.correct).length;
  const masked = maskWord(game.word, guessedLetters);

  return {
    id: game.id,
    hint: game.hint,
    language: game.language,
    state: game.state,
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
  };
}

export async function proposeGame(classId: string, input: ProposeWordInput) {
  const conn = await prisma.classConnection.findUnique({
    where: { id: input.connectionId },
  });
  if (!conn) throw { status: 404, message: 'Connexion introuvable' };
  if (conn.status !== 'ACCEPTED') throw { status: 400, message: 'Connexion non acceptée' };
  if (conn.requesterId !== classId && conn.receiverId !== classId) {
    throw { status: 403, message: 'Non autorisé' };
  }

  const activeGame = await prisma.hangmanGame.findFirst({
    where: { connectionId: input.connectionId, state: 'ACTIVE' },
  });
  if (activeGame) throw { status: 409, message: 'Une partie est déjà en cours' };

  const game = await prisma.hangmanGame.create({
    data: {
      word: input.word.toLowerCase(),
      hint: input.hint,
      language: input.language,
      connectionId: input.connectionId,
      proposerClassId: classId,
    },
    include: { guesses: true },
  });

  return buildGameView(game, classId);
}

export async function listGames(classId: string, connectionId: string) {
  const conn = await prisma.classConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw { status: 404, message: 'Connexion introuvable' };
  if (conn.requesterId !== classId && conn.receiverId !== classId) {
    throw { status: 403, message: 'Non autorisé' };
  }

  const games = await prisma.hangmanGame.findMany({
    where: { connectionId },
    include: { guesses: true },
    orderBy: { createdAt: 'desc' },
  });

  return games.map((g) => buildGameView(g, classId));
}

export async function getGame(gameId: string, classId: string) {
  const game = await prisma.hangmanGame.findUnique({
    where: { id: gameId },
    include: { guesses: true },
  });
  if (!game) throw { status: 404, message: 'Partie introuvable' };

  const conn = await prisma.classConnection.findUnique({ where: { id: game.connectionId } });
  if (!conn) throw { status: 404, message: 'Connexion introuvable' };
  if (conn.requesterId !== classId && conn.receiverId !== classId) {
    throw { status: 403, message: 'Non autorisé' };
  }

  return buildGameView(game, classId);
}

export async function guessLetter(gameId: string, classId: string, rawLetter: string) {
  const game = await prisma.hangmanGame.findUnique({
    where: { id: gameId },
    include: { guesses: true },
  });
  if (!game) throw { status: 404, message: 'Partie introuvable' };
  if (game.state !== 'ACTIVE') throw { status: 400, message: 'La partie est terminée' };
  if (game.proposerClassId === classId) throw { status: 403, message: 'Le proposant ne peut pas deviner' };

  const letter = normalize(rawLetter);

  const alreadyGuessed = game.guesses.some((g) => normalize(g.letter) === letter);
  if (alreadyGuessed) throw { status: 409, message: 'Lettre déjà proposée' };

  const normalizedWord = normalize(game.word);
  const correct = normalizedWord.includes(letter);

  await prisma.hangmanGuess.create({
    data: { gameId, classId, letter, correct },
  });

  // Reload guesses
  const allGuesses = [...game.guesses, { letter, correct, classId }];
  const guessedLetters = allGuesses.map((g) => normalize(g.letter));
  const wrongCount = allGuesses.filter((g) => !g.correct).length;

  // Check win: all non-space letters revealed
  const wordLetters = [...new Set(normalizedWord.replace(/ /g, '').split(''))];
  const allRevealed = wordLetters.every((ch) => guessedLetters.includes(ch));
  const lost = wrongCount >= game.maxWrongGuesses;

  if (allRevealed || lost) {
    const updated = await prisma.hangmanGame.update({
      where: { id: gameId },
      data: {
        state: 'FINISHED',
        finishedAt: new Date(),
        winnerClassId: allRevealed ? classId : null,
      },
      include: { guesses: true },
    });
    return buildGameView(updated, classId);
  }

  const updated = await prisma.hangmanGame.findUnique({
    where: { id: gameId },
    include: { guesses: true },
  });
  return buildGameView(updated!, classId);
}

export async function abandonGame(gameId: string, classId: string) {
  const game = await prisma.hangmanGame.findUnique({ where: { id: gameId } });
  if (!game) throw { status: 404, message: 'Partie introuvable' };
  if (game.proposerClassId !== classId) throw { status: 403, message: 'Seul le proposant peut abandonner' };
  if (game.state !== 'ACTIVE') throw { status: 400, message: 'Partie déjà terminée' };

  return prisma.hangmanGame.update({
    where: { id: gameId },
    data: { state: 'FINISHED', finishedAt: new Date() },
  });
}
