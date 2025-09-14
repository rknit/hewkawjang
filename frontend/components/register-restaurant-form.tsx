import { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageChooser from './image-chooser';

export default function RegisterRestaurantForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [owner, setOwner] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const handlePickImage = async () => {
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
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!name || !address || !phone || !owner) {
      Alert.alert('Please fill in all fields');
      return;
    }
    // Submit logic here
    Alert.alert(
      'Restaurant Registered!',
      `Name: ${name}\nAddress: ${address}\nPhone: ${phone}\nOwner: ${owner}\nImage: ${
        image ? image : 'No image selected'
      }`,
    );
  };

  return (
    <ScrollView
      className="w-full bg-[#FEF9F3]"
      contentContainerStyle={{
        paddingBottom: 20,
        paddingTop: 20,
      }}
    >
      <Text className="text-2xl font-bold mb-6 text-left">
        Register Restaurant
      </Text>

      <Text className="mb-2 text-base">Restaurant Name</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={name}
        onChangeText={setName}
      />

      <ImageChooser />

      <Text className="mb-2 text-base">Address</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={address}
        onChangeText={setAddress}
      />

      <Text className="mb-2 text-base">Phone Number</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text className="mb-2 text-base">Owner Name</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={owner}
        onChangeText={setOwner}
      />

      <TouchableOpacity
        className="bg-[#E05910] py-3 rounded"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-semibold text-base">
          Register
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
