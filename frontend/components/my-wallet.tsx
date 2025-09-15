// components/my-wallet.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import BaseModal from './base-modal';

interface MyWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MyWallet({ visible, onClose }: MyWalletModalProps) {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    // Fetch balance from API or local storage
    // This is a placeholder - replace with actual balance fetching logic
    const fetchBalance = async () => {
      try {
        // Example: const userBalance = await getUserBalance();
        // setBalance(userBalance);
        setBalance(1500); // Placeholder value
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    if (visible) {
      fetchBalance();
    }
  }, [visible]);

  const handleAddBalance = () => {
    // Internal logic for adding balance
    // This could open another modal, navigate to a payment screen, etc.
    console.log('Add balance clicked');
  };

  return (
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
  );
}
