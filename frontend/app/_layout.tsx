import { Stack } from 'expo-router';
import '../global.css';
import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import { useEffect, useState } from 'react';
import { isUserLoggedIn } from '@/utils/jwt';
import AuthService from '@/services/auth.service';
import { NotificationProvider } from '@/context/NotificationContext';

export default function RootLayout() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const checkLogin = async () => {
    const status = await isUserLoggedIn();
    setLoggedIn(status);
  };

  useEffect(() => {
    checkLogin();
    const unsubscribe = AuthService.onAuthChange(() => checkLogin());
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NotificationProvider offsetY={80}>
      {loggedIn === null && null /* or spinner */}
      {loggedIn === false && <NavBarGuest />}
      {loggedIn === true && <NavBarUser />}
      <Stack screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
