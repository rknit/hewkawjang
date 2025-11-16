import { useUser } from '@/hooks/useUser';
import { ChatMessage } from '@/types/chat.type';
import { useEffect, useRef, useState } from 'react';
import { FiPaperclip, FiFlag } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { sendMessage } from '@/apis/chat.api';
import { reportMessage } from '@/apis/report.api';

interface ChatAreaProps {
  id: number;
  username: string;
  messages: ChatMessage[];
  onSend?: (text: string) => Promise<void>;
}

export default function ChatArea({
  id,
  username,
  messages,
  onSend,
}: ChatAreaProps) {
  const { user } = useUser();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSendText = async () => {
    const t = text.trim();
    if (!t) return;
    if (onSend) await onSend(t);
    setText('');
  };

  const handleAttachImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (uri) {
        await sendMessage(id, user.id, '', uri);
      }
    }
  };

  const handleReport = async (messageId: number) => {
    try {
      await reportMessage(messageId);
      alert('Message reported');
    } catch (e) {
      alert('Failed to report this message');
    }
  };

  return (
    <View className="flex-1">
      {/* Header similar to AdminChatArea */}
      <View className="flex-row items-center gap-3 bg-[#f7d6c2] px-4 py-3 border-b border-[#e2b8a0]">
        <View className="w-8 h-8 bg-gray-400 rounded-full" />
        <Text className="font-semibold text-gray-800">
          {username || `Chat ${id}`}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-3 py-2" ref={scrollRef}>
        {messages.map((msg) => {
          const isOwn = msg.senderId === user.id; // own -> right
          return (
            <View
              key={msg.id}
              className={`flex flex-row w-full my-2 ${
                isOwn ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isOwn && (
                <TouchableOpacity
                  className="justify-start mr-2 mt-2"
                  onPress={() => handleReport(msg.id)}
                  accessibilityLabel="Report message"
                >
                  <FiFlag size={18} color="#9b1c1c" />
                </TouchableOpacity>
              )}

              {/* Column wrapper to place time UNDER the bubble */}
              <View
                className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`w-auto px-3 py-2 rounded-xl ${
                    isOwn
                      ? 'bg-[#e4bda5] rounded-br-none' // own (right)
                      : 'bg-[#fffaf8] rounded-bl-none' // incoming (left)
                  }`}
                >
                  {msg.imgURL ? (
                    <Image
                      source={{ uri: msg.imgURL }}
                      className="w-60 h-60 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                  ) : null}
                  {msg.text ? (
                    <Text className="text-gray-800">{msg.text}</Text>
                  ) : null}
                </View>

                {/* Time outside and under the bubble */}
                <Text className="text-xs text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input bar */}
      <View className="flex-row items-center gap-2 border-t border-gray-300 bg-[#f7d6c2] px-3 py-2">
        <TouchableOpacity className="p-2" onPress={handleAttachImage}>
          <FiPaperclip size={20} color="#555" />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-3 py-2 text-gray-700"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity className="p-2" onPress={handleSendText}>
          <IoSend size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
