import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import ReservationForm from '@/components/ReservationForm';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './login-modal';
import SignUpModal from './signup-modal';

type Props = {
  restaurantId?: number;
};

export default function ReserveButton({ restaurantId }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);

  const handlePress = () => {
    if (user) {
      setOpen(true);
    } else {
      setLoginModalVisible(true);
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

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onSignUpPress={() => {
          setLoginModalVisible(false);
          setSignUpModalVisible(true);
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        visible={signUpModalVisible}
        onClose={() => setSignUpModalVisible(false)}
        onLoginPress={() => {
          setSignUpModalVisible(false);
          setLoginModalVisible(true);
        }}
      />
    </>
  );
}
