import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { FaRegSmile } from 'react-icons/fa';
import { FiPaperclip } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import { AdminChatChannel, AdminChatMessage } from '@/types/chat.type';
import { useRef, useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { DateTime } from "luxon";

interface AdminChatAreaProps {
  owner: 'admin'|'user'
  adminChatChannel: AdminChatChannel;
  messages: AdminChatMessage[];
  value: string;
  onChangeText: (text: string) => void;
  onPress: () => void;
  attachedImage: string|null;
  onChangeAttachedImage: (uri:string|null) => void;
}

export function formatMessageTime(iso: string) {
  const dt = DateTime.fromISO(iso).setZone("UTC+7");

  return {
    date: dt.toFormat("yyyy-MM-dd"),  
    time: dt.toFormat("HH:mm"),     
  };
}


export default function AdminChatArea({
  owner,
  adminChatChannel,
  messages,
  value,
  onChangeText,
  onPress,
  attachedImage,
  onChangeAttachedImage
}: AdminChatAreaProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [previewImg, setPreviewImg] = useState<string|null>(null);

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
      if (uri) {
        onChangeAttachedImage(uri); // store the URI in parent
      }
    }
  };

  return (
    <View className="flex-1">

      <Modal
        visible={!!previewImg}
        transparent={true}
        onRequestClose={() => setPreviewImg(null)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <TouchableOpacity 
            className="absolute inset-0"
            onPress={() => setPreviewImg(null)}
          />

          {previewImg && (
            <Image
              source={{ uri: previewImg }}
              className="w-[90%] h-[70%] rounded-lg"
              resizeMode="contain"
            />
          )}

          <TouchableOpacity
            onPress={() => setPreviewImg(null)}
            className="absolute top-10 right-5 bg-white rounded-full p-2"
          >
            <Text className="text-black text-lg font-bold">✕</Text>
          </TouchableOpacity>
          
        </View>
      </Modal>

      {/* Header */}
      <View className="flex-row items-center gap-3 bg-[#f7d6c2] px-4 py-3 border-b border-[#e2b8a0]">
        {adminChatChannel.profileUrl ? (
          <Image
            source={{ uri: adminChatChannel.profileUrl }}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <View className="w-8 h-8 bg-gray-400 rounded-full" />
        )}
        <Text className="font-semibold text-gray-800">
          {adminChatChannel.displayName}
        </Text>
      </View>

      {/* Chat messages */}
      <ScrollView 
        ref={scrollRef}
        className="flex-1 px-3 py-2"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => {
          const { date, time } = formatMessageTime(msg.createdAt);

          return (
          <View
            key={msg.id}
            className={`w-full my-2 ${msg.senderRole === owner ? 'items-end' : 'items-start'}`}
          >
            {msg.imgURL && (
              <TouchableOpacity onPress={() => setPreviewImg(msg.imgURL)}>
                <Image
                  source={{ uri: msg.imgURL }}
                  className="w-60 h-60 rounded-lg mb-1"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            
            {msg.text && (
              <View
                className={`max-w-[75%] rounded-xl px-3 py-2 ${
                  msg.senderRole === 'admin'
                    ? 'bg-[#e4bda5] rounded-br-none'
                    : 'bg-[#fffaf8] rounded-bl-none'
                }`}
              >
                <Text className="text-gray-800">{msg.text}</Text>
              </View>
            )}

            <Text className="text-xs text-gray-500 mt-1">{time}</Text>
            <Text className="text-xs text-gray-500">{date}</Text>
          </View>

        )})}
      </ScrollView>

      {/* Input bar */}
      <View className="border-t border-gray-300 bg-[#f7d6c2] px-3 py-2">
        {/* Image preview if attached */}
        {attachedImage && (
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: attachedImage }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="ml-2 p-2 bg-gray-300 rounded-full"
              onPress={() => onChangeAttachedImage(null)} // clear the attached image
            >
              <Text className="text-white font-bold">X</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="p-2" onPress={handleAttachImage}>
            <FiPaperclip size={20} color="#555" />
          </TouchableOpacity>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Type a message..."
            className="flex-1 bg-white rounded-full px-3 py-2 text-gray-700"
            returnKeyType="send"
            onSubmitEditing={onPress}
            onKeyPress={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                onPress();
                e.preventDefault();
              }
            }}
          />

          <TouchableOpacity className="p-2" onPress={onPress}>
            <IoSend size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}
