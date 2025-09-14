import { Text } from '@react-navigation/elements';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import '../global.css';
import NavBarUser from '@/components/navbar-user';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <NavBarUser />,
      }}
    />
  );
}
