import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Notification } from '@/types/notification.type';
import { DefaultNotificationProps } from '@/components/notifications/defaultNotification';
import * as notiApi from '@/apis/notification.api';
import { parseLocalDate } from '@/utils/date-time';

interface NotificationContextType {
  notifications: Notification[];
  readNotification: (id: number) => Promise<void>;
  readAllNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial notifications
  const fetchNotificationsData = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await notiApi.fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark a single notification as read
  const readNoti = useCallback(
    async (id: number) => {
      if (!user?.id) return;

      try {
        await notiApi.readNotification(id);

        // Update local state
        setNotifications((prev) =>
          prev.map((noti) =>
            noti.id === id ? { ...noti, isRead: true } : noti,
          ),
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [user?.id],
  );

  // Mark all notifications as read
  const readAllNotis = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notiApi.readAllNotifications();

      // Update local state
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, isRead: true })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial notifications
    fetchNotificationsData();

    // Subscribe to realtime changes
    const realtimeChannel = supabase
      .channel(`notifications:user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // console.log('New notification:', payload);
          const newNotification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            message: payload.new.message,
            imageUrl: payload.new.image_url,
            reservationId: payload.new.reservation_id,
            notificationType: payload.new.notification_type,
            createdAt: payload.new.created_at,
            isRead: payload.new.is_read,
          };
          setNotifications((prev) => [newNotification, ...prev]);

          // Show toast notification for new notification
          // hardcode to DefaultNotification for now
          toast.show<DefaultNotificationProps>(
            newNotification.notificationType,
            {
              data: {
                title: newNotification.title,
                message: newNotification.message,
                datetime: parseLocalDate(newNotification.createdAt),
                imageUrl: newNotification.imageUrl,
              },
            },
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            message: payload.new.message,
            imageUrl: payload.new.image_url,
            reservationId: payload.new.reservation_id,
            notificationType: payload.new.notification_type,
            createdAt: payload.new.created_at,
            isRead: payload.new.is_read,
          };
          setNotifications((prev) =>
            prev.map((noti) =>
              noti.id === updatedNotification.id ? updatedNotification : noti,
            ),
          );
        },
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [user?.id, fetchNotificationsData, toast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        readNotification: readNoti,
        readAllNotifications: readAllNotis,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
