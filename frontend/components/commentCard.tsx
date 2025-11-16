import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {Star} from 'lucide-react-native';
import DeleteReviewButton from './delete-review-button';

type CommentProps = {
  name: string;
  avatar: string;
  rating: number; // e.g. 5
  comment: string;
  date: string; // e.g. "1 days ago"
  attachPhotos?: string[];
  onPressReport?: () => void;
  isLoggedIn?: boolean;
  // NEW:
  canDelete?: boolean;
  reviewId?: number; // numeric id for deletion
  onDeleted?: (id: number) => void;
};

const CommentCard: React.FC<CommentProps> = ({
  name,
  avatar,
  rating,
  comment,
  date,
  attachPhotos,
  onPressReport,
  isLoggedIn,
  canDelete,
  reviewId,
  onDeleted,
}) => {
  const avatarSource =
    avatar && avatar.trim() !== ''
      ? { uri: avatar }
      : require('@/assets/images/default_profile.png');

  return (
    <View className="flex-row items-start space-x-3 p-4 rounded-xl">
      {/* Avatar */}
      <Image
        source={avatarSource}
        className="rounded-full"
        style={{ width: 60, height: 60, resizeMode: 'cover' }}
      />

      {/* Content */}
      <View className="flex-1">
        {/* Name + Date + Actions */}
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-gray-900">{name}</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-400 text-xs">{date}</Text>

            <View style={{ width: 8 }} />

            {/* Delete button (only for owner), placed LEFT of report */}
            {canDelete && reviewId !== undefined && (
              <>
                <DeleteReviewButton
                  reviewId={reviewId}
                  onDeleted={(id) => onDeleted?.(id)}
                />
                <View style={{ width: 8 }} />
              </>
            )}

            {/* Report button */}
            {isLoggedIn && (
              <TouchableOpacity onPress={onPressReport}>
                <Feather name="flag" size={16} color="#9C9C9C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stars */}
        <View className="flex-row items-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              color={i < rating ? '#FACC15' : '#D1D5DB'} // yellow-400 or gray-300
              fill={i < rating ? '#FACC15' : 'none'}
              className="mr-0.5"
            />
          ))}
          <Text className="ml-2 text-sm text-gray-600">
            {Number(rating).toFixed(1)}
          </Text>
        </View>

        {/* Comment */}
        <Text className="text-sm text-gray-700 mt-2">{comment}</Text>

        {/* Review Images */}
        {attachPhotos && attachPhotos.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {attachPhotos.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                className="rounded-lg"
                style={{ width: 80, height: 80, resizeMode: 'cover' }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default CommentCard;
