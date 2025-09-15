import { useState } from 'react';
import { Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageChooser() {
  const [images, setImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const handlePickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera roll permissions!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  return (
    <View>
      <Text className="mb-2 text-base">Restaurant Images</Text>
      <View className="flex-row w-full h-48 mb-4">
        {/* Big image slot on the left */}
        <TouchableOpacity
          className="flex-1 mr-2 bg-[#323232] rounded justify-center items-center overflow-hidden"
          onPress={() => handlePickImage(0)}
          activeOpacity={0.8}
        >
          {images[0] ? (
            <Image
              source={{ uri: images[0] }}
              className="w-full h-full rounded"
              resizeMode="cover"
            />
          ) : (
            <View className="justify-center items-center w-full h-full">
              <Text className="text-gray-400">Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>
        {/* 3 small images on the right */}
        <View className="flex-col justify-between h-full flex-[0.8]">
          {[1, 2, 3].map((idx) => (
            <TouchableOpacity
              key={idx}
              className="flex-1 mb-2 last:mb-0 bg-[#FAE8D1] rounded justify-center items-center overflow-hidden"
              onPress={() => handlePickImage(idx)}
              activeOpacity={0.8}
              style={{ minHeight: 0 }}
            >
              {images[idx] ? (
                <Image
                  source={{ uri: images[idx]! }}
                  className="w-full h-full rounded"
                  resizeMode="cover"
                />
              ) : (
                <View className="justify-center items-center w-full h-full">
                  <Text className="text-gray-400 text-xs">Tap to select</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
