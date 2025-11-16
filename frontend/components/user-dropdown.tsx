import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import MyWallet from './my-wallet';
import { fetchOwnerRestaurants } from '@/apis/restaurant.api';
import { getUserBalance } from '@/apis/payment.api';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/hooks/useUser';
import { ensureUserAdminSupportChat } from '@/apis/chat.api';

export default function UserDropdown({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const { user } = useUser();
  const fullname = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const email = user?.email || 'Loading...';
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [numberOfRestaurants, setNumberOfRestaurants] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Fetch user's wallet balance
  const fetchBalance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const balance = await getUserBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const restaurantsResponse = await fetchOwnerRestaurants(user.id, 0, 10);
      setNumberOfRestaurants(restaurantsResponse.length);
    } catch (error) {
      console.error('Failed to load owner restaurants', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('realtime:reservations')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT,DELETE', // <-- listen to all (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'restaurantTable', // <-- make sure this is the correct table
          filter: `owner_id=eq.${user.id}`, // or whatever field matches the user
        } as any,
        () => {
          loadData(); // re-fetch the updated count or chart data
        },
      )
      .subscribe();

    return () => {
      // clean up the subscription
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Fetch balance when component mounts and after wallet modal closes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const onSelectProfile = () => {
    onClose();
    router.push('/profile');
  };

  const onRestaurantSignup = () => {
    onClose();
    router.push('/restaurant-signup');
  };

  const onRestaurantManagement = () => {
    onClose();
    router.push('/myRestaurant');
  };

  const onOpenWallet = () => {
    setShowWalletModal(true);
  };

  const onCloseWallet = () => {
    setShowWalletModal(false);
    // Refresh balance when wallet modal closes
    fetchBalance();
  };

  const onContactSupport = async () => {
    try {
      if (!user?.id) return;
      const chatAdminId = await ensureUserAdminSupportChat(user.id, 1);
      onClose();
      router.push({
        pathname: '/chat',
        params: { adminChatId: String(chatAdminId) },
      });
    } catch (e) {
      console.error('Failed to start support chat', e);
      onClose();
      router.push('/chat');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Backdrop to dismiss modal */}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* Dropdown container - positioned absolutely */}
        <View
          style={{ position: 'absolute', top: 65, right: 20 }}
          pointerEvents="box-none"
        >
          <View className="w-64 bg-white border rounded boxShadow-lg z-50">
            <View className="p-4 border-b">
              <Text className="font-semibold">{fullname}</Text>
              <Text className="text-sm text-gray-500">{email}</Text>
            </View>
            <View className="flex flex-col p-2">
              <TouchableOpacity
                onPress={onSelectProfile}
                className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100"
              >
                <Feather name="user" size={16} color="black" />
                <Text>My profile</Text>
              </TouchableOpacity>
              {numberOfRestaurants == 0 ? (
                <TouchableOpacity
                  onPressOut={onRestaurantSignup}
                  className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100"
                >
                  {/* Using MaterialCommunityIcons for the store icon */}
                  <MaterialCommunityIcons
                    name="storefront"
                    size={16}
                    color="black"
                  />
                  <Text>Sign up for restaurant</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPressOut={onRestaurantManagement}
                  className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100"
                >
                  {/* Using MaterialCommunityIcons for the store icon */}
                  <MaterialCommunityIcons
                    name="storefront"
                    size={16}
                    color="black"
                  />
                  <Text>My Restaurant</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100"
                onPress={onContactSupport}
              >
                <MaterialCommunityIcons
                  name="headphones"
                  size={16}
                  color="black"
                />
                <Text>Contact support</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onOpenWallet}
                className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100"
              >
                <MaterialCommunityIcons name="wallet" size={16} color="black" />
                <Text>My wallet : {walletBalance.toLocaleString()} ฿</Text>
              </TouchableOpacity>
            </View>
            <View className="border-t p-2">
              <TouchableOpacity
                className="flex-row items-center gap-2 p-2 rounded w-full active:bg-gray-200 focus:bg-gray-100 hover:bg-gray-100"
                onPress={logout}
              >
                <Feather name="log-out" size={16} color="black" />
                <Text>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* MyWallet Modal */}
      <MyWallet visible={showWalletModal} onClose={onCloseWallet} />
    </Modal>
  );
}
