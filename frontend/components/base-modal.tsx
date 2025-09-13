import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface BaseModalProps {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function BaseModal({
  visible,
  onClose,
  children,
  showCloseButton = true,
}: BaseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white/70 justify-center items-center">
        <View className="bg-white border-[#E05910] rounded-2xl p-6 mx-4 shadow-lg max-w-md w-full border relative">
          {/* Close button */}
          {showCloseButton && onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 z-10"
            >
              <Text className="text-2xl text-gray-500">{'×'}</Text>
            </TouchableOpacity>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
}
