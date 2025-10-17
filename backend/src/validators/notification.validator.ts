import { createInsertSchema } from 'drizzle-zod';
import { notificationTable } from '../db/schema';
import { z } from 'zod';

export const notificationInsertSchema = 
  createInsertSchema(notificationTable).extend({
    
    // Add .default(null) to match the database's nullability
    imageUrl: z.string().url({ message: "Invalid image URL" })
      .optional()
      .nullable()
      .default(null), // <-- THE FIX

    // This field is fine because you made it required
    message: z.string().min(1, { 
      message: "Notification message is required and cannot be empty" 
    }),

    // Apply the same fix to any other optional fields
    reservationId: z.number().int().positive()
      .optional()
      .nullable()
      .default(null) // <-- THE FIX
  });

export type CreateNotificationDto = z.infer<typeof notificationInsertSchema>;