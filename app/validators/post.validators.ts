import { z } from 'zod'

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(5000).optional(),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
