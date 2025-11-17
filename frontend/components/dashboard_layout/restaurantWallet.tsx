import React, { useEffect, useState } from 'react';
import { fetchRestaurantById } from '@/apis/restaurant.api';
import { supabase } from '@/utils/supabase';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeWithdraw } from '@/apis/payment.api';

interface RestaurantWalletProps {
  restaurantId: number;
}

export default function RestaurantWallet({
  restaurantId,
}: RestaurantWalletProps) {
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  const loadData = async () => {
    const restaurant = await fetchRestaurantById(restaurantId);
    if (!restaurant) return;
    setBalance(restaurant.wallet || 0);
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  useEffect(() => {
    const channel = supabase
      .channel('restaurant-wallet-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurant',
          filter: `id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Restaurant wallet updated:', payload);
          if (payload.new && 'wallet' in payload.new) {
            setBalance((payload.new as any).wallet || 0);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const handleWithdrawPress = () => {
    setModalVisible(true);
  };

  const resetForm = () => {
    setAmount('');
    setAccountNumber('');
    setAccountName('');
    setBankName('');
  };

  const handleConfirmWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance.');
      return;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter account number.');
      return;
    }

    if (!accountName.trim()) {
      Alert.alert('Missing Information', 'Please enter account name.');
      return;
    }

    if (!bankName.trim()) {
      Alert.alert('Missing Information', 'Please enter bank name.');
      return;
    }

    setIsLoading(true);

    try {
      const withdrawStatus = await makeWithdraw(restaurantId, withdrawAmount);

      // Store withdrawn amount for success modal
      setWithdrawnAmount(withdrawAmount);

      // Close withdraw modal and show success modal
      setModalVisible(false);
      setSuccessModalVisible(true);

      // Reset form and reload data
      resetForm();
      loadData();
    } catch (error) {
      Alert.alert(
        'Withdrawal Failed',
        'Unable to process withdrawal. Please try again.',
      );
      console.error('Withdrawal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  return (
    <View className="w-full bg-white">
      {/* Card Container */}
      <View className="mx-4 my-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <View className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16" />
        <View className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full -ml-12 -mb-12" />

        <View className="p-6 flex-row items-center justify-between relative z-10">
          <View className="items-center justify-center bg-amber-100 rounded-full p-6 shadow-md">
            <Ionicons name="wallet-outline" size={64} color="#D97706" />
          </View>

          <View className="flex-1 ml-6">
            <Text className="text-gray-600 text-sm font-medium mb-1">
              Available Balance
            </Text>
            <Text className="text-gray-900 text-3xl font-bold mb-4">
              ฿{balance.toLocaleString()}
            </Text>
            <TouchableOpacity
              onPress={handleWithdrawPress}
              className="bg-amber-600 rounded-xl px-6 py-3 shadow-md active:bg-amber-700 active:scale-95"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="cash-outline" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Withdraw
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Withdrawal Modal */}
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
                  <Text className="text-sm text-gray-600 mb-2">
                    Account Name
                  </Text>
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

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleCloseSuccessModal}
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white rounded-3xl w-full max-w-md p-8 items-center">
            {/* Success Icon */}
            <View className="bg-green-100 rounded-full p-4 mb-4">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>

            {/* Success Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Withdrawal Successful!
            </Text>

            {/* Success Message */}
            <Text className="text-gray-600 text-center mb-6">
              Your withdrawal request has been processed successfully.
            </Text>

            {/* Amount Display */}
            <View className="bg-green-50 rounded-xl px-6 py-4 mb-6 w-full">
              <Text className="text-sm text-gray-600 text-center mb-1">
                Withdrawn Amount
              </Text>
              <Text className="text-3xl font-bold text-green-600 text-center">
                ฿{withdrawnAmount.toLocaleString()}
              </Text>
            </View>

            {/* Info Text */}
            <Text className="text-sm text-gray-500 text-center mb-6">
              The funds will be transferred to your account within 1-3 business
              days.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseSuccessModal}
              className="bg-green-600 rounded-lg py-3 px-8 w-full"
            >
              <Text className="text-white font-semibold text-center text-base">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
