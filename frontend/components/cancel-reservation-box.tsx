import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

interface CancelReservationBoxProps {
  reservationName?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  visible: boolean;
}

export default function CancelReservationBox({
  reservationName,
  onConfirm,
  onCancel,
  confirmText = 'Cancel Reservation',
  cancelText = 'Go Back',
  visible,
}: CancelReservationBoxProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Blurred background overlay */}
      <Pressable
        className="flex-1 bg-white/60 backdrop-blur-sm justify-center items-center"
        onPress={onCancel}
        style={{ minHeight: '100%' }}
      >
        <View className="bg-white rounded-2xl p-6 mx-4 shadow-2xl w-11/12 max-w-md">
          {/* Header with Warning Icon and Title */}
          <View className="flex-row items-center justify-center mb-6">
            <View className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">!</Text>
            </View>
            <Text className="text-xl font-semibold text-black">
              Cancel Reservation
            </Text>
          </View>

          {/* Message */}
          <View className="mb-6">
            <Text className="text-gray-600 text-center text-base leading-6">
              Are you sure you want to cancel your reservation
              {reservationName ? ` for "${reservationName}"` : ''}?
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-red-500 py-4 rounded-xl shadow"
              onPress={onConfirm}
            >
              <Text className="font-medium text-center text-base text-white">
                {confirmText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-300 py-4 rounded-xl"
              onPress={onCancel}
            >
              <Text className="text-gray-700 font-medium text-center text-base">
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
