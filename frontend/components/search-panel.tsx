import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function SearchPanel() {
  return (
    <View className="flex-row items-center bg-[#F5E6D3] rounded-2xl px-4 h-14 my-4 shadow-sm w-2/3 self-center">
      {/* Magnifying Glass Icon */}
      <Icon
        name="search"
        size={22}
        color="#8B5C2A"
        style={{ marginRight: 10 }}
      />

      {/* Search Input */}
      <TextInput
        className="flex-1 text-[16px] text-[#8B5C2A] p-0 focus:outline-none"
        placeholder="Search for reservations..."
        placeholderTextColor="#A67C52"
        editable={false}
      />

      {/* Option Icon */}
      <TouchableOpacity className="ml-3 p-1">
        <Icon name="sliders" size={22} color="#8B5C2A" />
      </TouchableOpacity>

      {/* Calendar Icon */}
      <TouchableOpacity className="ml-3 p-1">
        <Icon name="calendar" size={22} color="#8B5C2A" />
      </TouchableOpacity>
    </View>
  );
}
