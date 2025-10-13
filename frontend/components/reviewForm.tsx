import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Camera, Trash2, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { submitReview } from '@/apis/user.api';

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
  restaurant: { name: string; location?: string; image: string };
  reservationId: number;
};

export default function ReviewModal({
  visible,
  onClose,
  restaurant,
  reservationId,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
  if (rating === 0) {
    alert('Please select a rating.');
    return;
  }

  setLoading(true);
  try {
    const success = await submitReview(reservationId, {
      rating,
      attachPhotos: photos,
      comment: text,
    });

    if (success) {
      alert('Review submitted successfully!');
      setRating(0);
      setText('');
      setPhotos([]);
      onClose();
    } else {
      alert('Failed to submit review. Please try again.');
    }
  } catch (error: any) {
    console.log('Submit review error:', error);

    if (error.response?.status === 409) {
      alert('You have already submitted a review for this reservation.');
    } else {
      alert('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white rounded-2xl w-[90%] max-w-[400px] p-4 max-h-[85%] border-2 border-orange-300">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-semibold text-black-500">Reviews</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color="gray" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Restaurant Info + Rating */}
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: restaurant.image }}
                className="w-24 h-24 rounded-lg mr-3"
              />
              <View className="flex-1">
                <Text className="font-semibold text-base">{restaurant.name}</Text>
                {restaurant.location && (
                  <Text className="text-gray-500 text-sm mb-1">
                    @{restaurant.location}
                  </Text>
                )}

                {/* Rating */}
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setRating(i)}
                      className="mr-2"
                    >
                      <Star
                        size={20}
                        color={i <= rating ? '#F97316' : '#d1d5db'}
                        fill={i <= rating ? '#F97316' : 'none'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Photos */}
            <Text className="text-base font-medium mb-1">Add a photo</Text>
            <View className="flex-row flex-wrap gap-2 mb-3 border-2 border-dashed border-orange-300 rounded-xl p-2 bg-orange-50/50">
              {photos.map((uri, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-black/60 rounded-full p-1"
                  >
                    <Trash2 size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={addPhoto}
                className="w-20 h-20 border-2 border-dashed border-orange-300 rounded-lg justify-center items-center"
              >
                <Camera size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Review Text */}
            <Text className="text-base font-medium mb-1">Write a review</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Share your experience..."
              placeholderTextColor="#9ca3af"
              multiline
              className="border border-orange-300 hover:border-orange-500 rounded-xl p-3 text-base h-28 mb-4 bg-orange-50/50"
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-orange-500 rounded-xl py-3 items-center flex-row justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Submit</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}