import { z } from 'zod';

export const WithdrawSchema = z.object({
  id: z.number(),
  restaurantId: z.number(),
  amount: z.number(),
  createAt: z.string(),
});

export type withdraw = z.infer<typeof WithdrawSchema>;
