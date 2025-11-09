import ChatChannelList from '@/components/chat/ChatChannelList';
import ChatArea from '@/components/chat/ChatArea';
import { View, Text } from 'react-native';

export default function ChatsAdminPage() {
  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r"> 
        <Text className="text-2xl font-bold mb-4">
          Support
        </Text>
              <ChatChannelList
        chatList = {[
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
          }
        ]}
      />
      </View>
      <View className="flex-1 h-full ">
        <ChatArea
          id={59}
          username = "potate59"
          messages={[
            {
              messageId: 1,
              text: "โต๊ะที่จองเป็นโต๊ะตรงไหนหรอครับ",
              time: "17:12",
              sender: "me",
            },
            {
              messageId: 2,
              imgURL: "https://example.com/sample-table.jpg",
              time: "17:36",
              sender: "other",
            },
            {
              messageId: 3,
              text: "เป็นโต๊ะที่นั่งด้านนอกค่ะ คุณลูกค้า",
              time: "17:36",
              sender: "other",
            },
          ]}
        />
      </View>
    </View>
  );
}


