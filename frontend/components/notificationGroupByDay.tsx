import { View, Text } from 'react-native';
import NotificationPaneItem, {
  NotificationPaneItemProps,
} from './notificationPaneItem';
import { getDatePretty } from '../utils/date-time';

interface NotificationPaneListProps {
  date: Date;
  notifications: NotificationPaneItemProps[];
}

export default function NotificationGroupByDay({
  date,
  notifications,
}: NotificationPaneListProps) {
  const dateLabel = getDatePretty(date);

  // Sort notifications by datetime descending
  notifications.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());

  return (
    <View>
      <Text className="text-[#575757] text-sm">{dateLabel}</Text>
      <View className="mt-3 flex-col gap-4">
        {notifications.map((props, index) => (
          <NotificationPaneItem key={index} {...props} />
        ))}
      </View>
    </View>
  );
}
