import { fetchAllChats, fetchChatMessages, sendMessage } from '@/apis/chat.api';
import {
  fetchUserAdminChats,
  fetchUserAdminChatMessages,
  sendAdminMessageAsUser,
} from '@/apis/chat.api';
import ChatArea from '@/components/chat/ChatArea';
import AdminChatArea from '@/components/chat/AdminChatArea';
import { useUser } from '@/hooks/useUser';
import {
  ChatChannel,
  ChatMessage,
  AdminChatChannel,
  AdminChatMessage,
} from '@/types/chat.type';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { uploadImage } from '@/apis/image.api';
import { createAdminChatMessage } from '@/apis/chat.api';

export default function ChatsUserPage() {
  const { user } = useUser();
  const params = useLocalSearchParams<{ adminChatId?: string }>();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [adminChannels, setAdminChannels] = useState<AdminChatChannel[]>([]);
  const [selectedKind, setSelectedKind] = useState<'user' | 'admin' | null>(
    null,
  );
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null); // user chat id
  const [selectedAdminChatId, setSelectedAdminChatId] = useState<number | null>(
    null,
  ); // admin chat id
  const [selectedChatName, setSelectedChatName] = useState<string | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminChatMessage[]>([]);
  const [adminInput, setAdminInput] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Heuristic: if user has a restaurant or role indicates restaurant, treat as restaurant viewer
  const isRestaurantViewer =
    Boolean((user as any)?.restaurantId) ||
    (user as any)?.role === 'restaurant' ||
    (user as any)?.role === 'restaurant_owner' ||
    (user as any)?.role === 'owner';

  const displayNameFor = (c: ChatChannel) => {
    // Prefer backend-computed name (other party)
    if (c.displayName) return c.displayName;

    if (user?.id && c.userId) {
      // If current user is the customer -> show restaurant; else show customer
      return user.id === c.userId
        ? (c.restaurantName ?? `Chat ${c.id}`)
        : (c.userName ?? `Chat ${c.id}`);
    }
    return c.userName ?? c.restaurantName ?? `Chat ${c.id}`;
  };

  const loadChannels = async () => {
    if (!user?.id) return;
    const data = await fetchAllChats(user.id);
    setChannels(data);
  };

  const loadAdminChannels = async () => {
    if (!user?.id) return;
    const data = await fetchUserAdminChats(user.id);
    setAdminChannels(data);
  };

  const sortChronological = <T extends { createdAt: string }>(arr: T[]) =>
    arr
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

  const loadMessages = async (chatId: number) => {
    const data = await fetchChatMessages(chatId);
    // Ensure oldest first -> newest last
    setMessages(sortChronological(data));
  };

  const loadAdminMessages = async (chatAdminId: number) => {
    const data = await fetchUserAdminChatMessages(chatAdminId);
    setAdminMessages(sortChronological(data));
  };

  useEffect(() => {
    loadChannels();
    loadAdminChannels();
    const interval = setInterval(() => {
      loadChannels();
      loadAdminChannels();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Keep header name in sync when channels refresh
  useEffect(() => {
    if (selectedKind === 'user' && selectedChatId != null) {
      const ch = channels.find((c) => c.id === selectedChatId);
      if (ch) setSelectedChatName(displayNameFor(ch));
    } else if (selectedKind === 'admin' && selectedAdminChatId != null) {
      const ch = adminChannels.find((c) => c.chatId === selectedAdminChatId);
      if (ch) setSelectedChatName(ch.displayName);
    }
  }, [
    channels,
    adminChannels,
    selectedKind,
    selectedChatId,
    selectedAdminChatId,
  ]);

  useEffect(() => {
    if (selectedKind === 'user' && selectedChatId != null) {
      loadMessages(selectedChatId);
      const poll = setInterval(() => loadMessages(selectedChatId), 3000);
      return () => clearInterval(poll);
    }
    if (selectedKind === 'admin' && selectedAdminChatId != null) {
      loadAdminMessages(selectedAdminChatId);
      const poll = setInterval(
        () => loadAdminMessages(selectedAdminChatId),
        3000,
      );
      return () => clearInterval(poll);
    }
  }, [selectedKind, selectedChatId, selectedAdminChatId]);

  const handleSelectUserChannel = (channel: ChatChannel) => {
    setSelectedKind('user');
    setSelectedChatId(channel.id);
    setSelectedAdminChatId(null);
    setAdminMessages([]);
    setSelectedChatName(displayNameFor(channel));
  };

  const handleSelectAdminChannel = (channel: AdminChatChannel) => {
    setSelectedKind('admin');
    setSelectedAdminChatId(channel.chatId);
    setSelectedChatId(null);
    setMessages([]);
    setSelectedChatName(channel.displayName);
  };

  const handleSend = async (text: string) => {
    if (!user?.id) return;
    if (selectedKind === 'user' && selectedChatId) {
      await sendMessage(selectedChatId, user.id, text);
      loadMessages(selectedChatId);
    } else if (selectedKind === 'admin' && selectedAdminChatId) {
      await sendAdminMessageAsUser(selectedAdminChatId, user.id, text);
      setAdminInput('');
      loadAdminMessages(selectedAdminChatId);
    }
  };

  const handleSendMessageToAdmin = async () => {
    if (!adminInput.trim() && !attachedImage) return; // nothing to send
    if (!selectedAdminChatId) return;

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
        selectedAdminChatId,
        'user',                  // senderRole
        adminInput.trim() || null, // text can be null
        uploadedUrl                 // image can be null if none attached
      );

      // Update the message list
      setAdminMessages(prev => [...prev, newMessage]);

      // Reset input fields
      setAdminInput('');
      setAttachedImage(null);

    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  useEffect(() => {
    // Preselect admin chat if a deep link param is provided
    const raw = params?.adminChatId;
    const adminChatId = raw ? Number(raw) : null;
    if (adminChatId && Number.isFinite(adminChatId)) {
      setSelectedKind('admin');
      setSelectedAdminChatId(adminChatId);
      setSelectedChatId(null);
    }
  }, [params?.adminChatId]);

  return (
    <View className="flex flex-row h-full">
      <View className="w-[30%] h-full p-4 border-r">
        <Text className="text-2xl font-bold mb-2">Chats</Text>

        <Text className="text-xs text-gray-500 mb-1">Restaurants</Text>
        <FlatList
          data={channels}
          keyExtractor={(item) => `user-${item.id}`}
          renderItem={({ item }) => {
            const name = displayNameFor(item);
            return (
              <TouchableOpacity
                className={`px-3 py-3 border-b ${selectedKind === 'user' && item.id === selectedChatId ? 'bg-slate-200' : ''}`}
                onPress={() => handleSelectUserChannel(item)}
              >
                <Text className="font-semibold">{name}</Text>
                {item.lastMessage && (
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
        />

        <Text className="text-xs text-gray-500 mt-4 mb-1">Admins</Text>
        <FlatList
          data={adminChannels}
          keyExtractor={(item) => `admin-${item.chatId}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-3 py-3 border-b ${selectedKind === 'admin' && item.chatId === selectedAdminChatId ? 'bg-slate-200' : ''}`}
              onPress={() => handleSelectAdminChannel(item)}
            >
              <Text className="font-semibold">{item.displayName}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View className="flex-1 h-full">
        {selectedKind === 'user' && selectedChatId ? (
          <ChatArea
            id={selectedChatId}
            username={selectedChatName ?? ''}
            messages={messages}
            onSend={handleSend}
          />
        ) : selectedKind === 'admin' && selectedAdminChatId ? (
          // Guard until the admin channel is available to avoid undefined access in AdminChatArea
          (() => {
            const selectedAdminChannel = adminChannels.find(
              (c) => c.chatId === selectedAdminChatId,
            );
            if (!selectedAdminChannel) {
              return (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-gray-500">Loading chat…</Text>
                </View>
              );
            }
            return (
              <AdminChatArea
                owner='user'
                adminChatChannel={selectedAdminChannel}
                messages={adminMessages}
                value={adminInput}
                onChangeText={setAdminInput}
                onPress={handleSendMessageToAdmin}
                attachedImage={attachedImage}
                onChangeAttachedImage={setAttachedImage}
              />
            );
          })()
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
