import { TextInput, View, TextInputProps } from 'react-native';

interface SimpleTextFieldProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SimpleTextField({
  value,
  onChangeText,
  placeholder,
  ...props
}: SimpleTextFieldProps) {
  return (
    <View className="mb-2">
      <TextInput
        className="border rounded px-3 py-2 bg-white"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
}
