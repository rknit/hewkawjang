import { z } from 'zod';

export const ReservationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  restaurantId: z.number(),
  reserveAt: z.string(), // ISO date string
  numberOfAdult: z.number().default(0),
  numberOfChildren: z.number().default(0),
  numberOfElderly: z.number().default(0),
  status: z.string(),
  specialRequest: z.string().nullable(),
  createdAt: z.string(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
