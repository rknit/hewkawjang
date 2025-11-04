import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // TODO: Add role check when admin auth is implemented
  // if (user?.role === 'admin') {
  //   return <Redirect href="/(admin)" />;
  // }

  // Redirect everyone (guests and users) to user section
  return <Redirect href="/(user)" />;
}
