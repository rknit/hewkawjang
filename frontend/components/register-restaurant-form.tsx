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
import { CUISINE_TYPES } from '@/constants/cuisine-types';
import AvailableTimeDropdown from './available-time-dropdown';
import { PAYMENT_METHODS } from '@/constants/payment-methods';
import { THAI_PROVINCES } from '@/constants/thailand-provinces';

const sortedProvinces = [...THAI_PROVINCES].sort((a, b) => a.localeCompare(b));
const provinceItems = sortedProvinces.map((prov) => ({
  label: prov,
  value: prov,
}));

const PAYMENT_OPTIONS = [
  { label: 'HewKawJangWallet', value: 'wallet' },
  { label: 'MasterCard', value: 'mastercard' },
  { label: 'Visa', value: 'visa' },
  { label: 'GooglePay', value: 'googlepay' },
];

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
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [payment, setPayment] = useState<string | null>(null);
  const [subDistrict, setSubDistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

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

  const handlePriceMinChange = (text: string) => {
    const intVal = text.replace(/[^0-9]/g, '');
    setPriceMin(intVal);
  };

  const handlePriceMaxChange = (text: string) => {
    const intVal = text.replace(/[^0-9]/g, '');
    setPriceMax(intVal);
  };

  const isPriceRangeInvalid =
    priceMin && priceMax && parseInt(priceMin) > parseInt(priceMax);

  const isFormValid =
    name.trim().length > 0 &&
    phone.length === 10 &&
    address.trim().length > 0 &&
    subDistrict.trim().length > 0 &&
    district.trim().length > 0 &&
    province &&
    postalCode.trim().length > 0 &&
    cuisines.length > 0 &&
    priceMin &&
    priceMax &&
    parseInt(priceMin) <= parseInt(priceMax) &&
    payments.length > 0;

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
        placeholder="e.g. Somtum Paradise"
        placeholderTextColor="#9ca3af" // blurred gray
      />

      <ImageChooser />

      <Text className="text-left text-base pb-1">Phone Number</Text>
      <TextInput
        className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
        value={phone}
        onChangeText={(text) => {
          // Only allow numbers, max 10 digits
          const digits = text.replace(/[^0-9]/g, '').slice(0, 10);
          setPhone(digits);
        }}
        placeholder="e.g. 0812345678"
        placeholderTextColor="#9ca3af"
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
          <TextInput
            className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
            value={subDistrict}
            onChangeText={setSubDistrict}
          />
        </View>
        <View className="flex-1">
          <Text className="text-left text-base pb-1">District</Text>
          <TextInput
            className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
            value={district}
            onChangeText={setDistrict}
          />
        </View>
      </View>
      <View className="mb-4">
        <Text className="text-left text-base pb-1">Postal Code</Text>
        <TextInput
          className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1]"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
          maxLength={5}
        />
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
          className="w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1]"
          value={priceMin}
          onChangeText={handlePriceMinChange}
          placeholder="Min"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
        />
        <Text className="mx-2">:</Text>
        <TextInput
          className="w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1]"
          value={priceMax}
          onChangeText={handlePriceMaxChange}
          placeholder="Max"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
        />
      </View>
      {isPriceRangeInvalid && (
        <Text className="text-red-500 mb-2">
          Min price must not be greater than Max price.
        </Text>
      )}

      {/* Payment Method Dropdown */}
      <Text className="text-left text-base pb-1">Payment Method</Text>
      <View className="mb-8">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-[#FAE8D1] rounded px-3 py-2 border border-gray-300"
          onPress={() => setPaymentDropdownOpen((v) => !v)}
          activeOpacity={0.8}
        >
          <Text className={payment ? 'text-black' : 'text-gray-400'}>
            {payment
              ? PAYMENT_OPTIONS.find((opt) => opt.value === payment)?.label
              : 'Select a payment method'}
          </Text>
          <Text className="text-xl text-gray-500">
            {paymentDropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {paymentDropdownOpen && (
          <View className="bg-white border border-gray-300 rounded mt-2 p-2">
            {PAYMENT_OPTIONS.map((method) => (
              <TouchableOpacity
                key={method.value}
                className={`
    flex-row items-center px-3 py-2 rounded
    ${payment === method.value ? 'bg-orange-600' : ''}
    hover:bg-orange-100 hover:text-orange-600
  `}
                onPress={() => {
                  setPayment(method.value);
                  setPaymentDropdownOpen(false);
                }}
              >
                <Text
                  className={`
    ${payment === method.value ? 'text-white font-bold' : 'text-black'}
    hover:text-orange-600
  `}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-[#AD754C] rounded py-2 mb-12 ${!isFormValid ? 'opacity-50' : ''}`}
        disabled={!isFormValid}
        onPress={handleSubmit}
      >
        <Text className="text-white font-medium text-center text-lg">
          Submit
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
