import { Text, TouchableOpacity } from 'react-native';

interface SimpleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SimpleButton({
  title,
  onPress,
  disabled = false,
  className = '',
}: SimpleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-[#FEF9F3] rounded py-2 border border-gray-400 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <Text className="text-black font-bold text-center text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
