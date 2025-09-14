import { bypassLogin, logout } from '@/apis/auth.api';
import { Button, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white gap-8">
      {/* FIXME: for testing purpose */}
      <Button title="Log Out" onPress={logout} />

      {/* FIXME: for testing purpose */}
      <Button title="Bypass Login" onPress={bypassLogin} />
    </View>
  );
}
