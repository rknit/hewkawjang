import { View, Text, TouchableOpacity, FlatList } from 'react-native';

interface CuisineTypeDropdownProps {
  selectedCuisine: string | null; // ✅ single selected cuisine
  onChange: (cuisine: string) => void; // ✅ pass only one
  onClose: () => void;
}

const CUISINE_OPTIONS = ['Buffet', 'Chinese', 'Japanese', 'Indian', 'Italian'];

export default function CuisineTypeDropdown({
  selectedCuisine,
  onChange,
  onClose,
}: CuisineTypeDropdownProps) {
  const handleSelect = (cuisine: string) => {
    // if the same item is tapped again, clear it
    if (selectedCuisine === cuisine) {
      onChange('');
    } else {
      onChange(cuisine);
    }
  };

  return (
    <View className="bg-white border border-[#FAE8D1] rounded-lg shadow-lg max-h-60">
      <FlatList
        data={CUISINE_OPTIONS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = selectedCuisine === item;
          return (
            <TouchableOpacity
              className={`px-4 py-3 border-b border-gray-100 ${
                isSelected ? 'bg-[#FEF9F3]' : 'bg-white'
              }`}
              onPress={() => handleSelect(item)}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-base ${
                    isSelected ? 'text-black font-semibold' : 'text-gray-700'
                  }`}
                >
                  {item}
                </Text>
                {isSelected && (
                  <View className="w-5 h-5 bg-[#E05910] rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Optional close button */}
      <TouchableOpacity
        onPress={onClose}
        className="p-3 bg-gray-100 items-center rounded-b-lg"
      >
        <Text className="text-gray-700 font-medium">Close</Text>
      </TouchableOpacity>
    </View>
  );
}
