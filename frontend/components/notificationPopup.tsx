import { View, Text, Image } from 'react-native';
import { getDateDDMMYYYY, pad } from '@/utils/date-time';

interface NotificationPopupProps {
  title: string;
  message: string;
  datetime: Date;
  imageUrl?: string;
}

export default function NotificationPopup({
  title,
  message,
  datetime,
  imageUrl,
}: NotificationPopupProps) {
  const formattedDateTime = `- ${getDateDDMMYYYY(datetime)} ● ${pad(datetime.getHours())}:${pad(datetime.getMinutes())}`;

  return (
    <View
      className="bg-[#FEF9F3] border border-[#E05910] mb-2 rounded-xl mr-5 p-2 flex-row gap-4 w-1/3"
      pointerEvents="auto"
      style={{
        alignSelf: 'flex-end', // align to top-right
      }}
    >
      {imageUrl && (
        <View className="justify-center">
          <Image
            source={{ uri: imageUrl }}
            className="rounded-lg"
            style={{ width: 96, height: 80 }}
            resizeMode="cover"
          />
        </View>
      )}

      <View className="flex-col flex-1 overflow-hidden gap-1">
        <Text
          className="font-semibold text-xs"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text className="text-xs" numberOfLines={2} ellipsizeMode="tail">
          {message}
        </Text>
        <Text className="text-[#B7B7B7] text-xs">{formattedDateTime}</Text>
      </View>
    </View>
  );
}
