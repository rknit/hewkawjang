import { fetchAdminChats, fetchAdminChatMessages, createAdminChatMessage } from '@/apis/chat.api';
import ChatChannelList from '@/components/chat/ChatChannelList';
import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import AdminChatArea from '@/components/chat/AdminChatArea';
import { 
  AdminChatChannel,
  AdminChatMessage
} from '@/types/chat.type';
import { uploadImage } from '@/apis/image.api';
import { supabase } from '@/utils/supabase';

export default function ChatsAdminPage() {
  const [chatList, setChatList] = useState<AdminChatChannel[]>([]);
  const [chatAdminId, setChatAdminId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleSendMessage = async () => {
    if (!messageText.trim() && !attachedImage) return; // nothing to send
    if (!chatAdminId) return;

    try {
      let uploadedUrl: string | null = null;

      // If an image is attached, upload it
      if (attachedImage) {
        const response = await fetch(attachedImage);
        const blob = await response.blob();
        const fileId = String(Date.now());
        uploadedUrl = await uploadImage(blob, fileId);
      }

      // Create a chat message with text and/or image
      const newMessage = await createAdminChatMessage(
        chatAdminId,
        'admin',                  // senderRole
        messageText.trim() || null, // text can be null
        uploadedUrl                 // image can be null if none attached
      );

      // Update the message list
      setMessages(prev => [...prev, newMessage]);

      // Reset input fields
      setMessageText('');
      setAttachedImage(null);

    } catch (err) {
      console.error('Failed to send message', err);
    }
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
        setLoadingChats(false);
      }
    }

    fetchChats();
  }, []);

  useEffect(() => {
    if (chatAdminId == null){
      setMessages([]);
      setLoadingMessages(false);
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
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [chatAdminId]);

  useEffect(() => {
    if (!chatAdminId) return;

    const channel = supabase
      .channel("admin_chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_message",
          filter: `chat_admin_id=eq.${chatAdminId}`
        },
        async (payload) => {
          console.log("Realtime change detected:", payload);
          async function fetchMessages() {
            try {
              const data = await fetchAdminChatMessages(chatAdminId);
              console.log(data);
              setMessages(data);
            } catch (err) {
              console.error(err);
            } finally {
              setLoadingMessages(false);
            }
          }

          fetchMessages();
        }
      )
      .subscribe((status) => console.log("Realtime status:", status));
  }, [chatAdminId]);


  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r">
        <Text className="text-2xl font-bold mb-4">Support</Text>
        {loadingChats
          ? <View><Text>Loading chats...</Text></View>  // while loading
          : <ChatChannelList chatList={chatList} chatAdminId={chatAdminId} setChatAdminId={setChatAdminId}/>  // when loaded
        }
      </View>
      <View className="flex-1 h-full ">
        {chatAdminId === null ? 
          <View></View>:
          <AdminChatArea
            owner = 'admin'
            adminChatChannel={
              chatList.find(chat => chat.chatId === chatAdminId)!
            }
            messages={messages}
            value = {messageText}
            onChangeText={setMessageText}
            onPress={handleSendMessage}
            attachedImage={attachedImage}
            onChangeAttachedImage={setAttachedImage}
          />
        }
        
      </View>
    </View>
  );
}
