import * as z from 'zod';

// Backend response structure
export const ReviewWithUserSchema = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string().nullable(),
  attachPhotos: z.array(z.string()).nullable(),
  createdAt: z.string(), // ISO date string from backend
  user: z.object({
    id: z.number(),
    displayName: z.string().nullable(),
    firstName: z.string(),
    lastName: z.string(),
    profileUrl: z.string().nullable(),
  }),
});

export type ReviewWithUser = z.infer<typeof ReviewWithUserSchema>;

export const ReviewsResultSchema = z.object({
  reviews: z.array(ReviewWithUserSchema),
  hasMore: z.boolean(),
});

export type ReviewsResult = z.infer<typeof ReviewsResultSchema>;

// Frontend comment type (for UI components)
export type Comment = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};
