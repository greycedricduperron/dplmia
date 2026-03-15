import api from './client';
import type { HangmanGame } from '@dplmia/shared';

type R<T> = { success: true; data: T };

export const hangmanApi = {
  propose: (data: { word: string; hint?: string; language: string; connectionId: string }) =>
    api.post<R<HangmanGame>>('/hangman/games', data),

  list: (connectionId: string) =>
    api.get<R<HangmanGame[]>>('/hangman/games', { params: { connectionId } }),

  get: (id: string) => api.get<R<HangmanGame>>(`/hangman/games/${id}`),

  guess: (id: string, letter: string) =>
    api.post<R<HangmanGame>>(`/hangman/games/${id}/guess`, { letter }),

  abandon: (id: string) => api.patch<R<HangmanGame>>(`/hangman/games/${id}/abandon`),
};
