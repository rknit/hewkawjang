import { z } from 'zod';

export const ReportTypeEnum = z.enum([
  'support',
  'restaurant',
  'review',
  'user',
  'chat',
]);

export const ReportSchema = z.object({
  id: z.number(),
  userId: z.number(),
  adminId: z.number(),
  reportType: ReportTypeEnum,
  targetRestaurantId: z.number().nullable(),
  targetReviewId: z.number().nullable(),
  targetUserId: z.number().nullable(),
  targetChatId: z.number().nullable(),
  isSolved: z.boolean(),
  createdAt: z.string(), // ISO date string
});

export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeEnum>;
