import { View, Text, TouchableOpacity } from 'react-native';

interface SimpleAlertProps {
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'warning' | 'info';
}

export default function SimpleAlert({
  title,
  message,
  buttonText = 'OK',
  onClose,
  type = 'error',
}: SimpleAlertProps) {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-500', icon: '✓' };
      case 'warning':
        return { bg: 'bg-yellow-500', icon: '!' };
      case 'info':
        return { bg: 'bg-blue-500', icon: 'i' };
      case 'error':
      default:
        return { bg: 'bg-red-500', icon: '!' };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg max-w-sm">
      {/* Header with Icon and Title */}
      <View className="flex-row items-center justify-center mb-6">
        <View
          className={`w-8 h-8 ${iconConfig.bg} rounded-full flex items-center justify-center mr-3`}
        >
          <Text className="text-white font-bold text-lg">
            {iconConfig.icon}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-black">{title}</Text>
      </View>

      {/* Message */}
      <View className="mb-6">
        <Text className="text-gray-600 text-center text-base leading-6">
          {message}
        </Text>
      </View>

      {/* Single Action Button */}
      <TouchableOpacity
        className="bg-[#8B5A3C] py-4 rounded-xl"
        onPress={onClose}
      >
        <Text className="text-white font-medium text-center text-base">
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
