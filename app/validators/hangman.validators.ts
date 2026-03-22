import { z } from 'zod'

export const ProposeWordSchema = z.object({
  word: z.string().min(2).max(30).regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Letters only'),
  hint: z.string().max(200).optional(),
  language: z.string().length(2).default('fr'),
  connectionId: z.string().uuid(),
})

export const GuessLetterSchema = z.object({
  letter: z.string().length(1).regex(/^[a-zA-ZÀ-ÿ]$/, 'Single letter only'),
})

export type ProposeWordInput = z.infer<typeof ProposeWordSchema>
export type GuessLetterInput = z.infer<typeof GuessLetterSchema>
