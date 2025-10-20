import SearchPanel from '@/components/search-panel';
import { Image, ScrollView, Text, View } from 'react-native';

export default function HomePageTemplate({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 gap-4 w-full bottom-8">
        <View className="pt-14 w-full justify-center items-center gap-4 -bottom-12">
          <Text className="right-40 text-4xl text-[#E05910]">HEW KAW JANG</Text>
          <Text className="left-10 text-xl">
            From Hunger to Happiness — One Reservation Away.
          </Text>
        </View>
        <View className="w-full gap-8 justify-center items-center">
          <View className="w-full justify-center items-center">
            <Image
              source={require('@/assets/images/hewman.png')}
              className="-bottom-7 -left-1/4"
              resizeMode="contain"
              style={{ width: 128, height: 128 }}
            />
            <SearchPanel />
          </View>
          {children}
        </View>
      </View>
    </ScrollView>
  );
}
