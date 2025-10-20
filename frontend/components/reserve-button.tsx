import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import ReservationForm from '@/components/ReservationForm';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './login-modal';

type Props = {
  restaurantId?: number;
};

export default function ReserveButton({ restaurantId }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handlePress = () => {
    if (user) {
      setOpen(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const buttonText = user ? 'Reserve' : 'Login to Reserve';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className="bg-orange-500 px-6 py-3 rounded-md mt-4 w-2/5 items-center "
        style={{ backgroundColor: '#E46D2C' }}
      >
        <Text className="font-bold text-white text-lg">{buttonText}</Text>
      </TouchableOpacity>

      <ReservationForm
        restaurantId={restaurantId}
        visible={open}
        onClose={() => setOpen(false)}
      />

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
