import { z } from 'zod';

// Define allowed reservation statuses
export const ReservationStatusEnum = z.enum([
  'unconfirmed',
  'expired',
  'confirmed',
  'cancelled',
  'rejected',
  'completed',
  'uncompleted',
]);

export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;

export const ReservationQuerySchema = z.object({
  status: z
    .union([ReservationStatusEnum, z.array(ReservationStatusEnum)])
    .optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
