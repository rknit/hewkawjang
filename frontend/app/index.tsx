import CategoryRow from '@/components/categoryRow';
import { MOCK_NOTI_DATA } from '@/components/notificationPane';
import RecommendedRestaurantGrid from '@/components/recom-restaurant-grid';
import SearchPanel from '@/components/search-panel';
import { useState } from 'react';
import { Button, Image, ScrollView, Text, View } from 'react-native';
import { useNotification } from '@/context/NotificationContext';

export default function Index() {
  const notification = useNotification();
  const [notiCounter, setNotiCounter] = useState(0);

  const handleNotificationPress = () => {
    const currentIndex = notiCounter % MOCK_NOTI_DATA.length;
    const currentNotification = MOCK_NOTI_DATA[currentIndex];

    notification.show({
      data: {
        title: currentNotification.title,
        message: currentNotification.message,
        datetime: new Date(),
        imageUrl: currentNotification.imageUrl,
      },
    });

    setNotiCounter(notiCounter + 1);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 gap-4 w-full">
        <View className="pt-14 w-full justify-center items-center gap-4">
          <Text className="right-40 text-4xl text-[#E05910]">HEW KAW JANG</Text>
          <Text className="left-10 text-xl">
            From Hunger to Happiness — One Reservation Away.
          </Text>
        </View>
        <View className="w-full gap-8 justify-center items-center -top-32">
          <View className="w-full justify-center items-center">
            <Image
              source={require('@/assets/images/hewman.png')}
              className="-bottom-8 -left-1/4 w-full h-full max-w-md aspect-square"
              resizeMode="contain"
            />
            <SearchPanel />
          </View>

          {/* FIXME: only for testing */}
          <Button
            title={`receive notification! (${notiCounter})`}
            onPress={handleNotificationPress}
          />

          <CategoryRow />
          <RecommendedRestaurantGrid />
        </View>
      </View>
    </ScrollView>
  );
}
