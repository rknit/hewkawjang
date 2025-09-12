import { tmpLogin } from '@/apis/user.api';
import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';

export default function ProfileScreen() {
  useEffect(() => {
    tmpLogin();
  }, []);

  return (
    <View>
      <Text>Profile Tab</Text>
      <Image source={require('./user_default_profile.png')} />
    </View>
  );
}
