<<<<<<< HEAD
import { login } from '@/apis/auth.api';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import ReservationPane from '@/components/ReservationForm';

export default function Index() {
  const [showReservation, setShowReservation] = useState(false);

  // FIXME: for testing purpose
  useEffect(() => {
    login('test@user.com', 'password').catch((error) => {
      console.error('Login failed:', error);
    });
  });

=======
import { logout } from '@/apis/auth.api';
import { Button, View } from 'react-native';

export default function Index() {
>>>>>>> e050c1ff878b98e2e3572aae48043dffcaa673ca
  return (
    <View className="flex-1 items-center justify-center bg-white gap-8">
      {/* FIXME: for testing purpose */}
<<<<<<< HEAD
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />

      {/* Reserve button */}
      <Button title="Reserve" onPress={() => setShowReservation(true)} />

      {/* Reservation form modal */}
      <ReservationPane
        visible={showReservation}
        onClose={() => setShowReservation(false)}
      />
=======
      
>>>>>>> e050c1ff878b98e2e3572aae48043dffcaa673ca
    </View>
  );
}
