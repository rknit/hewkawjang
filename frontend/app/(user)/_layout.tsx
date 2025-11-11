import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import DefaultNotification from '@/components/notifications/defaultNotification';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import { useUser } from '@/hooks/useUser';
import { Stack } from 'expo-router';

export default function UserTabsLayout() {
  const { user, isLoading } = useUser();

  return (
    <ToastProvider
      offsetY={80}
      mappings={{
        default: DefaultNotification,
        reservation_status: DefaultNotification,
        chat: DefaultNotification,
        system: DefaultNotification,
      }}
    >
      <NotificationProvider>
        {!isLoading && user ? <NavBarUser /> : <NavBarGuest />}
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationProvider>
    </ToastProvider>
  );
}
