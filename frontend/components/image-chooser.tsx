import { ScrollView, Text, View, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, deleteImage } from '@/apis/image.api';

interface ImageChooserProps {
  images: (string | null)[];
  setImages: (images: (string | null)[]) => void;
  restaurantId: number;
}

export default function ImageChooser({ images, setImages, restaurantId }: ImageChooserProps) {
  const pickImage = async (index: number) => {
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

    if (!result.canceled) {
      const newImages = [...images];

      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const contentType = blob.type;
      const fileName = `restaurant-${restaurantId}.${contentType.split('/')[1]}`;
      const file = new File([blob], fileName, { type: contentType });
      const uploadedImageUrl = await uploadImage(
                file,
                restaurantId.toString(),
                'restaurant-images',
              );

      newImages[index] = uploadedImageUrl;

      // Add a new empty slot if last slot was filled
      if (index === images.length - 1) {
        newImages.push(null);
      }

      setImages(newImages);
    }
  };

  const deleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    if (newImages.length === 0) newImages.push(null);
    setImages(newImages);
  };

  return (
    <View>
      <Text style={{ marginBottom: 8, fontSize: 16 }}>Restaurant Images</Text>
      <View style={{ flexDirection: 'row', height: 250 }}>
        {/* Big image on the left */}
        <TouchableOpacity
          style={[styles.bigImage, { marginRight: 12 }]}
          onPress={() => pickImage(0)}
          activeOpacity={0.8}
        >
          {images[0] ? (
            <Image source={{ uri: images[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={{ color: '#9CA3AF' }}>Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Scrollable small images on the right */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {images.slice(1).map((img, idx) => {
            const index = idx + 1;
            return (
              <TouchableOpacity
                key={index}
                style={styles.smallImageWrapper}
                onPress={() => pickImage(index)}
                activeOpacity={0.8}
              >
                {img ? (
                  <>
                    <Image source={{ uri: img }} style={styles.smallImage} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.overlayButton}
                      onPress={() => deleteImage(index)}
                    >
                      <Text style={styles.overlayText}>×</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={[styles.smallImage, styles.placeholder]}>
                    <Text style={{ color: '#9CA3AF' }}>Tap to select</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bigImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAE8D1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  smallImageWrapper: {
    width: '100%',
    height: 80,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FAE8D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  overlayButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 16,
  },
});
