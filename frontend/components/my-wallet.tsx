// components/my-wallet.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import {
  createStripeCheckoutSession,
  getUserBalance,
} from '@/apis/payment.api';
import BaseModal from './base-modal';
import AddBalanceModal from './topup/addBalanceModal';

interface MyWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MyWallet({ visible, onClose }: MyWalletModalProps) {
  const [balance, setBalance] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userBalance = await getUserBalance();
        setBalance(userBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        Alert.alert('Error', 'Failed to fetch balance. Please try again.');
      }
    };

    if (visible) {
      fetchBalance();
    }
  }, [visible]);

  const handleAddBalance = () => {
    // Open the Add Balance modal where user enters amount
    setShowAddModal(true);
  };

  return (
    <>
      <BaseModal
        visible={visible}
        onClose={onClose}
        showCloseButton
        width="default"
      >
        <View className="p-6 flex-row items-center justify-between w-full max-w-lg self-center">
          {/* Left: Wallet Icon */}
          <View className="flex-shrink-0">
            <Ionicons name="wallet-outline" size={120} color="black" />
          </View>

          {/* Right: Balance and Add Button */}
          <View className="flex-1 flex flex-col items-start justify-center ml-6">
            <Text className="text-black text-xl font-semibold">
              Balance : {balance.toLocaleString()} ฿
            </Text>
            <TouchableOpacity
              onPress={handleAddBalance}
              className="mt-4 bg-[#D97706] text-white px-6 py-2 rounded-lg active:bg-[#b95d04]"
            >
              <Text className="text-white font-semibold">Add balance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BaseModal>

      {/* Add Balance modal (opens when user clicks "Add balance") */}
      <AddBalanceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onNext={async (amount) => {
          try {
            const checkoutUrl = await createStripeCheckoutSession(
              Number(amount),
            );
            // Open the URL in a browser or WebView
            await Linking.openURL(checkoutUrl);
            // Close the add-balance modal
            setShowAddModal(false);
          } catch (error) {
            console.error('Failed to start checkout:', error);
            // You might want to show an error message to the user here
            Alert.alert(
              'Error',
              'Failed to start payment process. Please try again.',
            );
          }
        }}
      />
    </>
  );
}
