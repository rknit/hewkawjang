import { adminsTable } from '../db/schema';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const adminSelectSchema = createSelectSchema(adminsTable);
export type Admin = z.infer<typeof adminSelectSchema>;
