// components/chat/ChatScreen.tsx
import axios from 'axios';
import { Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Message {
  id: number;
  content: string;
  senderUserId?: number;
  senderRestaurantId?: number;
  createdAt: string;
}

interface ChatScreenProps {
  chatId: number;
  chatName: string; // name of restaurant or user
  userId: number; // logged-in user
  token: string;
}

export default function ChatScreen({
  chatId,
  chatName,
  userId,
  token,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/chat/${chatId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // polling
    return () => clearInterval(interval);
  }, [chatId]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `http://localhost:8080/chat/${chatId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Chat Header */}
      <View className="bg-white py-4 px-6 border-b border-gray-200">
        <Text className="text-lg font-bold">{chatName}</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => {
          const isOutgoing = msg.senderUserId === userId;
          return (
            <View
              key={msg.id}
              className={`mb-3 flex ${
                isOutgoing ? 'items-end' : 'items-start'
              }`}
            >
              <Text className="text-xs text-gray-500 mb-1">
                {isOutgoing ? 'You' : 'Restaurant'}
              </Text>
              <View
                className={`px-4 py-2 rounded-lg max-w-3/4 ${
                  isOutgoing
                    ? 'bg-gray-200 rounded-tr-none'
                    : 'bg-gray-100 rounded-tl-none'
                }`}
              >
                <Text>{msg.content}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-center px-4 py-2 border-t border-gray-200 bg-white">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Send size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
