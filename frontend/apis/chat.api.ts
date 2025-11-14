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
    const res = await ApiService.post(`/chat/${restaurantId}`, { userId });
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
    const res = await ApiService.get(`/chat/${chatId}/messages`);
    return z.array(ChatMessageSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export const fetchAllChats = async (userId: number) => {
  try {
    const res = await ApiService.get(`/chat/all/${userId}`);
    return res.data;
  } catch (err: any) {
    console.error('Full chat fetch error:', err);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Status:', err.response.status);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Error message:', err.message);
    }
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
    const res = await ApiService.post(`/chat/${chatId}/messages`, {
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

export async function fetchAdminChats(adminId: number): Promise<AdminChatChannel[]> {
  try {
    const res = await ApiService.get(`/chat/admin/${adminId}`);
    return z.array(AdminChatChannelSchema).parse(res.data);
  } catch (error) {
    return normalizeError(error) ?? [];
  }
}

export async function fetchAdminChatMessages(chatAdminId: number): Promise<AdminChatMessage[]> {
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
  imgURL: string | null
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
