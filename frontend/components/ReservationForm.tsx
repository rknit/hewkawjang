import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { fetchCurrentUser } from '@/apis/user.api';
import { User } from '@/types/user.type';
import { fetchRestaurants, fetchRestaurantById } from '@/apis/restaurant.api';
import { Restaurant } from '@/types/restaurant.type';
import { createReservation } from '@/apis/reservation.api';
import {
  pad,
  addMinutes,
  startOfDay,
  isSameDay,
  formatDateISO,
  MINUTE_STEPS,
  getValidHours,
  getValidMinutes,
  getDefaultMinute,
} from '@/utils/date-time';
import { reservationTheme as brand, calendarTheme } from '@/utils/theme';
import { login } from '@/apis/auth.api';

export default function ReservationPane({
  visible = true,
  onClose,
  restaurantId,
}: {
  visible: boolean;
  onClose: () => void;
  restaurantId?: number;
}) {
  const now = new Date();
  const [adults, setAdults] = useState<number>(2);
  const [seniors, setSeniors] = useState<number>(0);
  const [children, setChildren] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [date, setDate] = useState<string>(() => formatDateISO(now));

  // time (HH and mm columns)
  const [hour, setHour] = useState<number>(() => now.getHours());
  const [minute, setMinute] = useState<number>(() => getDefaultMinute(now));

  // Dropdown visibility states
  const [showHourDropdown, setShowHourDropdown] = useState<boolean>(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState<boolean>(false);

  // compute earliest allowed Date = now + 30 minutes
  const earliest = useMemo(() => addMinutes(now, 30), [now]);

  // Clamp selected time if the selected date is today and time < earliest
  useEffect(() => {
    const picked = new Date(`${date}T${pad(hour)}:${pad(minute)}:00`);
    if (isSameDay(picked, earliest) && picked < earliest) {
      const eh = earliest.getHours();
      const em = getDefaultMinute(earliest);
      setHour(eh);
      setMinute(em);
    }
  }, [date, hour, minute, earliest]);

  // list of valid hours for chosen date
  const validHours = useMemo(
    () => getValidHours(date, earliest, now),
    [date, earliest, now],
  );

  // list of valid minutes depending on hour when date is today
  const validMinutes = useMemo(
    () => getValidMinutes(date, hour, earliest, now),
    [date, hour, earliest, now],
  );

  // keep minute valid when hour changes
  useEffect(() => {
    if (!validMinutes.includes(minute)) setMinute(validMinutes[0] ?? 0);
  }, [hour, validMinutes]);

  // Fetch user and restaurant data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);

        if (restaurantId != null) {
          const r = await fetchRestaurantById(restaurantId);
          if (r) {
            setRestaurant(r);
          } else {
            const restaurant = await fetchRestaurantById(1);
            console.log(restaurant);
            setRestaurant(restaurant);
          }
        } else {
          const restaurants = await fetchRestaurants();
          if (restaurants && restaurants.length > 0) {
            setRestaurant(restaurants[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (visible) {
      loadData();
    }
  }, [visible, restaurantId]);

  const totalGuests = adults + seniors + children;

  function onNext() {
    setShowConfirmation(true);
  }

  async function onConfirmReservation() {
    try {
      if (!restaurant) {
        Alert.alert('Error', 'No restaurant selected');
        return;
      }

      const reserveAt = new Date(`${date}T${pad(hour)}:${pad(minute)}:00`);
      const payload = {
        restaurantId: restaurant.id,
        reserveAt: reserveAt.toISOString(),
        numberOfAdult: adults,
        numberOfChildren: children,
      };

      await createReservation(payload);
      Alert.alert('Success', 'Reservation created successfully');
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Failed to create reservation:', error);
      Alert.alert('Error', 'Failed to create reservation. Please try again.');
    }
  }

  function onCancelConfirmation() {
    setShowConfirmation(false);
  }

  // restrict calendar to 7 days range
  const todayISO = formatDateISO(now);
  const maxDate = formatDateISO(addMinutes(startOfDay(now), 7 * 24 * 60));

  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          // tap outside closes dropdowns (or call onClose() if you prefer)
          setShowHourDropdown(false);
          setShowMinuteDropdown(false);
        }}
        className="flex-1 justify-center items-center  bg-black/50"
      >
        {/* Sheet container */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="w-[30%] h-[90%] rounded-2xl p-6"
          style={{
            backgroundColor: brand.bg,
            borderTopWidth: 2,
            borderColor: brand.modalBorder,
          }}
        >
          <ScrollView className="flex-1">
            {/* Header with close button */}
            <View className="flex-row justify-between items-center mb-2 mt-2">
              <Text
                className="text-2xl font-bold"
                style={{ color: brand.text }}
              >
                {showConfirmation ? 'Confirm Reservation' : 'Reserve the Table'}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color={brand.text} />
              </TouchableOpacity>
            </View>

            {!showConfirmation ? (
              <>
                {/* Guests */}
                <View className="mb-6 items-center">
                  <View className="mb-4 ">
                    <View className="flex-row items-center ">
                      <View className="items-center mr-5 mb-2">
                        <Ionicons
                          name="person"
                          size={20}
                          color={brand.text}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: brand.text }}
                        >
                          Adults
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setAdults(Math.max(0, adults - 1))}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ borderWidth: 1, borderColor: brand.border }}
                      >
                        <Text
                          className="text-lg font-bold"
                          style={{ color: brand.text }}
                        >
                          -
                        </Text>
                      </TouchableOpacity>
                      <Text
                        className="text-lg font-bold mx-4 min-w-[40px] text-center"
                        style={{ color: brand.text }}
                      >
                        {adults}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setAdults(adults + 1)}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ borderWidth: 1, borderColor: brand.border }}
                      >
                        <Text
                          className="text-lg font-bold"
                          style={{ color: brand.text }}
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View>
                    <View className="flex-row items-center">
                      <View className="items-center mr-10 mb-2">
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={brand.text}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: brand.text }}
                        >
                          Kids
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setChildren(Math.max(0, children - 1))}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ borderWidth: 1, borderColor: brand.border }}
                      >
                        <Text
                          className="text-lg font-bold"
                          style={{ color: brand.text }}
                        >
                          -
                        </Text>
                      </TouchableOpacity>
                      <Text
                        className="text-lg font-bold mx-4 min-w-[40px] text-center"
                        style={{ color: brand.text }}
                      >
                        {children}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setChildren(children + 1)}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ borderWidth: 1, borderColor: brand.border }}
                      >
                        <Text
                          className="text-lg font-bold"
                          style={{ color: brand.text }}
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Date (calendar) */}
                <View className="mb-2">
                  <Text
                    className="text-lg font-semibold mb-3"
                    style={{ color: brand.text }}
                  >
                    Date :
                  </Text>
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: '#EB905D',
                      borderRadius: 8,
                    }}
                  >
                    <Calendar
                      current={todayISO}
                      minDate={todayISO}
                      maxDate={maxDate}
                      onDayPress={(day) => setDate(day.dateString)}
                      markedDates={{
                        [date]: {
                          selected: true,
                          selectedColor: brand.primary,
                        },
                      }}
                      theme={calendarTheme}
                    />
                  </View>
                </View>

                {/* Time */}
                <View className="mb-6">
                  <Text
                    className="text-lg font-semibold mb-3"
                    style={{ color: brand.text }}
                  >
                    Time :
                  </Text>
                  <View className="flex-row items-center">
                    <View className="flex-1 mr-2">
                      <TouchableOpacity
                        onPress={() => {
                          setShowHourDropdown(!showHourDropdown);
                          setShowMinuteDropdown(false);
                        }}
                        className="flex-row items-center justify-between px-4 py-3 rounded-lg"
                        style={{
                          borderWidth: 1,
                          borderColor: brand.border,
                          backgroundColor: brand.surface,
                        }}
                      >
                        <Text className="text-lg" style={{ color: brand.text }}>
                          {pad(hour)}
                        </Text>
                        <Ionicons
                          name={
                            showHourDropdown ? 'chevron-up' : 'chevron-down'
                          }
                          size={20}
                          color={brand.text}
                        />
                      </TouchableOpacity>

                      {/* Hour Dropdown */}
                      {showHourDropdown && (
                        <View
                          className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg"
                          style={{
                            borderWidth: 1,
                            borderColor: brand.border,
                            backgroundColor: brand.surface,
                            maxHeight: 200,
                          }}
                        >
                          <ScrollView style={{ maxHeight: 200 }}>
                            {validHours.map((h) => (
                              <TouchableOpacity
                                key={h}
                                onPress={() => {
                                  setHour(h);
                                  setShowHourDropdown(false);
                                }}
                                className="px-4 py-3"
                                style={{
                                  backgroundColor:
                                    h === hour ? brand.primary : brand.surface,
                                }}
                              >
                                <Text
                                  className="text-lg"
                                  style={{
                                    color: h === hour ? '#ffffff' : brand.text,
                                    fontWeight: h === hour ? 'bold' : 'normal',
                                  }}
                                >
                                  {pad(h)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    <Text
                      className="text-lg font-bold mx-2"
                      style={{ color: brand.text }}
                    >
                      :
                    </Text>

                    <View className="flex-1 ml-2">
                      <TouchableOpacity
                        onPress={() => {
                          setShowMinuteDropdown(!showMinuteDropdown);
                          setShowHourDropdown(false);
                        }}
                        className="flex-row items-center justify-between px-4 py-3 rounded-lg"
                        style={{
                          borderWidth: 1,
                          borderColor: brand.border,
                          backgroundColor: brand.surface,
                        }}
                      >
                        <Text className="text-lg" style={{ color: brand.text }}>
                          {pad(minute)}
                        </Text>
                        <Ionicons
                          name={
                            showMinuteDropdown ? 'chevron-up' : 'chevron-down'
                          }
                          size={20}
                          color={brand.text}
                        />
                      </TouchableOpacity>

                      {/* Minute Dropdown */}
                      {showMinuteDropdown && (
                        <View
                          className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg"
                          style={{
                            borderWidth: 1,
                            borderColor: brand.border,
                            backgroundColor: brand.surface,
                            maxHeight: 300,
                          }}
                        >
                          <ScrollView style={{ maxHeight: 300 }}>
                            {validMinutes.map((m) => (
                              <TouchableOpacity
                                key={m}
                                onPress={() => {
                                  setMinute(m);
                                  setShowMinuteDropdown(false);
                                }}
                                className="px-4 py-3"
                                style={{
                                  backgroundColor:
                                    m === minute
                                      ? brand.primary
                                      : brand.surface,
                                }}
                              >
                                <Text
                                  className="text-lg"
                                  style={{
                                    color:
                                      m === minute ? '#ffffff' : brand.text,
                                    fontWeight:
                                      m === minute ? 'bold' : 'normal',
                                  }}
                                >
                                  {pad(m)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {/* Summary */}
                <View
                  className="bg-gray-100 rounded-lg p-4 mt-20 mb-3"
                  style={{ zIndex: -1 }}
                >
                  <Text
                    className="text-lg font-semibold mb-2"
                    style={{ color: brand.text }}
                  >
                    Reservation Summary
                  </Text>
                  <View className="flex-row justify-between">
                    <Text
                      className="text-base"
                      style={{ color: brand.subtext }}
                    >
                      {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                    </Text>
                  </View>
                  <Text
                    className="text-base mt-1"
                    style={{ color: brand.subtext }}
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    <Text
                      className="text-base ml-2"
                      style={{ color: brand.subtext }}
                    >
                      At {pad(hour)}:{pad(minute)}
                    </Text>
                  </Text>
                </View>
              </>
            ) : (
              /* Confirmation Content */
              <View className="mb-6 pl-10 pt-10">
                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Username
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {user?.displayName ||
                      `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
                      'N/A'}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Phone number
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {user?.phoneNo || 'N/A'}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Email
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {user?.email || 'N/A'}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Restaurant
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {restaurant?.name || 'N/A'}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Date
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Time
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {new Date(
                      `2000-01-01T${pad(hour)}:${pad(minute)}:00`,
                    ).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Guests
                  </Text>
                  <Text className="text-xl text-gray-500">
                    Adult: {adults}, Kids: {children}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xl font-semibold mb-1 text-gray-600">
                    Restaurant Address
                  </Text>
                  <Text className="text-xl text-gray-500">
                    {restaurant
                      ? [
                          restaurant.houseNo,
                          restaurant.village,
                          restaurant.building,
                          restaurant.road,
                          restaurant.soi,
                          restaurant.subDistrict,
                          restaurant.district,
                          restaurant.province,
                          restaurant.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'N/A'
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {!showConfirmation ? (
            <TouchableOpacity
              onPress={onNext}
              disabled={totalGuests <= 0}
              className="rounded-xl items-center py-4"
              style={{
                backgroundColor: '#E46D2C',
                opacity: totalGuests <= 0 ? 0.6 : 1,
              }}
            >
              <Text className="font-bold text-white text-lg">Next</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onCancelConfirmation}
                className="flex-1 rounded-xl items-center py-4"
                style={{
                  backgroundColor: '#f3f4f6',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                }}
              >
                <Text
                  className="font-bold text-lg"
                  style={{ color: brand.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirmReservation}
                className="flex-1 rounded-xl items-center py-4"
                style={{
                  backgroundColor: brand.primary,
                }}
              >
                <Text className="font-bold text-white text-lg">Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
