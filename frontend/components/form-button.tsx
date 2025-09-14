import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export default function FormButton({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  loadingText,
}: FormButtonProps) {
  const isDisabled = disabled || isLoading;
  const displayText = isLoading && loadingText ? loadingText : title;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`bg-[#8B5A3C] rounded-lg py-3 px-4 mb-6 ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-white text-center font-semibold text-lg">
        {displayText}
      </Text>
    </TouchableOpacity>
  );
}
