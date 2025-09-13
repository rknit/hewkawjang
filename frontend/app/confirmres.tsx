import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';

// Theme colors (matching ReservationForm)
const brand = {
  bg: '#fff7f0',
  surface: '#ffffff',
  primary: '#ff6a00',
  text: '#2e2a26',
  subtext: '#80756a',
  border: '#f1e5da',
  blue: '#007AFF',
  red: '#FF3B30',
};

interface ReservationData {
  id: number;
  userId: number;
  restaurantId: number;
  reserveAt: string;
  reservationfee: number;
  numberOfAdult: number;
  numberOfChildren: number;
  status:
    | 'unconfirmed'
    | 'expired'
    | 'confirmed'
    | 'cancelled'
    | 'rejected'
    | 'completed'
    | 'uncompleted';
  specialRequest?: string;
  createdAt: string;
  // User data (from usersTable)
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  // Restaurant data (from restaurantTable)
  restaurantName: string;
  restaurantPhoneNo: string;
  // Address fields
  houseNo?: string;
  village?: string;
  building?: string;
  road?: string;
  soi?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

interface ConfirmResProps {
  visible: boolean;
  onClose: () => void;
  reservationData?: ReservationData;
  onCancel?: () => void;
  onWaitingPayment?: () => void;
}

export default function ConfirmResPane({
  visible,
  onClose,
  reservationData,
  onCancel,
  onWaitingPayment,
}: ConfirmResProps) {
  // Default reservation data for demo
  const defaultData: ReservationData = {
    id: 100,
    userId: 1,
    restaurantId: 1,
    reserveAt: '2021-04-05T10:00:00Z',
    reservationfee: 200000,
    numberOfAdult: 2,
    numberOfChildren: 0,
    status: 'confirmed',
    specialRequest: '',
    createdAt: '2021-04-05T02:05:00Z',
    // User data
    firstName: 'Nguyễn Văn',
    lastName: 'A',
    email: 'nguyenvan@gmail.com',
    phoneNo: '09876465xxx',
    // Restaurant data
    restaurantName: 'AN BBQ Su Van Hanh',
    restaurantPhoneNo: '02-123-4567',
    // Address
    houseNo: '123',
    road: 'Sukhumvit',
    soi: 'Soi 21',
    subDistrict: 'Khlong Toei Nuea',
    district: 'Watthana',
    province: 'Bangkok',
    postalCode: '10110',
  };

  const data = reservationData || defaultData;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="w-11/12 max-h-[90%] rounded-2xl p-4"
          style={{ backgroundColor: brand.surface }}
        >
          <ScrollView>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold" style={{ color: brand.text }}>
                RESERVATION ID: {data.id}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: brand.blue }}
              >
                <Text className="text-white font-bold text-lg">×</Text>
              </TouchableOpacity>
            </View>

            {/* Reservation Details */}
            <View className="space-y-3">
              <DetailRow
                label="Full name:"
                value={`${data.firstName} ${data.lastName}`}
              />
              <DetailRow label="Phone number:" value={data.phoneNo} />
              <DetailRow label="Email:" value={data.email} />
              <DetailRow label="Restaurant:" value={data.restaurantName} />
              <DetailRow
                label="Date:"
                value={new Date(data.reserveAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <DetailRow
                label="Time:"
                value={new Date(data.reserveAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              />
              <DetailRow
                label="Adults:"
                value={data.numberOfAdult.toString()}
              />
              <DetailRow
                label="Children:"
                value={data.numberOfChildren.toString()}
              />

              {/* Special Request */}
              {data.specialRequest && (
                <DetailRow
                  label="Special Request:"
                  value={data.specialRequest}
                />
              )}

              <DetailRow
                label="Reservation Fee:"
                value={`${data.reservationfee.toLocaleString()} vnđ`}
              />

              {/* Status */}
              <View className="mt-3">
                <Text
                  className="text-sm font-bold mb-2"
                  style={{ color: brand.text }}
                >
                  Status:
                </Text>
                <Text className="text-sm mb-1" style={{ color: brand.subtext }}>
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </Text>
                <Text className="text-sm" style={{ color: brand.subtext }}>
                  Created: {new Date(data.createdAt).toLocaleString()}
                </Text>
              </View>

              {/* Restaurant Address */}
              <View className="mt-3">
                <Text
                  className="text-sm font-bold mb-2"
                  style={{ color: brand.text }}
                >
                  Restaurant Address:
                </Text>
                <Text className="text-sm" style={{ color: brand.subtext }}>
                  {[
                    data.houseNo,
                    data.building,
                    data.road,
                    data.soi,
                    data.subDistrict,
                    data.district,
                    data.province,
                    data.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-6 space-x-3">
              <TouchableOpacity
                onPress={onCancel || onClose}
                className="flex-1 py-3 rounded-xl items-center border"
                style={{
                  backgroundColor: brand.surface,
                  borderColor: brand.red,
                  borderWidth: 1,
                }}
              >
                <Text className="font-bold" style={{ color: brand.red }}>
                  CANCEL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onWaitingPayment || onClose}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: brand.blue }}
              >
                <Text className="font-bold text-white">WAITING PAYMENT</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="text-sm font-bold w-32" style={{ color: brand.text }}>
        {label}
      </Text>
      <Text className="text-sm flex-1" style={{ color: brand.text }}>
        {value}
      </Text>
    </View>
  );
}
