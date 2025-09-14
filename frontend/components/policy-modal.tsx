import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { reservationTheme as brand } from '../utils/theme';

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function PolicyModal({
  visible,
  onClose,
  title,
  content,
}: PolicyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] max-h-[80%] rounded-2xl p-6"
          style={{
            backgroundColor: brand.bg,
            borderWidth: 2,
            borderColor: brand.modalBorder,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold" style={{ color: brand.text }}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-2xl" style={{ color: brand.text }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
            <Text className="text-base leading-6" style={{ color: brand.text }}>
              {content}
            </Text>
          </ScrollView>

          {/* Footer */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="rounded-xl items-center py-4"
              style={{
                backgroundColor: brand.primary,
              }}
            >
              <Text className="font-bold text-white text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
