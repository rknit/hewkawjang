import * as z from 'zod';

// A chat channel between user and restaurant
export const ChatChannelSchema = z.object({
  id: z.number(),
  userId: z.number(), // <-- add
  restaurantId: z.number(), // <-- add
  userName: z.string().nullable().optional(),
  restaurantName: z.string().nullable().optional(),
  lastMessage: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
});
export type ChatChannel = z.infer<typeof ChatChannelSchema>;

// A single message in a chat
export const ChatMessageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  chatAdminId: z.number().nullish(),
  senderId: z.number(),
  text: z.string().nullable().default(''), // text might be null in DB
  imgURL: z.string().nullish(), // imgURL can be null
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// export const messagesTable = pgTable(
//   'message',
//   {
//     id: serial('id').primaryKey(),
//     chatId: integer('chat_id').references(() => chatsTable.id),
//     chatAdminId: integer('chat_admin_id').references(() => chatAdminsTable.id),
//     senderId: integer('sender_id')
//       .notNull()
//       .references(() => usersTable.id),
//     text: text('text'),
//     imgURL: text('img_url'),
//     createdAt: timestamp('created_at').notNull().defaultNow(),
//   },
//   (table) => ({
//     // Ensure exactly one of chatId or chatAdminId is set
//     checkEitherChatOrAdmin: check(
//       'check_either_chat_or_admin',
//       sql`(
//       (${table.chatId} IS NOT NULL AND ${table.chatAdminId} IS NULL) OR
//       (${table.chatId} IS NULL AND ${table.chatAdminId} IS NOT NULL)
//     )`,
//     ),
//   }),
// );

export const AdminChatChannelSchema = z.object({
  chatId: z.number(),
  userId: z.number(),
  adminId: z.number(),
  displayName: z.string(),
  profileUrl: z.string().optional().nullable(),
});
export type AdminChatChannel = z.infer<typeof AdminChatChannelSchema>;

export const AdminChatMessageSchema = z.object({
  id: z.number(),
  chatAdminId: z.number(),
  senderId: z.number(),
  senderRole: z.enum(['user', 'admin', 'restaurant']),
  text: z.string(),
  imgURL: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminChatMessage = z.infer<typeof AdminChatMessageSchema>;
