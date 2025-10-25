import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { THAI_PROVINCES } from '../constants/thailand-provinces';

interface ProvinceDropdownProps {
  value: string | null;
  onChange: (province: string) => void;
  onClose?: () => void;
}

export default function ProvinceDropdown({
  value,
  onChange,
  onClose,
}: ProvinceDropdownProps) {
  const [searchText, setSearchText] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState(THAI_PROVINCES);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredProvinces(THAI_PROVINCES);
    } else {
      const filtered = THAI_PROVINCES.filter((province) =>
        province.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredProvinces(filtered);
    }
  }, [searchText]);

  const handleProvinceSelect = (province: string) => {
    onChange(province);
    setSearchText('');
    if (onClose) {
      onClose();
    }
  };

  return (
    <View className="bg-[#FEF9F3] rounded-lg border border-[#FAE8D1] shadow-md">
      {/* Search Bar */}
      <View className="p-4 border-b border-[#FAE8D1]">
        <TextInput
          className="w-full rounded px-3 py-2 bg-white border border-[#FAE8D1]"
          placeholder="Search province..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      </View>

      {/* Province List */}
      <ScrollView className="max-h-48" showsVerticalScrollIndicator={true}>
        {filteredProvinces.length > 0 ? (
          filteredProvinces.map((province, index) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-3 border-b border-[#FAE8D1] ${
                value === province ? 'bg-[#FAE8D1]' : 'bg-transparent'
              }`}
              onPress={() => handleProvinceSelect(province)}
            >
              <Text
                className={`text-base ${
                  value === province
                    ? 'font-semibold text-[#8B4513]'
                    : 'text-gray-900'
                }`}
              >
                {province}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View className="px-4 py-3">
            <Text className="text-gray-500 text-center">
              No provinces found
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Close Button */}
      {onClose && (
        <View className="p-3 border-t border-[#FAE8D1]">
          <TouchableOpacity
            className="bg-[#FAE8D1] rounded px-4 py-2 self-center"
            onPress={onClose}
          >
            <Text className="text-[#8B4513] font-medium">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
