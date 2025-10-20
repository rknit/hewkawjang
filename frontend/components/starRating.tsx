import React from 'react';
import { View } from 'react-native';
import { StarIcon } from 'react-native-heroicons/solid';

export default function StarRating({
  rating,
  maxRating = 5,
}: {
  rating: number;
  maxRating?: number;
}) {
  return (
    <View className="flex-row my-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <StarIcon
          key={i}
          size={18}
          color={i < Math.round(rating) ? 'gold' : '#ddd'}
        />
      ))}
    </View>
  );
}
