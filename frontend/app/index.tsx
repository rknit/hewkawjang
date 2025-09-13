import { logout } from '@/apis/auth.api';
import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white gap-8">
      {/* FIXME: for testing purpose */}
      <Button title="Go to Profile" onPress={() => router.push('/profile')} />
      <Button title="Log Out" onPress={logout} />
    </View>
  );
}
