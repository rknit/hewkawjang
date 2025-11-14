import { useUser } from '@/hooks/useUser';
import { ChatMessage } from '@/types/chat.type';
import { useState } from 'react';
import { FaRegSmile } from 'react-icons/fa';
import { FiPaperclip } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import { reportMessage } from '@/apis/report.api';
import { FaFlag } from 'react-icons/fa';
import {
  Image,
  Modal,
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
  const [reportingMsgId, setReportingMsgId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    if (onSend) {
      await onSend(t);
    }
    setText('');
  };

  const handleReport = async () => {
    await reportMessage(reportingMsgId!); // You can send reportReason to backend if supported
    setModalVisible(false);
    setReportReason('');
    setReportingMsgId(null);
    alert('Message reported!');
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
            className={`w-full my-2 flex-row items-center ${
              msg.senderId === user!.id ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Message bubble */}
            <View
              className={`max-w-[75%] rounded-xl px-3 py-2 ${
                msg.senderId === user!.id
                  ? 'bg-[#e4bda5] rounded-br-none'
                  : 'bg-[#fffaf8] rounded-bl-none'
              }`}
            >
              <Text className="text-gray-800">{msg.text}</Text>
              <Text className="text-xs text-gray-500 mt-1">
                {msg.createdAt}
              </Text>
            </View>
            {/* Flag button for messages not sent by the current user */}
            {msg.senderId !== user.id && (
              <TouchableOpacity
                onPress={() => {
                  setReportingMsgId(msg.id);
                  setModalVisible(true);
                }}
                style={{
                  marginLeft: 8,
                  padding: 4,
                  alignSelf: 'center',
                }}
              >
                <FaFlag size={18} color="#e05910" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}
          >
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Do you really want to report this message?
            </Text>
            <Text
              style={{
                fontStyle: 'italic',
                color: '#333',
                marginBottom: 16,
                backgroundColor: '#f7f7f7',
                padding: 8,
                borderRadius: 6,
              }}
            >
              {messages.find((msg) => msg.id === reportingMsgId)?.text ||
                '[Message not found]'}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  marginRight: 10,
                  padding: 8,
                }}
              >
                <Text style={{ color: '#888' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReport}
                style={{
                  backgroundColor: '#e05910',
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#fff' }}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
