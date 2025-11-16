import ApiService from '@/services/api.service';
import {
  ChatChannel,
  ChatChannelSchema,
  ChatMessage,
  ChatMessageSchema,
  AdminChatChannel,
  AdminChatChannelSchema,
  AdminChatMessage,
  AdminChatMessageSchema,
} from '@/types/chat.type';
import { normalizeError } from '@/utils/api-error';
import { z } from 'zod';

/**
 * Fetch all chat channels for a specific user
 */
export async function fetchUserChats(userId: number): Promise<ChatChannel[]> {
  try {
    const res = await ApiService.get(`/chat/user/${userId}`);
    return z.array(ChatChannelSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

/**
 * Fetch all chat channels for a specific restaurant
 */
export async function fetchRestaurantChats(
  restaurantId: number,
): Promise<ChatChannel[]> {
  try {
    const res = await ApiService.get(`/chat/restaurant/${restaurantId}`);
    return z.array(ChatChannelSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

/**
 * Create or find a chat between user and restaurant
 */
export async function findOrCreateChat(
  userId: number,
  restaurantId: number,
): Promise<ChatChannel | null> {
  try {
    const res = await ApiService.post(`/chat/user/${Number(restaurantId)}`, {
      userId: Number(userId),
    });
    return ChatChannelSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

/**
 * Fetch messages for a specific chat
 */
export async function fetchChatMessages(
  chatId: number,
): Promise<ChatMessage[]> {
  try {
    const res = await ApiService.get(`/chat/user/messages/${chatId}`);
    return z.array(ChatMessageSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export const fetchAllChats = async (userId: number) => {
  try {
    const res = await ApiService.get(`/chat/user/all/${userId}`);
    return z.array(ChatChannelSchema).parse(res.data); // ensure displayName is present
  } catch (err: any) {
    console.error('Full chat fetch error:', err);
    throw err;
  }
};

/**
 * Send a message in a chat
 */
export async function sendMessage(
  chatId: number,
  senderId: number,
  text: string,
  imgURL?: string,
): Promise<ChatMessage | null> {
  try {
    const res = await ApiService.post(`/chat/user/messages`, {
      chatId,
      senderId,
      text,
      imgURL,
    });
    return ChatMessageSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function fetchAdminChats(
  adminId: number,
): Promise<AdminChatChannel[]> {
  try {
    const res = await ApiService.get(`/chat/admin/${adminId}`);
    return z.array(AdminChatChannelSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export async function fetchAdminChatMessages(
  chatAdminId: number,
): Promise<AdminChatMessage[]> {
  try {
    const res = await ApiService.get(`/chat/admin/messages/${chatAdminId}`);
    return z.array(AdminChatMessageSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export async function createAdminChatMessage(
  chatAdminId: number,
  senderRole: 'admin' | 'user' | 'restaurant',
  text: string | null,
  imgURL: string | null,
): Promise<AdminChatMessage | null> {
  try {
    const res = await ApiService.post(`/chat/admin/messages`, {
      chatAdminId,
      senderRole,
      text,
      imgURL,
    });

    return res.data;
  } catch (error) {
    return normalizeError(error) ?? null;
  }
}

export async function fetchUserAdminChats(
  userId: number,
): Promise<AdminChatChannel[]> {
  try {
    const res = await ApiService.get(`/chat/admin/user/${userId}`);
    return z.array(AdminChatChannelSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export async function fetchUserAdminChatMessages(
  chatAdminId: number,
): Promise<AdminChatMessage[]> {
  try {
    const res = await ApiService.get(
      `/chat/admin/messages/user/${chatAdminId}`,
    );
    return z.array(AdminChatMessageSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export async function sendAdminMessageAsUser(
  chatAdminId: number,
  userId: number,
  text: string,
  imgURL?: string | null,
): Promise<AdminChatMessage | null> {
  try {
    const res = await ApiService.post(`/chat/admin/messages/user`, {
      chatAdminId,
      userId,
      text,
      imgURL: imgURL ?? null,
    });
    return AdminChatMessageSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? null;
  }
}
