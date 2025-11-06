import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const { authRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        className="flex-1 justify-center items-center"
        color="#C54D0E"
      />
    );
  }

  if (authRole === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  // Redirect everyone (guests and users) to user section
  return <Redirect href="/(user)" />;
}
