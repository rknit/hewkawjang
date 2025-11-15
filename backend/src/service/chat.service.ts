import { db } from '../db';
import {
  chatsTable,
  usersTable,
  messagesTable,
  restaurantTable,
  chatAdminsTable,
  adminMessagesTable,
} from '../db/schema';
import { eq, or, inArray, sql, and } from 'drizzle-orm';

class ChatService {
  /**
   * Find an existing chat between a user and a restaurant.
   * If not found, create a new one.
   */
  async findOrCreateChat(userId: number, restaurantId: number) {
    try {
      console.log(
        `[ChatService] findOrCreateChat: userId=${userId}, restaurantId=${restaurantId}`,
      );

      const existing = await db
        .select()
        .from(chatsTable)
        .where(
          and(
            eq(chatsTable.userId, userId),
            eq(chatsTable.restaurantId, restaurantId),
          ),
        );

      console.log(`[ChatService] existing chats found:`, existing.length);

      if (existing.length > 0) {
        return existing[0];
      }

      const [newChat] = await db
        .insert(chatsTable)
        .values({ userId, restaurantId })
        .returning();

      console.log(`[ChatService] created new chat:`, newChat);
      return newChat;
    } catch (err) {
      console.error(`[ChatService] ERROR in findOrCreateChat:`, err);
      throw err;
    }
  }

  /**
   * Get all chats that belong to a specific user
   */
  async getChatsByUser(userId: number) {
    try {
      console.log(`[ChatService] getChatsByUser: userId=${userId}`);
      const result = await db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.userId, userId));
      console.log(`[ChatService] getChatsByUser: found ${result.length} chats`);
      return result;
    } catch (err) {
      console.error(`[ChatService] ERROR in getChatsByUser:`, err);
      throw err;
    }
  }

  /**
   * Get all chats where user is either customer or restaurant owner
   */
  async getChatsForUserOrOwner(userId: number) {
    // console.log(
    //   `[ChatService] getChatsForUserOrOwner called with userId=${userId}`,
    // );

    try {
      // 1️⃣ Fetch all owned restaurants
      const ownedRestaurants = await db
        .select({ id: restaurantTable.id })
        .from(restaurantTable)
        .where(eq(restaurantTable.ownerId, userId));

      const ownedRestaurantIds = ownedRestaurants.map((r) => r.id);
      //console.log(`[ChatService] ownedRestaurantIds:`, ownedRestaurantIds);

      // 2️⃣ Base query
      const query = db
        .select({
          id: chatsTable.id,
          userId: chatsTable.userId,
          restaurantId: chatsTable.restaurantId,
          userName: usersTable.displayName,
          restaurantName: restaurantTable.name,
          lastMessage: sql<string | null>`(
            SELECT text FROM ${messagesTable}
            WHERE ${messagesTable.chatId} = ${chatsTable.id}
            ORDER BY ${messagesTable.createdAt} DESC
            LIMIT 1
          )`,
        })
        .from(chatsTable)
        .leftJoin(usersTable, eq(usersTable.id, chatsTable.userId))
        .leftJoin(
          restaurantTable,
          eq(restaurantTable.id, chatsTable.restaurantId),
        );

      // 3️⃣ Add condition
      if (ownedRestaurantIds.length === 0) {
        // console.log(
        //   `[ChatService] No owned restaurants → fetching as normal user`,
        // );
        query.where(eq(chatsTable.userId, userId));
      } else {
        //console.log(`[ChatService] Fetching as owner or user`);
        query.where(
          or(
            eq(chatsTable.userId, userId),
            inArray(chatsTable.restaurantId, ownedRestaurantIds),
          ),
        );
      }

      // 4️⃣ Execute query
      const chats = await query;

      // 5️⃣ Add displayName logic
      const result = chats.map((chat) => {
        // If current user is the customer → show restaurantName
        // If current user is the owner → show userName
        const isOwner = ownedRestaurantIds.includes(chat.restaurantId);
        return {
          ...chat,
          displayName: isOwner ? chat.userName : chat.restaurantName,
        };
      });

      // console.log(
      //   `[ChatService] getChatsForUserOrOwner: found ${result.length} chats`,
      // );
      return result;
    } catch (err) {
      //console.error(`[ChatService] ERROR in getChatsForUserOrOwner:`, err);
      throw err;
    }
  }

  async getChatsByAdmin(adminId: number) {
    try {
      console.log(`[ChatService] getChatsByAdmin: adminId=${adminId}`);
      const result = await db
        .select({
          chatId: chatAdminsTable.id,
          userId: chatAdminsTable.userId,
          adminId: chatAdminsTable.adminId,
          displayName: usersTable.displayName,
          profileUrl: usersTable.profileUrl,
        })
        .from(chatAdminsTable)
        .innerJoin(usersTable, eq(chatAdminsTable.userId, usersTable.id))
      console.log(`[ChatService] getChatsByAdmin: found ${result.length} chats`);
      return result;
    } catch (err) {
      console.error(`[ChatService] ERROR in getChatsByAdmin:`, err);
      throw err;
    }
  }

  async getAdminChatMessages(chatAdminId: number) {
    try {
      console.log(`[ChatService] getAdminChatMessages: chatAdminId=${chatAdminId}`);
      const result = await db
        .select()
        .from(adminMessagesTable)
        .where(eq(adminMessagesTable.chatAdminId, chatAdminId));
      console.log(`[ChatService] getAdminChatMessages: found ${result.length} chats`);
      return result;
    } catch (err) {
      console.error(`[ChatService] ERROR in getAdminChatMessages:`, err);
      throw err;
    }
  }

  async createAdminChatMessage({
    chatAdminId,
    senderId,
    senderRole,
    text,
    imgURL,
  }: {
    chatAdminId: number;
    senderId: number;
    senderRole: 'user' | 'admin' | 'restaurant';
    text?: string;
    imgURL?: string;
  }) {
    try {
      console.log(`[ChatService] createAdminChatMessage: chatAdminId=${chatAdminId}`);

      const [inserted] = await db
        .insert(adminMessagesTable)
        .values({
          chatAdminId,
          senderId,
          senderRole,
          text: text ?? null,
          imgURL: imgURL ?? null,
        })
        .returning();

      console.log(
        `[ChatService] createAdminChatMessage: message inserted with id=${inserted.id}`
      );

      return inserted;
    } catch (err) {
      console.error('[ChatService] ERROR in createAdminChatMessage:', err);
      throw err;
    }
  }
}

const chatService = new ChatService();
export default chatService;
