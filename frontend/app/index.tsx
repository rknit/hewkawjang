import { login } from '@/apis/auth.api';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';

export default function Index() {
  // FIXME: for testing purpose
  useEffect(() => {
    login('test@user.com', 'password').catch((error) => {
      console.error('Login failed:', error);
    });
  });

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>

      {/* FIXME: for testing purpose */}
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />
    </View>
  );
}
