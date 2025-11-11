import ChatArea from '@/components/chat/ChatArea';
import ChatChannelList from '@/components/chat/ChatChannelList';
import { Text, View } from 'react-native';

export default function ChatsAdminPage() {
  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r">
        <Text className="text-2xl font-bold mb-4">Support</Text>
        <ChatChannelList
          chatList={[
            {
              id: 1,
              userId: 101,
              userName: 'Alice Johnson',
            },
            {
              id: 2,
              userId: 102,
              userName: 'Brian Lee',
            },
            {
              id: 3,
              userId: 103,
              userName: 'Chloe Martinez',
            },
          ]}
        />
      </View>
      <View className="flex-1 h-full ">
        <ChatArea
          id={59}
          username="potate59"
          messages={[
            {
              id: 1,
              chatId: 59,
              text: 'โต๊ะที่จองเป็นโต๊ะตรงไหนหรอครับ',
              createdAt: '17:12',
              senderId: 123,
            },
          ]}
        />
      </View>
    </View>
  );
}
