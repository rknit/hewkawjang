import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { NotificationPaneItemProps } from './notificationPaneItem';
import NotificationGroupByDay from './notificationGroupByDay';
import { useNotifications } from '@/context/NotificationContext';
import { parseLocalDate } from '@/utils/date-time';

interface NotificationPaneProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function NotificationPane({
  visible = false,
  onClose,
}: NotificationPaneProps) {
  const { notifications, readNotification, readAllNotifications } =
    useNotifications();

  const handleMarkAllAsRead = async () => {
    await readAllNotifications();
  };

  const groupedNotifications = useMemo(
    () =>
      groupNotificationsByDay(
        notifications.map((n) => ({
          title: n.title,
          message: n.message || '',
          datetime: parseLocalDate(n.createdAt),
          isRead: n.isRead,
          imageUrl: n.imageUrl || undefined,
          onPress: async () => {
            if (!n.isRead) {
              await readNotification(n.id);
            }
            // TODO: Navigate to reservation or chat based on notificationType
          },
        })),
      ),
    [notifications, readNotification],
  );

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      backdropColor="white"
      backdropOpacity={0.7}
      style={{
        marginHorizontal: 0,
        marginVertical: 32,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View className="bg-white overflow-auto rounded-2xl p-6 mx-4 shadow-lg w-5/12 h-full">
        <View className="gap-1">
          {/* header */}
          <Text className="text-black text-xl">Notification</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-[#575757] text-sm">
              Stay Update With Your Latest Notification
            </Text>

            {/* mark all as read button */}
            <TouchableOpacity
              className="flex-row gap-1 items-center"
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done-outline" size={20} color="black" />
              <Text className="text-black text-sm">Mark all as read</Text>
            </TouchableOpacity>
          </View>

          {/* notification list */}
          <ScrollView className="mt-4 overflow-visible">
            <View className="flex-col gap-4">
              {groupedNotifications.map((group, index) => (
                <NotificationGroupByDay
                  key={index}
                  date={group.date}
                  notifications={group.notifications}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function groupNotificationsByDay(notifications: NotificationPaneItemProps[]) {
  const grouped = new Map<string, NotificationPaneItemProps[]>();

  notifications.forEach((notification) => {
    const dateKey = notification.datetime.toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(notification);
  });

  // Convert to array and sort by date (most recent first)
  return Array.from(grouped.entries())
    .map(([dateString, notifications]) => ({
      date: new Date(dateString),
      notifications,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
