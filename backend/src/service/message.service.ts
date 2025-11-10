import { db } from '../db';
import { messageTable } from '../db/schema';
import { eq } from 'drizzle-orm';

class MessageService {
  async sendMessage({
    chatId,
    senderUserId,
    senderRestaurantId,
    content,
  }: {
    chatId: number;
    senderUserId?: number;
    senderRestaurantId?: number;
    content: string;
  }) {
    const [msg] = await db
      .insert(messageTable)
      .values({
        chatId,
        senderUserId,
        senderRestaurantId,
        content,
      })
      .returning();
    return msg;
  }

  async getMessages(chatId: number, limit = 50, offset = 0) {
    return db
      .select()
      .from(messageTable)
      .where(eq(messageTable.chatId, chatId))
      .orderBy(messageTable.createdAt)
      .limit(limit)
      .offset(offset);
  }
}

export default new MessageService();
