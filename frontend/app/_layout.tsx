import { Stack } from 'expo-router';
import '../global.css';
import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DefaultNotification from '@/components/notifications/defaultNotification';
import { NotificationProvider } from '@/context/NotificationContext';

function RootLayoutContent() {
  const { user, isLoading } = useAuth();

  return (
    <>
      {!isLoading && user ? <NavBarUser /> : <NavBarGuest />}
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
          reservation_status: DefaultNotification,
          chat: DefaultNotification,
        }}
      >
        {/* Make sure Auth and Toast providers are parent of noti provider */}
        <NotificationProvider>
          <RootLayoutContent />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
