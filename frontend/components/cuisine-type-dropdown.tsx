import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';

interface CuisineTypeDropdownProps {
  selectedCuisines: string[];
  onChange: (cuisines: string[]) => void;
  onClose: () => void;
}

const CUISINE_OPTIONS = ['Buffet', 'Chinese', 'Japanese', 'Indian', 'Italian'];

export default function CuisineTypeDropdown({
  selectedCuisines,
  onChange,
  onClose,
}: CuisineTypeDropdownProps) {
  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      onChange(selectedCuisines.filter((item) => item !== cuisine));
    } else {
      onChange([...selectedCuisines, cuisine]);
    }
  };

  return (
    <View className="bg-white border border-[#FAE8D1] rounded-lg shadow-lg max-h-60">
      <FlatList
        data={CUISINE_OPTIONS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-3 border-b border-gray-100 ${
              selectedCuisines.includes(item) ? 'bg-[#FEF9F3]' : 'bg-white'
            }`}
            onPress={() => toggleCuisine(item)}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-base ${
                  selectedCuisines.includes(item)
                    ? 'text-black font-semibold'
                    : 'text-gray-700'
                }`}
              >
                {item}
              </Text>
              {selectedCuisines.includes(item) && (
                <View className="w-5 h-5 bg-[#E05910] rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
