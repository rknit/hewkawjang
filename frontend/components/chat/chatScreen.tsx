import { fetchAllChats, fetchChatMessages, sendMessage } from '@/apis/chat.api';
import ChatArea from '@/components/chat/ChatArea';
import { useUser } from '@/hooks/useUser';
import { ChatChannel, ChatMessage } from '@/types/chat.type';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function ChatsUserPage() {
  const { user } = useUser(); // ensure useAuth returns userId and token
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch user chat channels
  const loadChannels = async () => {
    if (!user?.id) return;
    const data = await fetchAllChats(user?.id);
    setChannels(data);
  };

  // Fetch messages of the selected chat
  const loadMessages = async (chatId: number) => {
    const data = await fetchChatMessages(chatId);
    setMessages(data);
  };

  // Auto-fetch channels every 5 seconds
  useEffect(() => {
    loadChannels();
    const interval = setInterval(loadChannels, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Auto-fetch messages every 3 seconds
  useEffect(() => {
    if (selectedChatId === null) return;
    loadMessages(selectedChatId);
    const poll = setInterval(() => loadMessages(selectedChatId), 3000);
    return () => clearInterval(poll);
  }, [selectedChatId]);

  // Select a chat channel
  const handleSelectChannel = (channel: ChatChannel) => {
    setSelectedChatId(channel.id);
    setSelectedChatName(
      channel.restaurantName ?? channel.userName ?? `Chat ${channel.id}`,
    );
  };

  // Send a message
  const handleSend = async (text: string) => {
    if (!selectedChatId || !user?.id) return;
    await sendMessage(selectedChatId, user?.id, text);
    loadMessages(selectedChatId);
  };

  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r">
        <Text className="text-2xl font-bold mb-4">Chats</Text>
        <FlatList
          data={channels}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="px-3 py-3 border-b"
              onPress={() => handleSelectChannel(item)}
            >
              <Text className="font-semibold">
                {item.restaurantName ?? item.userName ?? `Chat ${item.id}`}
              </Text>
              {item.lastMessage && (
                <Text className="text-sm text-gray-600">
                  {item.lastMessage}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <View className="flex-1 h-full">
        {selectedChatId ? (
          <ChatArea
            id={selectedChatId}
            username={selectedChatName ?? ''}
            messages={messages}
            onSend={handleSend}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              Select a chat to view messages
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
