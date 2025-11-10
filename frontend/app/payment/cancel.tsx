import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function PaymentCancelScreen() {
  useEffect(() => {
    // Attempt to close the tab after 4 seconds. If the browser blocks it, leave the page open.
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          try {
            window.close();
          } catch (err) {
            // ignore - browser likely blocked close
          }
        }
      } catch (err) {
        // ignore
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <Stack.Screen options={{ title: 'Payment Cancelled' }} />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-red-600 mb-4">
          Payment Cancelled
        </Text>
        <Text className="text-lg text-center mb-6">
          Your payment was cancelled. No charges were made. Returning to
          wallet...
        </Text>
      </View>
    </>
  );
}
