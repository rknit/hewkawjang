import React, { useState } from 'react';
import { Text, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';

interface UnderlinedPressableTextProps {
  text: string;
  onPress: () => void;
  textClassName?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export default function UnderlinedPressableText({
  text,
  onPress,
  textClassName = 'text-black text-base',
  textStyle,
  containerStyle,
  disabled = false,
}: UnderlinedPressableTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      setIsHovered(false);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
    }
  };

  const combinedTextStyle: TextStyle = {
    textDecorationLine: isHovered && !disabled ? 'underline' : 'none',
    opacity: disabled ? 0.5 : 1,
    ...textStyle,
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={containerStyle}
      disabled={disabled}
      {...({
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      } as any)}
    >
      <Text className={textClassName} style={combinedTextStyle}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}
