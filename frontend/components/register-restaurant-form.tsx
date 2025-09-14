import DropDownPicker from 'react-native-dropdown-picker';
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
import ProvincesPicker from '../components/provinces';
import { CUISINE_TYPES } from '@/utils/cuisine-types';
import AvailableTimeDropdown from './available-time-dropdown';
import { PAYMENT_METHODS } from '@/utils/payment-methods';
import { THAI_PROVINCES } from '@/utils/thailand-provinces';

const sortedProvinces = [...THAI_PROVINCES].sort((a, b) => a.localeCompare(b));
const provinceItems = sortedProvinces.map((prov) => ({
  label: prov,
  value: prov,
}));

export default function RegisterRestaurantForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [owner, setOwner] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [province, setProvince] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [availableTimeModal, setAvailableTimeModal] = useState(false);
  const [availableTime, setAvailableTime] = useState<any>(null); // Replace 'any' with the correct type if known
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [payments, setPayments] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

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
      className="w-full bg-[#FEF9F3] rounded-2xl border border-[#FAE8D1] shadow"
      contentContainerStyle={{
        paddingBottom: 60,
        paddingTop: 60,
        paddingRight: 60,
        paddingLeft: 60,
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Text className="text-left text-2xl font-bold pb-8">
        Register Restaurant
      </Text>

      <Text className="text-left text-base pb-1">Restaurant Name</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={name}
        onChangeText={setName}
      />

      <ImageChooser />

      <Text className="text-left text-base pb-1">Phone Number</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text className="mb-2 text-base font-medium mt-6 underline">
        Location
      </Text>
      <Text className="text-left text-base pb-1">Address</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
      />
      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-left text-base pb-1">Sub-district</Text>
          <TextInput className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]" />
        </View>
        <View className="flex-1">
          <Text className="text-left text-base pb-1">District</Text>
          <TextInput className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]" />
        </View>
      </View>

      <DropDownPicker
        open={open}
        value={province}
        items={provinceItems}
        setOpen={setOpen}
        setValue={setProvince}
        setItems={() => {}} // Not needed unless you want to dynamically change items
        searchable={true}
        placeholder="Select province"
        containerStyle={{ marginBottom: 16 }}
        style={{ backgroundColor: '#FAE8D1' }}
        dropDownContainerStyle={{ backgroundColor: '#FAE8D1' }}
      />

      <TouchableOpacity
        className="bg-[#FAE8D1] rounded px-3 py-2 mb-4 flex-row items-center"
        onPress={() => setAvailableTimeModal((v) => !v)}
      >
        <Text className="font-medium">▼ Available Time</Text>
      </TouchableOpacity>

      {availableTimeModal && (
        <AvailableTimeDropdown
          value={availableTime}
          onChange={setAvailableTime}
          onClose={() => setAvailableTimeModal(false)}
        />
      )}

      {/* Cuisine Type */}
      <Text className="mb-2 text-base">Cuisine Type</Text>
      <View className="flex-row flex-wrap mb-4">
        {CUISINE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-3 py-1 m-1 rounded border ${cuisines.includes(type) ? 'bg-orange-600 border-orange-600' : 'bg-[#FAE8D1] border-gray-300'}`}
            onPress={() =>
              setCuisines(
                cuisines.includes(type)
                  ? cuisines.filter((t) => t !== type)
                  : [...cuisines, type],
              )
            }
          >
            <Text
              className={cuisines.includes(type) ? 'text-white' : 'text-black'}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Price Range */}
      <Text className="text-left text-base pb-1">Price Range</Text>
      <View className="flex-row mb-4">
        <TextInput
          className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
          value={priceMin}
          onChangeText={setPriceMin}
          placeholder="Min"
          keyboardType="number-pad"
        />
        <Text className="mx-2">:</Text>
        <TextInput
          className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
          value={priceMax}
          onChangeText={setPriceMax}
          placeholder="Max"
          keyboardType="number-pad"
        />
      </View>

      {/* Payment Method */}
      <Text className="text-left text-base pb-1">Payment Method</Text>
      <View className="flex-row flex-wrap mb-8">
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.value}
            className={`px-3 py-1 m-1 rounded border ${payments.includes(method.value) ? 'bg-orange-600 border-orange-600' : 'bg-[#FAE8D1] border-gray-300'}`}
            onPress={() =>
              setPayments(
                payments.includes(method.value)
                  ? payments.filter((p) => p !== method.value)
                  : [...payments, method.value],
              )
            }
          >
            <Text
              className={
                payments.includes(method.value) ? 'text-white' : 'text-black'
              }
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#B87A4B] rounded py-3"
        onPress={() => {
          /* TODO: Submit logic */
        }}
      >
        <Text className="text-white font-bold text-center text-lg">Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
