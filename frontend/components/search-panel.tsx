import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { router } from 'expo-router';

import SearchFilterModal, { SearchFilters, SortOptions } from './searchFilterModal';

export default function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    province: '',
    priceRange: { min: 0, max: 99999 },
    cuisineTypes: [],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState<SortOptions>({
    field: 'rating',
    order: 'desc',
  });

  const handleSearch = () => {
    const query = searchQuery.trim();
    
    const searchParams = {
      query,
      province: filters.province || undefined,
      priceRange: filters.priceRange.min > 0 || filters.priceRange.max < 99999
        ? filters.priceRange 
        : undefined,
      cuisineTypes: filters.cuisineTypes.length > 0 ? filters.cuisineTypes : [],
      minRating: filters.minRating,
      sortBy,
      offset: 0,
      limit: 20,
    };

    router.push({
      pathname: '/SearchResults',
      params: {
        data: btoa(JSON.stringify(searchParams)), // Base64 encode
      }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      province: '',
      priceRange: { min: 0, max: 99999 },
      cuisineTypes: [],
      minRating: 0,
    });
    setSortBy({ field: 'rating', order: 'desc' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.province) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 99999) count++;
    if (filters.cuisineTypes.length > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  };

  return (
    <>
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
          className="flex-1 text-[16px] text-[#8B5C2A] p-0 outline-none"
          placeholder="Type restaurant name, cuisine type, or district"
          placeholderTextColor="#A67C52"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {/* Filter Icon with Badge */}
        <TouchableOpacity 
          className="ml-3 p-1 relative"
          onPress={() => setShowFilters(true)}
        >
          <Icon name="sliders" size={22} color="#8B5C2A" />
          {getActiveFiltersCount() > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs font-bold">{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <SearchFilterModal
        visible={showFilters}
        filters={filters}
        sortBy={sortBy}
        onClose={() => setShowFilters(false)}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        onApplySearch={handleSearch}
      />
    </>
  );
}