import NavBarGuest from '@/components/navbar-guest';
import NavBarUser from '@/components/navbar-user';
import DefaultNotification from '@/components/notifications/defaultNotification';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import { useUser } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons'; // optional for icons
import { Tabs } from 'expo-router';

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

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FF6B00',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubbles-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          {/* add other tabs like profile etc. */}
        </Tabs>
      </NotificationProvider>
    </ToastProvider>
  );
}
