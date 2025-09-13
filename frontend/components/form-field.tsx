import React from 'react';
import { View, Text, KeyboardTypeOptions } from 'react-native';
import SimpleTextField from './simple-text-filed';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
}: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">
        {label} {required && '*'}
      </Text>
      <SimpleTextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
