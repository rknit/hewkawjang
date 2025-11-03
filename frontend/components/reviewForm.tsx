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
import { uploadImage, deleteImage } from '@/apis/image.api';

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

  const rndId = Math.random().toString(36).substring(7);
  const addPhoto = async () => {
    // Request permission to access media library
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access photos is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    // If the user didn't cancel the image selection
    if (!result.canceled) {
      // Map over the selected assets to process each image
      const uris = result.assets.map((asset) => asset.uri);

      // Generate a unique review ID (assuming it's already created somewhere)
      const reviewId = rndId; // You should have a unique ID here

      // Convert each URI to a Blob, then to a File object, and upload it
      const imageUploads = uris.map(async (uri) => {
        // Fetch the image from the URI and convert it to a Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Get the file type from the blob (MIME type)
        const contentType = blob.type; // This will be something like 'image/jpeg' or 'image/png'

        // Generate a file name for the image
        const fileName = `review-${reviewId}.${contentType.split('/')[1]}`; // Use the file extension based on MIME type

        // Create a File object from the blob (with a proper file name and MIME type)
        const file = new File([blob], fileName, { type: contentType });

        // Debugging: Log the file to ensure it's being created correctly
        console.log(file);

        // Upload the image using the uploadImage function
        const uploadedImageUrl = await uploadImage(
          file,
          'temp',
          'review-images',
        ); // temp is preferablly should be review id

        return uploadedImageUrl; // Return the uploaded image URL
      });

      // Wait for all images to be uploaded and collect their URLs
      const uploadedImageUrls = await Promise.all(imageUploads);

      // Add the uploaded image URLs to the state (for example)
      setPhotos((prev) => [...prev, ...uploadedImageUrls]);
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
    // Attempt to submit the review
    const success = await submitReview(reservationId, {
      rating,
      attachPhotos: photos,
      comment: text,
    });

    if (success) {
      alert('Review submitted successfully!');
      setRating(0);
      setText('');
      setPhotos([]); // Clear the photos on success
      onClose();
    } else {
      // If submission fails, delete all uploaded images
      await Promise.all(photos.map(deleteImage));
      alert('Failed to submit review. Please try again.');
    }
  } catch (error: any) {
    console.log('Submit review error:', error);

    // Delete all uploaded images if there's an error
    await Promise.all(photos.map(deleteImage));

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
            <Text className="text-2xl font-semibold text-black-500">
              Reviews
            </Text>
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
                <Text className="font-semibold text-base">
                  {restaurant.name}
                </Text>
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
                <Text className="text-white font-semibold text-base">
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
