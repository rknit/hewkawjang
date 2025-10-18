import { View, Image, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getDateDDMMYYYY, pad } from '@/utils/date-time';

export interface NotificationPaneItemProps {
  title: string;
  message: string;
  datetime: Date;
  isRead: boolean;
  imageUrl?: string;
  onPress?: () => void;
}

export default function NotificationPaneItem({
  title,
  message,
  datetime,
  isRead,
  imageUrl,
  onPress,
}: NotificationPaneItemProps) {
  const formattedDateTime = `${getDateDDMMYYYY(datetime)} ● ${pad(datetime.getHours())}:${pad(datetime.getMinutes())}`;

  return (
    <Pressable className="w-full" onPress={onPress}>
      <View
        className="bg-[#FEF9F3] w-full h-full rounded-md p-2 flex-row gap-4"
        style={{
          shadowColor: '#EF811F',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {imageUrl && (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={{ width: 84, height: 62 }}
          />
        )}

        <View className="flex-col flex-1 overflow-hidden gap-1">
          <Text className="font-semibold text-xs">{title}</Text>
          <Text className="text-xs">
            {message}{' '}
            <Text className="text-[#B7B7B7]">- {formattedDateTime}</Text>
          </Text>
        </View>
      </View>

      {/* unread indicator */}
      {!isRead && (
        <FontAwesome
          name="circle"
          size={12}
          color="#EF811F"
          className="absolute top-[-4] left-[-4]"
        />
      )}
    </Pressable>
  );
}
