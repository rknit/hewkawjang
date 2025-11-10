import ChatScreen from '@/components/chat/chatScreen';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function ChatPage() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user, isLoading } = useAuth();

  // Wait for user to be loaded
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-gray-500">Loading chat...</Text>
      </View>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-700 text-lg">
          Please log in to access your chat.
        </Text>
      </View>
    );
  }

  return (
    <ChatScreen
      chatId={Number(chatId)}
      chatName={`Chat #${chatId}`}
      userId={user.id}
    />
  );
}
