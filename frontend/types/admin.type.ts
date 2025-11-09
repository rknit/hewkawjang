import * as z from 'zod';

export const AdminSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});
export type Admin = z.infer<typeof AdminSchema>;
