import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { router } from 'expo-router';
import { useState } from 'react';
import MyWallet from './my-wallet';

export default function UserDropdown({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const { user } = useProfile();
  const fullname = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const email = user?.email || 'Loading...';
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Placeholder balance - you might want to get this from user profile or API
  const walletBalance = 1500.0;

  const onSelectProfile = () => {
    onClose();
    router.push('/profile');
  };

  const onRestaurantSignup = () => {
    onClose();
    router.push('/restaurant-signup');
  };

  const onOpenWallet = () => {
    setShowWalletModal(true);
  };

  const onCloseWallet = () => {
    setShowWalletModal(false);
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
              <TouchableOpacity className="flex-row items-center gap-2 p-2 rounded hover:bg-gray-100">
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
