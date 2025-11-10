import { db } from '../db';
import { chatTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

class ChatService {
  async findOrCreateChat(userId: number, restaurantId: number) {
    const existing = await db
      .select()
      .from(chatTable)
      .where(
        and(
          eq(chatTable.userId, userId),
          eq(chatTable.restaurantId, restaurantId),
        ),
      );

    if (existing.length > 0) return existing[0];

    const [newChat] = await db
      .insert(chatTable)
      .values({ userId, restaurantId })
      .returning();

    return newChat;
  }

  async getChatsByUser(userId: number) {
    return db.select().from(chatTable).where(eq(chatTable.userId, userId));
  }

  async getChatsByRestaurant(restaurantId: number) {
    return db
      .select()
      .from(chatTable)
      .where(eq(chatTable.restaurantId, restaurantId));
  }
}

export default new ChatService();
