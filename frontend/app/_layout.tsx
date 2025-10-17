import { Stack } from 'expo-router';
import '../global.css';
import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DefaultNotification from '@/components/notifications/defaultNotification';

function RootLayoutContent() {
  const { user, isLoading } = useAuth();

  return (
    <>
      {isLoading && null /* or spinner */}
      {!isLoading && user === null && <NavBarGuest />}
      {!isLoading && user !== null && <NavBarUser />}
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider
        offsetY={80}
        mappings={{
          default: DefaultNotification,
        }}
      >
        <RootLayoutContent />
      </ToastProvider>
    </AuthProvider>
  );
}
