import { reportsTable } from '../db/schema';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

export const reportSelectSchema = createSelectSchema(reportsTable);
export type Report = z.infer<typeof reportSelectSchema>;

export const reportUpdateSchema = createUpdateSchema(reportsTable).omit({
  id: true,
});
export type ReportUpdate = z.infer<typeof reportUpdateSchema>;
