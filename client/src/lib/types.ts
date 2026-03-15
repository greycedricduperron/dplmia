export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type MediaType = 'TEXT' | 'IMAGE' | 'AUDIO';
export type GameState = 'ACTIVE' | 'FINISHED';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  language: string;
  country: string;
  createdAt: string;
  class: Class | null;
}

export interface Class {
  id: string;
  name: string;
  country: string;
  language: string;
  teacherId: string;
  createdAt: string;
}

export interface ClassConnection {
  id: string;
  status: ConnectionStatus;
  requesterId: string;
  receiverId: string;
  requester: Class;
  receiver: Class;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string | null;
  mediaType: MediaType;
  mediaUrl: string | null;
  classId: string;
  class: Class;
  createdAt: string;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  classId: string;
  class: Class;
  createdAt: string;
}

export interface HangmanGame {
  id: string;
  hint: string | null;
  language: string;
  state: GameState;
  maxWrongGuesses: number;
  connectionId: string;
  proposerClassId: string;
  winnerClassId: string | null;
  createdAt: string;
  finishedAt: string | null;
  maskedWord: string;
  guessedLetters: string[];
  wrongCount: number;
}

export interface HangmanGuess {
  id: string;
  letter: string;
  correct: boolean;
  classId: string;
  createdAt: string;
}
