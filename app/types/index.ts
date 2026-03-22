export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type MediaType = 'TEXT' | 'IMAGE' | 'AUDIO'
export type GameState = 'ACTIVE' | 'FINISHED'

export interface Teacher {
  id: string
  name: string
  email: string
  language: string
  country: string
  createdAt: string | Date
  class: Class | null
}

export interface Class {
  id: string
  name: string
  country: string
  language: string
  teacherId: string
  createdAt: string | Date
}

export interface ClassConnection {
  id: string
  status: ConnectionStatus
  requesterId: string
  receiverId: string
  requester: Pick<Class, 'id' | 'name' | 'country' | 'language'>
  receiver: Pick<Class, 'id' | 'name' | 'country' | 'language'>
  createdAt: string | Date
}

export interface Post {
  id: string
  title: string
  content: string | null
  mediaType: MediaType
  mediaUrl: string | null
  classId: string
  class: Pick<Class, 'id' | 'name' | 'country' | 'language'>
  createdAt: string | Date
  commentCount?: number
}

export interface Comment {
  id: string
  content: string
  postId: string
  classId: string
  class: Pick<Class, 'id' | 'name' | 'country' | 'language'>
  createdAt: string | Date
}

export interface HangmanGame {
  id: string
  hint: string | null
  language: string
  state: GameState
  maxWrongGuesses: number
  connectionId: string
  proposerClassId: string
  winnerClassId: string | null
  createdAt: string | Date
  finishedAt: string | Date | null
  maskedWord: string
  guessedLetters: string[]
  wrongCount: number
  word?: string
}
