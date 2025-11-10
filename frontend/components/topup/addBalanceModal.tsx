import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseModal from '../base-modal';

interface AddBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: (amount: string) => void;
  isLoading?: boolean;
}

export default function AddBalanceModal({
  visible,
  onClose,
  onNext,
  isLoading = false,
}: AddBalanceModalProps) {
  const [amount, setAmount] = useState('');

  const handleNext = () => {
    // Basic validation — ensure non-empty and numeric
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }
    onNext(amount);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      showBackButton
      onBack={onClose}
      width="default"
    >
      <View className="w-full max-w-md self-center p-6">
        {/* Header */}
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          How much money do you want to add?
        </Text>

        {/* Amount input box (center) */}
        <View className="mb-6">
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <Text className="text-gray-500 mr-2">฿</Text>
            <TextInput
              className="flex-1 text-2xl text-gray-900"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading || !amount || Number(amount) <= 0}
          className={`w-full rounded-lg py-3 ${
            isLoading || !amount || Number(amount) <= 0
              ? 'bg-gray-300'
              : 'bg-amber-600'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium text-center">Next</Text>
          )}
        </TouchableOpacity>

        {/* Stripe information */}
        <Text className="text-sm text-gray-500 mt-4 text-center">
          You will be redirected to Stripe to complete the payment.
        </Text>
      </View>
    </BaseModal>
  );
}
