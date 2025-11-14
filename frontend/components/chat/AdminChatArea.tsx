import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { FaRegSmile } from "react-icons/fa";   
import { FiPaperclip } from "react-icons/fi"; 
import { IoSend } from "react-icons/io5";   
import { AdminChatChannel, AdminChatMessage } from "@/types/chat.type";
import { useRef, useEffect } from "react";
import {launchImageLibrary} from "react-native-image-picker"

interface AdminChatAreaProps {
  adminChatChannel: AdminChatChannel;
  messages: AdminChatMessage[]; 
  value: string;
  onChangeText: (text: string) => void;
  onPress: () => void;
  onSendImage?: (imageUri: string) => void;
}

export default function AdminChatArea({ 
  adminChatChannel, 
  messages, 
  value,
  onChangeText,
  onPress, 
  onSendImage
}: AdminChatAreaProps) {

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleAttachImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (uri && onSendImage) {
        onSendImage(uri);
      }
    }
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center gap-3 bg-[#f7d6c2] px-4 py-3 border-b border-[#e2b8a0]">
        {adminChatChannel.profileUrl ? (
            <Image
                source={{ uri: adminChatChannel.profileUrl }}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <View  className="w-8 h-8 bg-gray-400 rounded-full"/>
        )}
        <Text className="font-semibold text-gray-800">{adminChatChannel.displayName}</Text>
      </View>

      {/* Chat messages */}
      <ScrollView className="flex-1 px-3 py-2">
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`w-full my-2 ${msg.senderRole === "admin" ? "items-end" : "items-start"}`}
          >
            {msg.imgURL ? (
              <Image
                source={{ uri: msg.imgURL }}
                className="w-60 h-60 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View
                className={`max-w-[75%] rounded-xl px-3 py-2 ${
                  msg.senderRole === "admin"
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

        <TouchableOpacity className="p-2" onPress={handleAttachImage}>
          <FiPaperclip size={20} color="#555" />
        </TouchableOpacity>

        <TextInput
          value = {value}
          onChangeText={onChangeText}
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-3 py-2 text-gray-700"
        />

        <TouchableOpacity className="p-2" onPress={onPress}>
          <IoSend size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
