import { z } from 'zod';

export const ReservationStatusEnum = z.enum([
  'unconfirmed',
  'expired',
  'confirmed',
  'cancelled',
  'rejected',
  'completed',
  'uncompleted',
]);

export const ReservationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  restaurantId: z.number(),
  reserveAt: z.string(), // ISO date string
  numberOfAdult: z.number().default(0),
  numberOfChildren: z.number().default(0),
  numberOfElderly: z.number().default(0),
  reservationFee: z.number(),
  status: ReservationStatusEnum,
  createdAt: z.string(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;
