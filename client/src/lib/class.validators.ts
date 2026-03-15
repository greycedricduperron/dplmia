import { z } from 'zod';

export const CreateClassSchema = z.object({
  name: z.string().min(2).max(100),
  country: z.string().length(2),
  language: z.string().length(2).default('fr'),
});

export const UpdateClassSchema = CreateClassSchema.partial();

export const SearchClassSchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
});

export type CreateClassInput = z.infer<typeof CreateClassSchema>;
export type UpdateClassInput = z.infer<typeof UpdateClassSchema>;
