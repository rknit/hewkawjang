import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { View } from 'react-native';

interface StarRatingProps {
  rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className="flex items-center space-x-1">
      {/* Full stars */}
      {Array(fullStars)
        .fill(undefined)
        .map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400 text-2xl" />
        ))}

      {/* Half star */}
      {hasHalfStar && <FaStarHalfAlt className="text-yellow-400 text-2xl" />}

      {/* Empty stars */}
      {Array(emptyStars)
        .fill(undefined)
        .map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300 text-2xl" />
        ))}
    </View>
  );
}
