import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import ImageChooser from './image-chooser';
import AvailableTimeDropdown from './available-time-dropdown';
import ProvinceDropdown from './province-dropdown';
import CuisineTypeDropdown from './cuisine-type-dropdown';
import PaymentMethodSelector from './payment-method-selector';

export default function RegisterRestaurantForm() {
  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Dropdown states
  const [showAvailableTimeDropdown, setShowAvailableTimeDropdown] =
    useState(false);
  const [availableTimeValue, setAvailableTimeValue] = useState<any>(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);

  // Validation state - only show validation errors after submit attempt
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validation functions
  const validateRestaurantName = (name: string): boolean => {
    // Must contain string without special characters (only letters, numbers, spaces)
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    return name.trim().length > 0 && nameRegex.test(name.trim());
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Must contain only numbers, length is 10, leading by 0 only
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateLocation = (location: string): boolean => {
    // Must contain string (non-empty)
    return location.trim().length > 0;
  };

  const validatePostalCode = (postal: string): boolean => {
    // Must contain only numbers
    const postalRegex = /^[0-9]+$/;
    return postal.trim().length > 0 && postalRegex.test(postal);
  };

  const validateProvince = (): boolean => {
    // Must have selected province in dropdown
    return selectedProvince !== null && selectedProvince.trim().length > 0;
  };

  const validateAvailableTime = (): boolean => {
    // Must show at least one day/time open-close
    if (
      !availableTimeValue ||
      !availableTimeValue.selectedDays ||
      availableTimeValue.selectedDays.length === 0
    ) {
      return false;
    }

    // Check if at least one day has valid time range
    return availableTimeValue.selectedDays.some((dayIdx: number) => {
      const timeRange = availableTimeValue.timeRanges[dayIdx];
      return timeRange && timeRange.start && timeRange.end;
    });
  };

  const validateCuisines = (): boolean => {
    // At least one cuisine selected
    return selectedCuisines.length > 0;
  };

  const validatePriceRange = (): boolean => {
    // Price range validation: contain numbers only and left < right
    if (!priceMin || !priceMax) return false;

    const minRegex = /^[0-9]+$/;
    const maxRegex = /^[0-9]+$/;

    if (!minRegex.test(priceMin) || !maxRegex.test(priceMax)) return false;

    const minPrice = parseInt(priceMin);
    const maxPrice = parseInt(priceMax);

    return minPrice < maxPrice;
  };

  const validatePaymentMethods = (): boolean => {
    // Must select at least one payment method
    return selectedPaymentMethods.length > 0;
  };

  // Overall form validation
  const isFormValid = (): boolean => {
    return (
      validateRestaurantName(restaurantName) &&
      validatePhoneNumber(phoneNumber) &&
      validateLocation(address) &&
      validateLocation(subDistrict) &&
      validateLocation(district) &&
      validatePostalCode(postalCode) &&
      validateProvince() &&
      validateAvailableTime() &&
      validateCuisines() &&
      validatePriceRange() &&
      validatePaymentMethods()
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    setHasAttemptedSubmit(true); // Mark that user has attempted to submit

    if (!isFormValid()) {
      let errorMessage = 'Please fix the following issues:\n\n';

      if (!validateRestaurantName(restaurantName)) {
        errorMessage +=
          '• Restaurant name must contain only letters, numbers, and spaces\n';
      }
      if (!validatePhoneNumber(phoneNumber)) {
        errorMessage += '• Phone number must be 10 digits starting with 0\n';
      }
      if (!validateLocation(address)) {
        errorMessage += '• Address is required\n';
      }
      if (!validateLocation(subDistrict)) {
        errorMessage += '• Sub-district is required\n';
      }
      if (!validateLocation(district)) {
        errorMessage += '• District is required\n';
      }
      if (!validatePostalCode(postalCode)) {
        errorMessage += '• Postal code must contain only numbers\n';
      }
      if (!validateProvince()) {
        errorMessage += '• Please select a province\n';
      }
      if (!validateAvailableTime()) {
        errorMessage += '• Please set at least one day with opening hours\n';
      }
      if (!validateCuisines()) {
        errorMessage += '• Please select at least one cuisine type\n';
      }
      if (!validatePriceRange()) {
        errorMessage +=
          '• Price range must be valid numbers with minimum < maximum\n';
      }
      if (!validatePaymentMethods()) {
        errorMessage += '• Please select at least one payment method\n';
      }

      Alert.alert('Validation Error', errorMessage);
      return;
    }

    // If validation passes, submit the form
    Alert.alert('Success!', 'Restaurant registration submitted successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Here you would typically make an API call to submit the data
          console.log('Form submitted with data:', {
            restaurantName,
            phoneNumber,
            address,
            subDistrict,
            district,
            postalCode,
            selectedProvince,
            availableTimeValue,
            selectedCuisines,
            priceMin,
            priceMax,
            selectedPaymentMethods,
          });
        },
      },
    ]);
  };

  // Handle phone number input
  const handlePhoneNumberChange = (text: string) => {
    // Only allow numbers, max 10 digits, must start with 0
    let digits = text.replace(/[^0-9]/g, '');
    if (digits.length > 0 && digits[0] !== '0') {
      digits = '0' + digits.slice(0, 9);
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    setPhoneNumber(digits);
  };

  // Handle postal code input
  const handlePostalCodeChange = (text: string) => {
    // Only allow numbers
    const digits = text.replace(/[^0-9]/g, '');
    setPostalCode(digits);
  };

  // Handle price input
  const handlePriceMinChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setPriceMin(digits);
  };

  const handlePriceMaxChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setPriceMax(digits);
  };

  const formatAvailableTimeDisplay = () => {
    if (
      !availableTimeValue ||
      !availableTimeValue.selectedDays ||
      availableTimeValue.selectedDays.length === 0
    ) {
      return null;
    }

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const sortedDays = availableTimeValue.selectedDays.sort(
      (a: number, b: number) => a - b,
    );

    return sortedDays
      .map((dayIdx: number) => {
        const timeRange = availableTimeValue.timeRanges[dayIdx];
        if (!timeRange) return null;

        return {
          day: dayNames[dayIdx],
          startTime: timeRange.start, // Keep 24-hour format
          endTime: timeRange.end, // Keep 24-hour format
        };
      })
      .filter(Boolean);
  };

  const timeDisplayData = formatAvailableTimeDisplay();
  return (
    <View className="h-full w-3/5 bg-white p-16 pr-32 overflow-y-auto">
      <View className="bg-[#FEF9F3] rounded-2xl border border-[#FAE8D1] shadow p-16 mb-16">
        <Text className="text-left text-2xl font-bold mb-8">
          Register Restaurant
        </Text>

        <Text className="text-left text-base mb-1">Restaurant Name</Text>
        <TextInput
          className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
            hasAttemptedSubmit &&
            restaurantName &&
            !validateRestaurantName(restaurantName)
              ? 'border-2 border-red-500'
              : ''
          }`}
          value={restaurantName}
          onChangeText={setRestaurantName}
          placeholder="e.g. Somtum Paradise"
          placeholderTextColor="#9ca3af"
        />
        {hasAttemptedSubmit &&
          restaurantName &&
          !validateRestaurantName(restaurantName) && (
            <Text className="text-red-500 text-sm mb-2">
              Restaurant name must contain only letters, numbers, and spaces
            </Text>
          )}
        {hasAttemptedSubmit && !restaurantName && (
          <Text className="text-red-500 text-sm mb-2">
            Restaurant name is required
          </Text>
        )}

        <ImageChooser />

        <Text className="text-left text-base mb-1">Phone Number</Text>
        <TextInput
          className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
            hasAttemptedSubmit &&
            phoneNumber &&
            !validatePhoneNumber(phoneNumber)
              ? 'border-2 border-red-500'
              : ''
          }`}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder="e.g. 0812345678"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
        />
        {hasAttemptedSubmit &&
          phoneNumber &&
          !validatePhoneNumber(phoneNumber) && (
            <Text className="text-red-500 text-sm mb-2">
              Phone number must be 10 digits starting with 0
            </Text>
          )}
        {hasAttemptedSubmit && !phoneNumber && (
          <Text className="text-red-500 text-sm mb-2">
            Phone number is required
          </Text>
        )}

        <Text className="mb-2 text-base font-medium underline">Location</Text>
        <Text className="text-left text-base mb-1">Address</Text>
        <TextInput
          className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
            hasAttemptedSubmit && address && !validateLocation(address)
              ? 'border-2 border-red-500'
              : ''
          }`}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
        {hasAttemptedSubmit && address && !validateLocation(address) && (
          <Text className="text-red-500 text-sm mb-2">Address is required</Text>
        )}
        {hasAttemptedSubmit && !address && (
          <Text className="text-red-500 text-sm mb-2">Address is required</Text>
        )}

        <View className="flex-row">
          <View className="flex-1 pr-1">
            <Text className="text-left text-base pb-1">Sub-district</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
                hasAttemptedSubmit &&
                subDistrict &&
                !validateLocation(subDistrict)
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              value={subDistrict}
              onChangeText={setSubDistrict}
              placeholder="Sub-district"
              placeholderTextColor="#9ca3af"
            />
            {hasAttemptedSubmit &&
              subDistrict &&
              !validateLocation(subDistrict) && (
                <Text className="text-red-500 text-xs mb-2">Required</Text>
              )}
            {hasAttemptedSubmit && !subDistrict && (
              <Text className="text-red-500 text-xs mb-2">Required</Text>
            )}
          </View>
          <View className="flex-1 pl-1">
            <Text className="text-left text-base pb-1">District</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
                hasAttemptedSubmit && district && !validateLocation(district)
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              value={district}
              onChangeText={setDistrict}
              placeholder="District"
              placeholderTextColor="#9ca3af"
            />
            {hasAttemptedSubmit && district && !validateLocation(district) && (
              <Text className="text-red-500 text-xs mb-2">Required</Text>
            )}
            {hasAttemptedSubmit && !district && (
              <Text className="text-red-500 text-xs mb-2">Required</Text>
            )}
          </View>
        </View>

        <View className="flex-row">
          <View className="flex-1 pr-1">
            <Text className="text-left text-base pb-1">Province</Text>
            {!selectedProvince ? (
              <TouchableOpacity
                className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center"
                onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
              >
                <Text className="text-gray-900">Select a province</Text>
                <Text className="text-black font-bold text-lg">
                  {showProvinceDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center"
                onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
              >
                <Text className="text-gray-900">{selectedProvince}</Text>
                <Text className="text-black font-bold text-lg">
                  {showProvinceDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            )}
            {showProvinceDropdown && (
              <View className="mb-4">
                <ProvinceDropdown
                  value={selectedProvince}
                  onChange={(province) => {
                    setSelectedProvince(province);
                    setShowProvinceDropdown(false);
                  }}
                  onClose={() => setShowProvinceDropdown(false)}
                />
              </View>
            )}
          </View>
          <View className="flex-1 pl-1">
            <Text className="text-left text-base pb-1">Postal Code</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
                hasAttemptedSubmit &&
                postalCode &&
                !validatePostalCode(postalCode)
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              value={postalCode}
              onChangeText={handlePostalCodeChange}
              placeholder="Postal code"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={5}
            />
            {hasAttemptedSubmit &&
              postalCode &&
              !validatePostalCode(postalCode) && (
                <Text className="text-red-500 text-xs mb-2">Numbers only</Text>
              )}
            {hasAttemptedSubmit && !postalCode && (
              <Text className="text-red-500 text-xs mb-2">Required</Text>
            )}
          </View>
        </View>

        <View className="border-b border-gray-400 mt-1 mb-6" />

        {/* Available Time with validation indicator */}
        <View className="mb-4">
          <Text
            className={`text-left text-base mb-1 ${
              hasAttemptedSubmit && !validateAvailableTime()
                ? 'text-red-500'
                : 'text-black'
            }`}
          >
            Available Time{' '}
            {hasAttemptedSubmit && !validateAvailableTime() && '*'}
          </Text>

          {!timeDisplayData || timeDisplayData.length === 0 ? (
            <TouchableOpacity
              className={`w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center ${
                hasAttemptedSubmit && !validateAvailableTime()
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              onPress={() =>
                setShowAvailableTimeDropdown(!showAvailableTimeDropdown)
              }
            >
              <Text className="text-gray-900">Select available time</Text>
              <Text className="text-black font-bold text-lg">
                {showAvailableTimeDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mb-4">
              <View className="bg-[#FEF9F3] rounded-lg border border-[#000000] p-4">
                <TouchableOpacity
                  className="flex-row justify-between items-center mb-3"
                  onPress={() =>
                    setShowAvailableTimeDropdown(!showAvailableTimeDropdown)
                  }
                >
                  <Text className="text-black font-semibold text-lg">
                    Available Time
                  </Text>
                  <Text className="text-black font-bold text-lg">
                    {showAvailableTimeDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {timeDisplayData.map((item: any, index: number) => (
                  <View key={index} className="mb-2">
                    <Text className="text-black text-base">
                      {item.day} : {item.startTime} - {item.endTime}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hasAttemptedSubmit && !validateAvailableTime() && (
            <Text className="text-red-500 text-sm mb-2">
              Please set at least one day with opening hours
            </Text>
          )}

          {showAvailableTimeDropdown && (
            <View className="mb-4">
              <AvailableTimeDropdown
                value={availableTimeValue}
                onChange={(value) => {
                  setAvailableTimeValue(value);
                }}
                onClose={() => setShowAvailableTimeDropdown(false)}
              />
            </View>
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
          {selectedCuisines.length === 0 ? (
            <TouchableOpacity
              className={`w-full rounded px-3 py-2 mb-4 bg-[#FAE8D1] flex-row justify-between items-center ${
                hasAttemptedSubmit && !validateCuisines()
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              onPress={() => setShowCuisineDropdown(!showCuisineDropdown)}
            >
              <Text className="text-gray-900">Select cuisine types</Text>
              <Text className="text-black font-bold text-lg">
                {showCuisineDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mb-4">
              <TouchableOpacity
                className="w-full rounded px-3 py-2 bg-[#FAE8D1] flex-row justify-between items-center"
                onPress={() => setShowCuisineDropdown(!showCuisineDropdown)}
              >
                <View className="flex-1">
                  <View className="flex-row flex-wrap">
                    {selectedCuisines.map((cuisine, index) => (
                      <View
                        key={cuisine}
                        className="bg-[#E05910] border border-[#F59E0B] rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center"
                      >
                        <Text className="text-white text-sm font-medium mr-2">
                          {cuisine}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCuisines(
                              selectedCuisines.filter(
                                (item) => item !== cuisine,
                              ),
                            );
                          }}
                        >
                          <Text className="text-white font-bold text-sm">
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                <Text className="text-black font-bold text-lg ml-2">
                  {showCuisineDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {hasAttemptedSubmit && !validateCuisines() && (
            <Text className="text-red-500 text-sm mb-2">
              Please select at least one cuisine type
            </Text>
          )}

          {showCuisineDropdown && (
            <View className="mb-4">
              <CuisineTypeDropdown
                selectedCuisines={selectedCuisines}
                onChange={setSelectedCuisines}
                onClose={() => setShowCuisineDropdown(false)}
              />
            </View>
          )}
        </View>

        {/* Price Range */}
        <View className="mb-4">
          <Text
            className={`text-left text-base pb-1 ${
              hasAttemptedSubmit && !validatePriceRange()
                ? 'text-red-500'
                : 'text-black'
            }`}
          >
            Price Range {hasAttemptedSubmit && !validatePriceRange() && '*'}
          </Text>
          <View className="flex-row">
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
                hasAttemptedSubmit && priceMin && !validatePriceRange()
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              value={priceMin}
              onChangeText={handlePriceMinChange}
              placeholder="Min price"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
            <Text className="font-bold mx-2">:</Text>
            <TextInput
              className={`w-full rounded px-3 py-2 mb-1 bg-[#FAE8D1] ${
                hasAttemptedSubmit && priceMax && !validatePriceRange()
                  ? 'border-2 border-red-500'
                  : ''
              }`}
              value={priceMax}
              onChangeText={handlePriceMaxChange}
              placeholder="Max price"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>
          {hasAttemptedSubmit &&
            !validatePriceRange() &&
            (priceMin || priceMax) && (
              <Text className="text-red-500 text-sm mb-2">
                Price range must be valid numbers with minimum &lt; maximum
              </Text>
            )}
          {hasAttemptedSubmit && !priceMin && !priceMax && (
            <Text className="text-red-500 text-sm mb-2">
              Both minimum and maximum prices are required
            </Text>
          )}
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text
            className={`text-left text-base mb-1 ${
              hasAttemptedSubmit && !validatePaymentMethods()
                ? 'text-red-500'
                : 'text-black'
            }`}
          >
            Payment Methods{' '}
            {hasAttemptedSubmit && !validatePaymentMethods() && '*'}
          </Text>
          <PaymentMethodSelector
            selectedMethods={selectedPaymentMethods}
            onMethodSelect={setSelectedPaymentMethods}
            className="mb-4"
          />
          {hasAttemptedSubmit && !validatePaymentMethods() && (
            <Text className="text-red-500 text-sm mb-2">
              Please select at least one payment method
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="w-full rounded-lg py-4 mb-4 bg-[#E05910] shadow-lg"
          onPress={handleSubmit}
        >
          <Text className="text-center text-lg font-bold text-white">
            Submit Registration
          </Text>
        </TouchableOpacity>

        {/* Validation Summary */}
        {/* {hasAttemptedSubmit && !isFormValid() && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-700 font-semibold mb-2">
              Please complete:
            </Text>
            {!validateRestaurantName(restaurantName) && (
              <Text className="text-red-600 text-sm">
                • Valid restaurant name
              </Text>
            )}
            {!validatePhoneNumber(phoneNumber) && (
              <Text className="text-red-600 text-sm">
                • Valid phone number (10 digits, starting with 0)
              </Text>
            )}
            {!validateLocation(address) && (
              <Text className="text-red-600 text-sm">• Address</Text>
            )}
            {!validateLocation(subDistrict) && (
              <Text className="text-red-600 text-sm">• Sub-district</Text>
            )}
            {!validateLocation(district) && (
              <Text className="text-red-600 text-sm">• District</Text>
            )}
            {!validatePostalCode(postalCode) && (
              <Text className="text-red-600 text-sm">• Valid postal code</Text>
            )}
            {!validateProvince() && (
              <Text className="text-red-600 text-sm">• Province selection</Text>
            )}
            {!validateAvailableTime() && (
              <Text className="text-red-600 text-sm">
                • Available time schedule
              </Text>
            )}
            {!validateCuisines() && (
              <Text className="text-red-600 text-sm">
                • Cuisine type selection
              </Text>
            )}
            {!validatePriceRange() && (
              <Text className="text-red-600 text-sm">• Valid price range</Text>
            )}
            {!validatePaymentMethods() && (
              <Text className="text-red-600 text-sm">
                • Payment method selection
              </Text>
            )}
          </View>
        )} */}
      </View>
    </View>
  );
}
