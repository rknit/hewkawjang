import { fetchAdminChats, fetchAdminChatMessages } from '@/apis/chat.api';
import ChatArea from '@/components/chat/ChatArea';
import ChatChannelList from '@/components/chat/ChatChannelList';
import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import AdminChatArea from '@/components/chat/AdminChatArea';
import { 
  AdminChatChannel,
  AdminChatMessage
} from '@/types/chat.type';

export default function ChatsAdminPage() {
  const [chatList, setChatList] = useState<AdminChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatAdminId, setChatAdminId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const data = await fetchAdminChats(1);
        console.log(data);
        setChatList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  useEffect(() => {
    if (chatAdminId == null){
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        const data = await fetchAdminChatMessages(chatAdminId);
        console.log(data);
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [chatAdminId]);

  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r">
        <Text className="text-2xl font-bold mb-4">Support</Text>
        {loading 
          ? <View><Text>Loading chats...</Text></View>  // while loading
          : <ChatChannelList chatList={chatList} chatAdminId={chatAdminId} setChatAdminId={setChatAdminId}/>  // when loaded
        }
      </View>
      <View className="flex-1 h-full ">
        {chatAdminId === null ? 
          <View></View>:
          <AdminChatArea
            adminChatChannel={
              chatList.find(chat => chat.chatId === chatAdminId)
            }
            messages={messages}
          />
        }
        
      </View>
    </View>
  );
}
