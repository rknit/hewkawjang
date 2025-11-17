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
import { supabase } from '@/utils/supabase';
import { fetchCurrentUser } from '@/apis/user.api';

interface MyWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MyWallet({ visible, onClose }: MyWalletModalProps) {
  const [balance, setBalance] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadBalance = async () => {
    try {
      const userBalance = await getUserBalance();
      setBalance(userBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      Alert.alert('Error', 'Failed to fetch balance. Please try again.');
    }
  };

  useEffect(() => {
    if (visible) {
      loadBalance();
    }
  }, [visible]);

  // Real-time subscription for balance updates
  useEffect(() => {
    if (!visible) return;

    const setupRealtimeSubscription = async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user?.id) return;

        const channel = supabase
          .channel('user-balance-updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              console.log('User balance updated:', payload);
              if (payload.new && 'balance' in payload.new) {
                setBalance((payload.new as any).balance || 0);
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Failed to setup realtime subscription:', error);
      }
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
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
