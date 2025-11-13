import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import ImageChooser from './image-chooser';
import AvailableTimeDropdown from './available-time-dropdown';
import ProvinceDropdown from './province-dropdown';
import CuisineTypeDropdown from './cuisine-type-dropdown';
import PaymentMethodSelector from './payment-method-selector';
import { fetchRestaurantById, updateRestaurantInfo } from '@/apis/restaurant.api';

interface RestaurantEditProps {
  restaurantId: number;
}

export default function RestaurantEdit({ restaurantId }: RestaurantEditProps) {
  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [village, setVillage] = useState('');
  const [building, setBuilding] = useState('');
  const [road, setRoad] = useState('');
  const [soi, setSoi] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [reservationFee, setReservationFee] = useState('');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [images, setImages] = useState<(string | null)[]>([null]);

  // Dropdown states
  const [showAvailableTimeDropdown, setShowAvailableTimeDropdown] = useState(false);
  const [availableTimeValue, setAvailableTimeValue] = useState<any>(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const loadData = async () => {
    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) return;
    setRestaurant(restaurant);
    setRestaurantName(restaurant.name);
    setPhoneNumber(restaurant.phoneNo);
    setHouseNo(restaurant.houseNo || '');
    setVillage(restaurant.village || '');
    setBuilding(restaurant.building || '');
    setRoad(restaurant.road || '');
    setSoi(restaurant.soi || '');
    setSubDistrict(restaurant.subDistrict || '');
    setDistrict(restaurant.district || '');
    setPostalCode(restaurant.postalCode || '');
    setPriceRange(restaurant.priceRange ? restaurant.priceRange.toString() : '');
    setReservationFee(restaurant.reservationFee.toString());
    setSelectedProvince(restaurant.province || null);
    setSelectedCuisine(restaurant.cuisineType || null);
    setSelectedPaymentMethod(restaurant.paymentMethod);
    if(restaurant.images && restaurant.images.length > 0) {
      setImages([...restaurant.images, null]);
    }
    else {
      setImages([null]);
    }
    // Note: availableTimeValue and selectedPaymentMethods loading logic would go here
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Validation state
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validation functions
  const validateRestaurantName = (name: string): boolean => /^[a-zA-Z0-9\s]+$/.test(name.trim()) && name.trim().length > 0;
  const validatePhoneNumber = (phone: string): boolean => /^0[0-9]{9}$/.test(phone);
  const validateLocation = (location: string): boolean => location.trim().length > 0;
  const validatePostalCode = (postal: string): boolean => /^[0-9]+$/.test(postal) && postal.trim().length > 0;
  const validateProvince = (): boolean => selectedProvince !== null && selectedProvince.trim().length > 0;
  const validateAvailableTime = (): boolean => {
    if (!availableTimeValue || !availableTimeValue.selectedDays || availableTimeValue.selectedDays.length === 0) return false;
    return availableTimeValue.selectedDays.some((dayIdx: number) => {
      const timeRange = availableTimeValue.timeRanges[dayIdx];
      return timeRange && timeRange.start && timeRange.end;
    });
  };
  const validateCuisines = (): boolean => selectedCuisine !== null;
  const validatePriceRange = (): boolean => {
    if (!priceRange) return false;
    if (!/^[0-9]+$/.test(priceRange)) return false;
    return true;
  };
  const validatePaymentMethods = (): boolean => selectedPaymentMethod !== null;
  const validateReservationFee = (): boolean => {
    if (!reservationFee) return false;
    if (!/^[0-9]+$/.test(reservationFee)) return false;
    return true;
  }
  // Overall form validation
  const isFormValid = (): boolean => {
    return (
      validateRestaurantName(restaurantName) &&
      validatePhoneNumber(phoneNumber) &&
      validateLocation(subDistrict) &&
      validateLocation(district) &&
      validatePostalCode(postalCode) &&
      validateProvince() &&
      validateAvailableTime() &&
      validateCuisines() &&
      validatePriceRange() &&
      validatePaymentMethods() &&
      validateReservationFee()
    );
  };

  // Input handlers
  const handlePhoneNumberChange = (text: string) => {
    let digits = text.replace(/[^0-9]/g, '');
    if (digits.length > 0 && digits[0] !== '0') digits = '0' + digits.slice(0, 9);
    if (digits.length > 10) digits = digits.slice(0, 10);
    setPhoneNumber(digits);
  };
  const handlePostalCodeChange = (text: string) => setPostalCode(text.replace(/[^0-9]/g, ''));
  const handlePriceRangeChange = (text: string) => setPriceRange(text.replace(/[^0-9]/g, ''));
  const handleReservationFeeChange = (text: string) => setReservationFee(text.replace(/[^0-9]/g, ''));

  const formatAvailableTimeDisplay = () => {
    if (!availableTimeValue || !availableTimeValue.selectedDays || availableTimeValue.selectedDays.length === 0) return null;
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const sortedDays = availableTimeValue.selectedDays.sort((a: number, b: number) => a - b);
    return sortedDays.map((dayIdx: number) => {
      const timeRange = availableTimeValue.timeRanges[dayIdx];
      if (!timeRange) return null;
      return { day: dayNames[dayIdx], startTime: timeRange.start, endTime: timeRange.end };
    }).filter(Boolean);
  };

  const timeDisplayData = formatAvailableTimeDisplay();

  // Submit
 const handleSubmit = async () => {
  setHasAttemptedSubmit(true);

  if (!isFormValid()) {
    Alert.alert('Validation Error', 'Please check your inputs.');
    return;
  }

  try {
    // Build the payload according to UpdateRestaurantInfoSchema
    const payload = {
    id: restaurantId,
    ownerId: restaurant.ownerId,
    name: restaurantName || '', // schema expects string, not null
    phoneNo: phoneNumber || '', // schema expects string, not null
    houseNo: houseNo || null,
    village: village || null,
    building: building || null,
    road: road || null,
    soi: soi || null,
    subDistrict: subDistrict || null,
    district: district || null,
    province: selectedProvince || null,
    postalCode: postalCode || null,
    cuisineType: selectedCuisine || 'Other', // required by schema
    priceRange: priceRange ? Number(priceRange) : 0, // required by schema
    reservationFee: reservationFee ? Number(reservationFee) : 0,
    paymentMethod: selectedPaymentMethod as
      | 'MasterCard'
      | 'Visa'
      | 'HewkawjangWallet'
      | 'PromptPay',
    images: images.filter((img): img is string => img !== null), // filter out nulls
  };

    await updateRestaurantInfo(payload);

    alert('Success Restaurant information updated successfully!');
  } catch (error) {
    console.error('Failed to update restaurant info:', error);
    alert('Error Failed to update restaurant information.');
  }
};


  return (
    <View className="h-full w-3/5 bg-white p-16 pr-32 overflow-y-auto">
      <View className="bg-[#FEF9F3] rounded-2xl border border-[#FAE8D1] shadow p-16 mb-16">
        <Text className="text-left text-2xl font-bold mb-8">Settings</Text>

        {/* Restaurant Name */}
        <Text className="text-left text-base mb-1">Restaurant Name</Text>
        <TextInput
          className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && restaurantName && !validateRestaurantName(restaurantName) ? 'border-2 border-red-500' : ''}`}
          value={restaurantName}
          onChangeText={setRestaurantName}
          placeholder="e.g. Somtum Paradise"
          placeholderTextColor="#9ca3af"
        />

         <ImageChooser images={images} setImages={setImages} restaurantId={restaurantId}/>

        {/* Phone Number */}
        <Text className="text-left text-base mb-1">Phone Number</Text>
        <TextInput
          className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && phoneNumber && !validatePhoneNumber(phoneNumber) ? 'border-2 border-red-500' : ''}`}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder="e.g. 0812345678"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
        />

        {/* Detailed address fields */}
        <View className="flex-row flex-wrap">
          {['House No', 'Village', 'Building', 'Road', 'Soi'].map((label, idx) => {
            const value = [houseNo, village, building, road, soi][idx];
            const setter = [setHouseNo, setVillage, setBuilding, setRoad, setSoi][idx];
            return (
              <View key={label} className="w-1/2 pr-1 mb-2">
                <Text className="text-left text-base pb-1">{label}</Text>
                <TextInput
                  className="w-full rounded px-3 py-2 bg-[#FAE8D1]"
                  value={value}
                  onChangeText={setter}
                  placeholder={label}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            );
          })}
        </View>

        {/* Sub-district & District */}
        <View className="flex-row">
          <View className="flex-1 pr-1">
            <Text className="text-left text-base pb-1">Sub-district</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && subDistrict && !validateLocation(subDistrict) ? 'border-2 border-red-500' : ''}`}
              value={subDistrict}
              onChangeText={setSubDistrict}
              placeholder="Sub-district"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View className="flex-1 pl-1">
            <Text className="text-left text-base pb-1">District</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && district && !validateLocation(district) ? 'border-2 border-red-500' : ''}`}
              value={district}
              onChangeText={setDistrict}
              placeholder="District"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Province & Postal Code */}
        <View className="flex-row">
          <View className="flex-1 pr-1">
            <Text className="text-left text-base pb-1">Province</Text>
            <TouchableOpacity
              className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center"
              onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
            >
              <Text className="text-gray-900">{selectedProvince ?? 'Select a province'}</Text>
              <Text className="text-black font-bold text-lg">{showProvinceDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showProvinceDropdown && (
              <ProvinceDropdown
                value={selectedProvince}
                onChange={province => { setSelectedProvince(province); setShowProvinceDropdown(false); }}
                onClose={() => setShowProvinceDropdown(false)}
              />
            )}
          </View>
          <View className="flex-1 pl-1">
            <Text className="text-left text-base pb-1">Postal Code</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && postalCode && !validatePostalCode(postalCode) ? 'border-2 border-red-500' : ''}`}
              value={postalCode}
              onChangeText={handlePostalCodeChange}
              placeholder="Postal code"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        {/* Available Time */}
        <View className="mb-4">
          <Text className={`text-left text-base mb-1 ${hasAttemptedSubmit && !validateAvailableTime() ? 'text-red-500' : 'text-black'}`}>
            Available Time {hasAttemptedSubmit && !validateAvailableTime() && '*'}
          </Text>
          {!timeDisplayData || timeDisplayData.length === 0 ? (
            <TouchableOpacity
              className={`w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center ${hasAttemptedSubmit && !validateAvailableTime() ? 'border-2 border-red-500' : ''}`}
              onPress={() => setShowAvailableTimeDropdown(!showAvailableTimeDropdown)}
            >
              <Text className="text-gray-900">Select available time</Text>
              <Text className="text-black font-bold text-lg">{showAvailableTimeDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          ) : (
            <View className="mb-4">
              {timeDisplayData.map((item: any, index: number) => (
                <Text key={index} className="text-black text-base">
                  {item.day}: {item.startTime} - {item.endTime}
                </Text>
              ))}
            </View>
          )}
          {showAvailableTimeDropdown && (
            <AvailableTimeDropdown
              value={availableTimeValue}
              onChange={setAvailableTimeValue}
              onClose={() => setShowAvailableTimeDropdown(false)}
            />
          )}
        </View>

        {/* Cuisine Type */}
        <View className="mb-4">
          <Text
            className={`text-left text-base mb-1 ${
              hasAttemptedSubmit && !validateCuisines()
                ? 'text-red-500'
                : 'text-black'
            }`}
          >
            Cuisine Type {hasAttemptedSubmit && !validateCuisines() && '*'}
          </Text>

          <TouchableOpacity
            className={`w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center ${
              hasAttemptedSubmit && !validateCuisines()
                ? 'border-2 border-red-500'
                : ''
            }`}
            onPress={() => setShowCuisineDropdown(!showCuisineDropdown)}
          >
            <View className="flex-1">
              {selectedCuisine ? (
                <View className="bg-[#E05910] border border-[#F59E0B] rounded-lg px-3 py-2 flex-row items-center justify-between">
                  <Text className="text-white text-sm font-medium">
                    {selectedCuisine}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCuisine(null)}>
                    <Text className="text-white font-bold text-sm ml-2">✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text className="text-gray-900">Select cuisine type</Text>
              )}
            </View>
            <Text className="text-black font-bold text-lg ml-2">
              {showCuisineDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showCuisineDropdown && (
            <CuisineTypeDropdown
              selectedCuisine={selectedCuisine}
              onChange={(cuisine) => {
                setSelectedCuisine(cuisine);
                setShowCuisineDropdown(false); // auto close after select
              }}
              onClose={() => setShowCuisineDropdown(false)}
            />
          )}
        </View>

        {/* Price Range */}
        <View className="mb-4">
          <Text className={`text-left text-base pb-1 ${hasAttemptedSubmit && !validatePriceRange() ? 'text-red-500' : 'text-black'}`}>
            Price Range {hasAttemptedSubmit && !validatePriceRange() && '*'}
          </Text>
          <View className="flex-row">
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && priceRange && !validatePriceRange() ? 'border-2 border-red-500' : ''}`}
              value={priceRange}
              onChangeText={handlePriceRangeChange}
              placeholder="Price Range"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Reservation Fee */}
        <View className="mb-4">
          <Text className={`text-left text-base pb-1 ${hasAttemptedSubmit && !validateReservationFee() ? 'text-red-500' : 'text-black'}`}>
            Reservation Fee {hasAttemptedSubmit && !validateReservationFee() && '*'}
          </Text>
          <View className="flex-row">
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${hasAttemptedSubmit && reservationFee && !validateReservationFee() ? 'border-2 border-red-500' : ''}`}
              value={reservationFee}
              onChangeText={handleReservationFeeChange}
              placeholder="Reservation Fee"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text
            className={`text-left text-base mb-1 ${
              hasAttemptedSubmit && !validatePaymentMethods()
                ? 'text-red-500'
                : 'text-black'
            }`}
          >
            Payment Method {hasAttemptedSubmit && !validatePaymentMethods() && '*'}
          </Text>

          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={setSelectedPaymentMethod}
          />
        </View>


        {/* Submit Button */}
        <TouchableOpacity
          className="w-full rounded-lg py-4 mb-4 bg-[#E05910] shadow-lg"
          onPress={handleSubmit}
        >
          <Text className="text-center text-lg font-bold text-white">
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
 
  );
}