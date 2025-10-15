import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function SearchResults() {
  const { data } = useLocalSearchParams();
  const searchParams = JSON.parse(atob(data as string)); // Base64 decode

  console.log('Received Search Params:', searchParams);
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg font-bold">Search Results</Text>
    </View>
  );
}