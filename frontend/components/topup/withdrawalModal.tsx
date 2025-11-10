import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface WithdrawalModalProps {
  modalVisible: boolean;
  onCancel: () => void;
  onConfirm: (data: {
    amount: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
  }) => void;
  isLoading?: boolean;
}

export default function WithdrawalModal({
  modalVisible,
  onCancel,
  onConfirm,
  isLoading = false,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleCancel = () => {
    setAmount('');
    setBankName('');
    setAccountName('');
    setAccountNumber('');
    onCancel();
  };

  const handleConfirmWithdraw = () => {
    onConfirm({
      amount,
      bankName,
      accountName,
      accountNumber,
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-900">
                Withdraw Funds
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                className="p-1"
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
              {/* Amount Input */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Amount</Text>
                <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
                  <Text className="text-gray-500 mr-2">฿</Text>
                  <TextInput
                    className="flex-1 text-base text-gray-900"
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Bank Name Input */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Bank Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                  placeholder="e.g., Bangkok Bank"
                  value={bankName}
                  onChangeText={setBankName}
                  editable={!isLoading}
                />
              </View>

              {/* Account Name Input */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Account Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                  placeholder="Account holder name"
                  value={accountName}
                  onChangeText={setAccountName}
                  editable={!isLoading}
                />
              </View>

              {/* Account Number Input */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-2">
                  Account Number
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                  placeholder="Account number"
                  keyboardType="number-pad"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  editable={!isLoading}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 pb-6">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 border border-gray-300 rounded-lg py-3"
                  disabled={isLoading}
                >
                  <Text className="text-gray-700 font-medium text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmWithdraw}
                  className="flex-1 bg-amber-600 rounded-lg py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">
                      Confirm Withdraw
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
