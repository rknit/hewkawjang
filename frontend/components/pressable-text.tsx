import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AuthLinkProps {
  text: string;
  linkText: string;
  onPress: () => void;
}

export default function PressableText({
  text,
  linkText,
  onPress: onLinkPress,
}: AuthLinkProps) {
  return (
    <View className="flex-row justify-center">
      <Text className="text-gray-600">{text} </Text>
      <TouchableOpacity onPress={onLinkPress}>
        <Text className="text-[#8B5A3C] font-semibold">{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}
