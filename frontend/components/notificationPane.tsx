import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NotificationPaneItemProps } from './notificationPaneItem';
import NotificationGroupByDay from './notificationGroupByDay';

interface NotificationPaneProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function NotificationPane({
  visible = false,
  onClose,
}: NotificationPaneProps) {
  const handleMarkAllAsRead = () => {
    alert('TODO: Mark all as read');
  };

  const groupedNotifications = groupNotificationsByDay(
    MOCK_DATA.map((n) => ({
      ...n,
      onPress: () => {
        alert(`TODO: Read Notification: ${n.title}`);
      },
    })),
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

const MOCK_DATA: NotificationPaneItemProps[] = [
  // Today - 3 notifications
  {
    title: 'Reservation Confirmed',
    message:
      'Your reservation at The Golden Spoon has been confirmed for tonight at 7 PM.',
    datetime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  },
  {
    title: 'New Message',
    message:
      'The restaurant sent you a message regarding your upcoming reservation.',
    datetime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    title: 'Table Upgrade Available',
    message: 'Upgrade to a window seat for just $10 more!',
    datetime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
  },

  // Yesterday - 2 notifications
  {
    title: 'Special Offer Available',
    message: 'Get 20% off your next reservation at participating restaurants!',
    datetime: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000,
    ), // Yesterday
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=400',
  },
  {
    title: 'Reservation Reminder',
    message: 'Your reservation at Italian Bistro is coming up in 24 hours.',
    datetime: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000,
    ), // Yesterday
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400',
  },

  // 5 days ago - 3 notifications
  {
    title: 'Review Request',
    message: 'How was your experience at Pasta Paradise? Share your feedback.',
    datetime: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
  },
  {
    title: 'Payment Received',
    message: 'Your refund of $45.00 has been processed.',
    datetime: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  },
  {
    title: 'Points Expiring Soon',
    message: '200 loyalty points will expire in 30 days. Use them now!',
    datetime: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400',
  },

  // 15 days ago - 2 notifications
  {
    title: 'Reservation Reminder',
    message:
      "Don't forget! Your reservation at Sushi Master is tomorrow at 6:30 PM.",
    datetime: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
  },
  {
    title: 'Menu Update',
    message: 'Sushi Master has added new items to their menu. Check it out!',
    datetime: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  },

  // 1 month ago - 2 notifications
  {
    title: 'Payment Successful',
    message: 'Your payment of $125.50 has been processed successfully.',
    datetime: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400',
  },
  {
    title: 'Reservation Complete',
    message: 'Thank you for dining with us! We hope you enjoyed your meal.',
    datetime: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400',
  },

  // 2 months ago - 2 notifications
  {
    title: 'New Restaurant Added',
    message:
      'Check out Ocean Breeze, now available for reservations in your area!',
    datetime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
  },
  {
    title: 'Weekend Special',
    message: 'Book a table for this weekend and get a free appetizer!',
    datetime: new Date(
      Date.now() - 60 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000,
    ),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  },

  // 4 months ago
  {
    title: 'Loyalty Points Earned',
    message: 'You earned 150 points from your recent visit. Redeem them now!',
    datetime: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  },

  // 6 months ago
  {
    title: 'Reservation Cancelled',
    message:
      'Your reservation at Mediterranean Nights has been cancelled as requested.',
    datetime: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
  },

  // 9 months ago
  {
    title: 'Birthday Special',
    message:
      'Happy Birthday! Enjoy a complimentary dessert on your special day.',
    datetime: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000),
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400',
  },

  // 1 year ago
  {
    title: 'Welcome to Our Platform',
    message:
      'Thank you for joining! Discover amazing restaurants and make your first reservation.',
    datetime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400',
  },
];
