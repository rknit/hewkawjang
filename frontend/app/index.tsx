import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import CenteredLoadingIndicator from '@/components/centeredLoading';

export default function Index() {
  const { authRole, isLoading } = useAuth();

  if (isLoading) {
    return <CenteredLoadingIndicator />;
  }

  if (authRole === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  // Redirect everyone (guests and users) to user section
  return <Redirect href="/(user)" />;
}
