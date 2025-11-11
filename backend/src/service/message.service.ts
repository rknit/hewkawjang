import { db } from '../db';
import { messagesTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

class MessageService {
  async sendMessage({
    chatId,
    chatAdminId,
    senderId,
    text,
    imgURL,
  }: {
    chatId?: number;
    chatAdminId?: number;
    senderId: number;
    text?: string;
    imgURL?: string;
  }) {
    try {
      console.log('MessageService.sendMessage called with:', {
        chatId,
        chatAdminId,
        senderId,
        text,
        imgURL,
      });

      if (!chatId && !chatAdminId) {
        throw new Error('Either chatId or chatAdminId must be provided.');
      }

      const [message] = await db
        .insert(messagesTable)
        .values({
          chatId: chatId ?? null,
          chatAdminId: chatAdminId ?? null,
          senderId,
          text: text ?? null,
          imgURL: imgURL ?? null,
        })
        .returning();

      console.log('Message created:', message);
      return message;
    } catch (err) {
      console.error('Error in MessageService.sendMessage:', err);
      throw err;
    }
  }

  /**
   * Get all messages for a chat (normal chat)
   */
  async getMessagesByChat(chatId: number, limit = 50, offset = 0) {
    return db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(desc(messagesTable.id))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get all messages for an admin chat (user-admin chat)
   */
  async getMessagesByAdminChat(chatAdminId: number, limit = 50, offset = 0) {
    return db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatAdminId, chatAdminId))
      .orderBy(desc(messagesTable.id))
      .limit(limit)
      .offset(offset);
  }
}

export default new MessageService();
