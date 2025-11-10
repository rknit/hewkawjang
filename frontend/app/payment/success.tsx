import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { verifyPaymentSession } from '@/apis/payment.api';

export default function PaymentSuccessScreen() {
  const { session_id } = useLocalSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifySession() {
      if (!session_id) {
        setError('No session ID provided');
        setVerifying(false);
        return;
      }

      try {
        await verifyPaymentSession(session_id as string);
        setVerifying(false);
        // Try to close the browser tab after 4 seconds.
        // Browsers often block programmatic close unless the page was opened by script.
        // If the close is blocked, we intentionally leave the page open per your request.
        setTimeout(() => {
          try {
            if (typeof window !== 'undefined') {
              try {
                window.close();
              } catch (err) {
                // ignore - leave the page open
              }
            }
          } catch (err) {
            // ignore - leave the page open
          }
        }, 4000);
      } catch (error) {
        console.error('Payment verification failed:', error);
        setError(
          'Failed to verify payment. Please contact support if your balance is not updated.',
        );
        setVerifying(false);
      }
    }

    verifySession();
  }, [session_id]);

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Success' }} />
      <View className="flex-1 items-center justify-center p-4">
        {verifying ? (
          <>
            <ActivityIndicator size="large" color="#D97706" className="mb-4" />
            <Text className="text-lg text-center">
              Verifying your payment...
            </Text>
          </>
        ) : error ? (
          <>
            <Text className="text-2xl font-bold text-red-600 mb-4">
              Verification Failed
            </Text>
            <Text className="text-lg text-center text-red-500">{error}</Text>
          </>
        ) : (
          <>
            <Text className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </Text>
            <Text className="text-lg text-center">
              Your wallet has been topped up. Returning to wallet...
            </Text>
          </>
        )}
      </View>
    </>
  );
}
