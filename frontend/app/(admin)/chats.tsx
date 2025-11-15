import { fetchAdminChats, fetchAdminChatMessages, createAdminChatMessage } from '@/apis/chat.api';
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
  const [messageText, setMessageText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!messageText.trim() && !attachedImage) return; // nothing to send

    const newMessage = await createAdminChatMessage(
      chatAdminId!,
      "admin",
      messageText.trim() || null, // text can be null
      attachedImage || null       // image can be null
    );

    setMessages(prev => [...prev, newMessage]);
    setMessageText("");
    setAttachedImage(null); // reset after sending
  };

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
            value = {messageText}
            onChangeText={setMessageText}
            onPress={handleSend}
          />
        }
        
      </View>
    </View>
  );
}
