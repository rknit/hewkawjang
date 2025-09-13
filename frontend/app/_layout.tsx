import { Stack } from 'expo-router';
import '../global.css';
import NavBarGuest from '@/components/navbar-guest';

export default function RootLayout() {
  return (
    <>
      <NavBarGuest />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
