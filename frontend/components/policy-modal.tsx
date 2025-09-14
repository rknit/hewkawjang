import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import BaseModal from './base-modal';
import FormButton from './form-button';
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
    <BaseModal visible={visible} onClose={onClose} width="full" height="tall">
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold" style={{ color: brand.text }}>
          {title}
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="mb-6" showsVerticalScrollIndicator={true}>
        <Text className="text-base leading-6" style={{ color: brand.text }}>
          {content}
        </Text>
      </ScrollView>

      {/* Footer */}
      <FormButton title="Close" onPress={onClose} />
    </BaseModal>
  );
}
