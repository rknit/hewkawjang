import * as z from 'zod';

export const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNo: z.string(),
  displayName: z.string().nullable(),
  profileUrl: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;
