import { useUser } from '@/hooks/useUser';
import { ChatMessage } from '@/types/chat.type';
import { useState } from 'react';
import { FaRegSmile } from 'react-icons/fa';
import { FiPaperclip } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CenteredLoadingIndicator from '../centeredLoading';

interface ChatAreaProps {
  id: number;
  username: string;
  messages: ChatMessage[];
  onSend?: (text: string) => Promise<void>;
}

export default function ChatArea({ id, messages, onSend }: ChatAreaProps) {
  const [text, setText] = useState('');
  const { user } = useUser();
  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    if (onSend) {
      await onSend(t);
    }
    setText('');
  };
  if (!user) {
    return <CenteredLoadingIndicator />;
  }
  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center gap-3 bg-[#f7d6c2] px-4 py-3 border-b border-[#e2b8a0]">
        <View className="w-8 h-8 bg-gray-400 rounded-full" />
        <Text className="font-semibold text-gray-800">Chat ID: {id}</Text>
      </View>

      {/* Chat messages */}
      <ScrollView className="flex-1 px-3 py-2">
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`w-full my-2 ${msg.senderId === user!.id ? 'items-end' : 'items-start'}`}
          >
            {msg.imgURL ? (
              <Image
                source={{ uri: msg.imgURL }}
                className="w-60 h-60 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View
                className={`max-w-[75%] rounded-xl px-3 py-2 $$
                  {msg.sender === "me"
                    ? "bg-[#e4bda5] rounded-br-none"
                      : "bg-[#fffaf8] rounded-bl-none"
                  }`}
              >
                <Text className="text-gray-800">{msg.text}</Text>
              </View>
            )}
            <Text className="text-xs text-gray-500 mt-1">{msg.createdAt}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View className="flex-row items-center gap-2 border-t border-gray-300 bg-[#f7d6c2] px-3 py-2">
        <TouchableOpacity className="p-2">
          <FaRegSmile size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity className="p-2">
          <FiPaperclip size={20} color="#555" />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-3 py-2 text-gray-700"
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity className="p-2" onPress={handleSend}>
          <IoSend size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
