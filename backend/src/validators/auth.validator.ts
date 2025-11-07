import { z } from 'zod';

export const UserAuthPayloadSchema = z.object({
  sub: z.string(),
  role: z.literal('authenticated'),
  authRole: z.enum(['user', 'admin']),
  userId: z.number(),
});

export type UserAuthPayload = z.infer<typeof UserAuthPayloadSchema>;
