import * as z from 'zod';

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});
export type Tokens = z.infer<typeof TokensSchema>;

export const UserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNo: z.string(),
  displayName: z.string().nullable(),
  profileUrl: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;
