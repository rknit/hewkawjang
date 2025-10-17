import ApiService from '@/services/api.service';
import { NotificationSchema, Notification } from '@/types/notification.type';
import { normalizeError } from '@/utils/api-error';
import { z } from 'zod';

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const res = await ApiService.get('/notifications/');
    return res.data.map((noti: any) => NotificationSchema.parse(noti));
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

export async function readNotification(id: number): Promise<void> {
  try {
    await ApiService.patch(`/notifications/${id}/read`);
  } catch (error) {
    normalizeError(error);
  }
}

export async function readAllNotifications(): Promise<void> {
  try {
    await ApiService.post(`/notifications/mark-all-as-read`);
  } catch (error) {
    normalizeError(error);
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const res = await ApiService.get('/notifications/unread/count');
    return z.number().parse(res.data.count);
  } catch (error) {
    normalizeError(error);
    return 0;
  }
}
