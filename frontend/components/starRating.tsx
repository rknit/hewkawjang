import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { View } from 'react-native';

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
}: {
  rating: number;
  maxRating?: number;
  size?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className="flex-row items-center space-x-1">
      {/* Full stars */}
      {Array(fullStars)
        .fill(undefined)
        .map((_, i) => (
          <FaStar
            key={`full-${i}`}
            size={size}
            className="text-yellow-400 text-2xl"
          />
        ))}

      {/* Half star */}
      {hasHalfStar && (
        <FaStarHalfAlt size={size} className="text-yellow-400 text-2xl" />
      )}

      {/* Empty stars */}
      {Array(emptyStars)
        .fill(undefined)
        .map((_, i) => (
          <FaRegStar
            key={`empty-${i}`}
            size={size}
            className="text-gray-300 text-2xl"
          />
        ))}
    </View>
  );
}
