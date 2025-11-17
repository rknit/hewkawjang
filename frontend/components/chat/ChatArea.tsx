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
  Modal,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { reportMessage } from '@/apis/report.api';
import ConfirmationModal from '../ConfirmationModal';
import AlertModal from '../AlertModal';

interface ChatAreaProps {
  id: number;
  username: string;
  messages: ChatMessage[];
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  attachedImage: string | null;
  onChangeAttachedImage: (uri: string | null) => void;
  avatarUrl?: string;
}

export default function ChatArea({
  id,
  username,
  messages,
  value,
  onChangeText,
  onSend,
  attachedImage,
  onChangeAttachedImage,
  avatarUrl,
}: ChatAreaProps) {
  const { user } = useUser();
  const scrollRef = useRef<ScrollView>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [messageToReport, setMessageToReport] = useState<number | null>(null);

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

  const handleAttachImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (uri) onChangeAttachedImage(uri);
    }
  };

  const handleSend = () => {
    if (!value.trim() && !attachedImage) return;
    onSend();
  };

  const onConfirmReport = () => {
    if (messageToReport === null) return true;

    handleReport(messageToReport);
    setShowReportConfirm(false);
    setShowReportAlert(true);
  };

  const handleReport = async (messageId: number) => {
    try {
      // console.log('[DEBUG] Message reported successfully for id:', messageId);
      await reportMessage(messageId); // call backend to create the report
    } catch (e) {
      console.error('Failed to report message', e);
      // alert('Failed to report this message');
    }
  };

  return (
    <>
      <View className="flex-1">
        <Modal
          visible={!!previewImg}
          transparent
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
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <View className="w-8 h-8 bg-gray-400 rounded-full" />
          )}
          <Text className="font-semibold text-gray-800">
            {username || `Chat ${id}`}
          </Text>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-3 py-2" ref={scrollRef}>
          {messages.map((msg) => {
            const isOwn = msg.senderId === user.id;
            return (
              <View
                key={msg.id}
                className={`flex flex-row w-full my-2 ${
                  isOwn ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isOwn && (
                  <TouchableOpacity
                    className="justify-start mr-2 mt-2 opacity-50 hover:opacity-100 transition-opacity"
                    onPress={() => {
                      setMessageToReport(msg.id);
                      setShowReportConfirm(true);
                    }}
                    accessibilityLabel="Report message"
                  >
                    <FiFlag size={16} color="#9b1c1c" />
                  </TouchableOpacity>
                )}

                <View
                  className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className={`w-auto px-3 py-2 rounded-xl ${
                      isOwn
                        ? 'bg-[#e4bda5] rounded-br-none'
                        : 'bg-[#fffaf8] rounded-bl-none'
                    }`}
                  >
                    {msg.imgURL ? (
                      <TouchableOpacity
                        onPress={() => setPreviewImg(msg.imgURL!)}
                      >
                        <Image
                          source={{ uri: msg.imgURL }}
                          className="w-60 h-60 rounded-lg mb-2"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : null}
                    {msg.text ? (
                      <Text className="text-gray-800">{msg.text}</Text>
                    ) : null}
                  </View>
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
        <View className="border-t border-gray-300 bg-[#f7d6c2] px-3 py-2">
          {attachedImage && (
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                onPress={() => setPreviewImg(attachedImage)}
                accessibilityLabel="Preview image"
              >
                <Image
                  source={{ uri: attachedImage }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 p-2 bg-gray-300 rounded-full"
                onPress={() => onChangeAttachedImage(null)}
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
              placeholder="Type a message..."
              className="flex-1 bg-white rounded-full px-3 py-2 text-gray-700"
              value={value}
              onChangeText={onChangeText}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity className="p-2" onPress={handleSend}>
              <IoSend size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ConfirmationModal
        visible={showReportConfirm}
        title="Do you really want to report this message"
        onConfirm={onConfirmReport}
        onCancel={() => setShowReportConfirm(false)}
        message="Are you sure you want to report this message?"
      />
      <AlertModal
        visible={showReportAlert}
        title="You've successfully reported this message"
        onClose={() => setShowReportAlert(false)}
        message="Message reported successfully."
      />
    </>
  );
}
