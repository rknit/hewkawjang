import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface TextFieldProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export default function TextField({
  label,
  value,
  onValueChange,
  disabled = false,
  error,
  required = false,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  ...textInputProps
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyles = () => {
    const baseStyles =
      'text-sm sm:text-base w-full px-3 py-1 rounded-md border';

    if (disabled) {
      return `${baseStyles} text-gray-500 bg-gray-50 border-gray-200 cursor-not-allowed`;
    }

    if (error) {
      return `${baseStyles} text-black bg-red-50 border-red-500`;
    }

    if (isFocused) {
      return `${baseStyles} text-black bg-[#FEF9F3] border-[#8B5A3C]`;
    }

    return `${baseStyles} text-black bg-[#FEF9F3] border-[#AD754C]`;
  };

  return (
    <View className={`flex flex-col gap-2 ${containerClassName}`}>
      <Text
        className={`text-sm sm:text-base font-medium text-gray-700 ${labelClassName}`}
      >
        {label}
        {required && <Text className="text-red-500 ml-1">*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onValueChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        className={`${getInputStyles()} ${inputClassName}`}
        {...textInputProps}
      />
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
