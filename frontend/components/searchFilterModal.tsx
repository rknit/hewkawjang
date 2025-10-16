import React, { useState } from 'react';
import { TouchableOpacity, View, Text, ScrollView, TextInput } from 'react-native';
import BaseModal from './base-modal';
import { THAI_PROVINCES } from '@/constants/thailand-provinces';

interface SearchFilters {
  province: string;
  priceRange: { min: number; max: number };
  cuisineTypes: string[];
  minRating: number;
}

interface SortOptions {
  field: 'rating' | 'price' | 'name';
  order: 'asc' | 'desc';
}

interface SearchFilterModalProps {
  visible: boolean;
  filters: SearchFilters;
  sortBy: SortOptions;
  onClose: () => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onSortChange: (sort: SortOptions) => void;
  onClearFilters: () => void;
  onApplySearch: () => void;
}

export default function SearchFilterModal({
  visible,
  filters,
  sortBy,
  onClose,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  onApplySearch,
}: SearchFilterModalProps) {
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');

  const filteredProvinces = THAI_PROVINCES.filter(province =>
    province.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const cuisineTypes = ['Buffet', 'Indian', 'Italian', 'Japanese', 'Chinese'];
  const priceRanges = [
    { label: 'Any', min: 0, max: 10000 },
    { label: '$', min: 0, max: 250 },
    { label: '$$', min: 251, max: 750 },
    { label: '$$$', min: 751, max: 2000 },
    { label: '$$$$', min: 2001, max: 10000 },
  ];

  const toggleCuisineType = (type: string) => {
    const newCuisineTypes = filters.cuisineTypes.includes(type)
      ? filters.cuisineTypes.filter(t => t !== type)
      : [...filters.cuisineTypes, type];
    
    onFiltersChange({
      ...filters,
      cuisineTypes: newCuisineTypes,
    });
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleApplySearch = () => {
    onClose();
    onApplySearch();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      width="default"
      height="default"
      showCloseButton={false}
    >
      {/* Compact Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-[#8B5C2A]">Filters</Text>
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity onPress={onClearFilters}>
            <Text className="text-[#8B5C2A] text-sm">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-xl text-gray-500">×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Province - Dropdown */}
        <View className="mb-4">
          <Text className="text-[#8B5C2A] font-medium mb-2 text-sm">Province</Text>
          <TouchableOpacity
            className="bg-gray-100 rounded-lg p-2 flex-row justify-between items-center"
            onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
          >
            <Text className={`text-sm ${filters.province ? 'text-gray-800' : 'text-gray-500'}`}>
              {filters.province || 'Select Province'}
            </Text>
            <Text className="text-gray-400">{showProvinceDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {/* Dropdown List */}
          {showProvinceDropdown && (
            <View className="bg-white border border-gray-200 rounded-lg mt-1 max-h-40">
              {/* Search Input */}
              <View className="p-2 border-b border-gray-100">
                <TextInput
                  className="bg-gray-50 rounded px-2 py-1 text-sm"
                  placeholder="Search province"
                  value={provinceSearch}
                  onChangeText={setProvinceSearch}
                  autoFocus
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={true}>
                {/* Use filtered provinces */}
                {filteredProvinces.map((province) => (
                  <TouchableOpacity
                    key={province}
                    className="py-2 px-3 border-b border-gray-100"
                    onPress={() => {
                      updateFilters({ province });
                      setShowProvinceDropdown(false);
                      setProvinceSearch('');
                    }}
                  >
                    <Text className={`text-sm ${
                      filters.province === province ? 'font-bold text-[#8B5C2A]' : 'text-gray-700'
                    }`}>
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* Show "No results" if no provinces match */}
                {filteredProvinces.length === 0 && (
                  <View className="py-4 px-3">
                    <Text className="text-gray-500 text-sm text-center">
                      No provinces found
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Price - Compact */}
        <View className="mb-4">
          <Text className="text-[#8B5C2A] font-medium mb-2 text-sm">Price</Text>
          <View className="flex-row gap-2">
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range.label}
                className={`px-3 py-1 rounded-lg border ${
                  filters.priceRange.min === range.min && filters.priceRange.max === range.max
                    ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => updateFilters({ 
                  priceRange: { min: range.min, max: range.max } 
                })}
              >
                <Text className={`text-sm ${
                  filters.priceRange.min === range.min && filters.priceRange.max === range.max
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cuisine - Compact */}
        <View className="mb-4">
          <Text className="text-[#8B5C2A] font-medium mb-2 text-sm">Cuisine Type</Text>
          <View className="flex-row flex-wrap gap-1">
            {cuisineTypes.map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-3 py-1 rounded-lg border ${
                  filters.cuisineTypes.includes(type)
                    ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => toggleCuisineType(type)}
              >
                <Text className={`text-sm ${
                  filters.cuisineTypes.includes(type)
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating - Compact */}
        <View className="mb-4">
          <Text className="text-[#8B5C2A] font-medium mb-2 text-sm">Min Rating</Text>
          <View className="flex-row gap-1">
            {[0, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                className={`px-2 py-1 rounded border ${
                  filters.minRating === rating
                    ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => updateFilters({ minRating: rating })}
              >
                <Text className={`text-sm ${
                  filters.minRating === rating ? 'text-white' : 'text-gray-700'
                }`}>
                  {rating === 0 ? 'Any' : `${rating} ⭐`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort - Compact Toggle */}
        <View className="mb-4">
          <Text className="text-[#8B5C2A] font-medium mb-2 text-sm">Sort By</Text>
          <View className="flex-row gap-2">
            {/* Rating Toggle */}
            <TouchableOpacity
              className={`px-3 py-1 rounded border ${
                sortBy.field === 'rating'
                  ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => {
                if (sortBy.field === 'rating') {
                  // Toggle between asc/desc if already on rating
                  onSortChange({ 
                    field: 'rating', 
                    order: sortBy.order === 'asc' ? 'desc' : 'asc' 
                  });
                } else {
                  // Set to rating desc as default
                  onSortChange({ field: 'rating', order: 'desc' });
                }
              }}
            >
              <Text className={`text-sm ${
                sortBy.field === 'rating' ? 'text-white' : 'text-gray-700'
              }`}>
                Rating {sortBy.field === 'rating' ? (sortBy.order === 'desc' ? '↓' : '↑') : ''}
              </Text>
            </TouchableOpacity>

            {/* Price Toggle */}
            <TouchableOpacity
              className={`px-3 py-1 rounded border ${
                sortBy.field === 'price'
                  ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => {
                if (sortBy.field === 'price') {
                  // Toggle between asc/desc if already on price
                  onSortChange({ 
                    field: 'price', 
                    order: sortBy.order === 'asc' ? 'desc' : 'asc' 
                  });
                } else {
                  // Set to price asc as default (low to high is more common)
                  onSortChange({ field: 'price', order: 'asc' });
                }
              }}
            >
              <Text className={`text-sm ${
                sortBy.field === 'price' ? 'text-white' : 'text-gray-700'
              }`}>
                Price {sortBy.field === 'price' ? (sortBy.order === 'asc' ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            {/* Name Toggle */}
            <TouchableOpacity
              className={`px-3 py-1 rounded border ${
                sortBy.field === 'name'
                  ? 'bg-[#8B5C2A] border-[#8B5C2A]'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => {
                if (sortBy.field === 'name') {
                  onSortChange({ 
                    field: 'name', 
                    order: sortBy.order === 'asc' ? 'desc' : 'asc' 
                  });
                } else {
                  onSortChange({ field: 'name', order: 'asc' });
                }
              }}
            >
              <Text className={`text-sm ${
                sortBy.field === 'name' ? 'text-white' : 'text-gray-700'
              }`}>
                Name {sortBy.field === 'name' ? (sortBy.order === 'asc' ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Compact Apply Button */}
      <TouchableOpacity
        className="bg-[#E05910] rounded-lg py-3 items-center mt-3"
        onPress={handleApplySearch}
      >
        <Text className="text-white font-medium">Apply Filters</Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

// Export the interfaces for reuse
export type { SearchFilters, SortOptions };