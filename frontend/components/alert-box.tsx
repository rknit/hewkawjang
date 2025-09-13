import { View, Text, TouchableOpacity, Pressable } from 'react-native';

interface AlertBoxProps {
  title: string;
  message: string;
  email?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText: string;
  cancelText: string;
  showCheckbox?: boolean;
  checkboxText?: string;
  isChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}

export default function AlertBox({
  title,
  message,
  email,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  showCheckbox = false,
  checkboxText,
  isChecked = false,
  onCheckboxChange,
}: AlertBoxProps) {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const isConfirmDisabled = showCheckbox && !isChecked;

  return (
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg">
      {/* Header with Warning Icon and Title */}
      <View className="flex-row items-center justify-center mb-6">
        <View className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">!</Text>
        </View>
        <Text className="text-xl font-semibold text-black">{title}</Text>
      </View>

      {/* Message */}
      <View className="mb-6">
        <Text className="text-gray-600 text-center text-base leading-6">
          {message}
          {email && (
            <>
              {'\n'}
              <Text className="font-semibold text-black">{email}</Text>
              <Text>?</Text>
            </>
          )}
        </Text>
      </View>

      {/* Checkbox */}
      {showCheckbox && (
        <Pressable
          className="flex-row items-center mb-6"
          onPress={() => onCheckboxChange?.(!isChecked)}
          style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
        >
          <View className="w-5 h-5 mr-3 flex-shrink-0">
            <View className="w-full h-full border-2 rounded bg-white border-gray-300">
              <Text
                className={`text-xs text-center leading-4 ${
                  isChecked ? 'text-blue-800' : 'text-transparent'
                }`}
              >
                ✓
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm flex-1 leading-5">
            {checkboxText}
          </Text>
        </Pressable>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl ${
            isConfirmDisabled ? 'bg-gray-300' : 'bg-red-400'
          }`}
          onPress={isConfirmDisabled ? undefined : handleConfirm}
          disabled={isConfirmDisabled}
        >
          <Text
            className={`font-medium text-center text-base ${
              isConfirmDisabled ? 'text-gray-500' : 'text-white'
            }`}
          >
            {confirmText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-gray-400 py-4 rounded-xl"
          onPress={onCancel}
        >
          <Text className="text-white font-medium text-center text-base">
            {cancelText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
