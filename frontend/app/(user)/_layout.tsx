import { Stack } from 'expo-router';
import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import { ToastProvider } from '@/context/ToastContext';
import DefaultNotification from '@/components/notifications/defaultNotification';
import { NotificationProvider } from '@/context/NotificationContext';
import { useUser } from '@/hooks/useUser';

export default function UserLayout() {
  const { user, isLoading } = useUser();

  return (
    <ToastProvider
      offsetY={80}
      mappings={{
        default: DefaultNotification,
        reservation_status: DefaultNotification,
        chat: DefaultNotification,
      }}
    >
      <NotificationProvider>
        {!isLoading && user ? <NavBarUser /> : <NavBarGuest />}
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationProvider>
    </ToastProvider>
  );
}
