import { useAuth } from '@/context/AuthContext';
import { Button } from 'react-native';

export default function RestaurantsAdminPage() {
  const { logout } = useAuth();
  return <Button title="logout" onPress={logout} />;
}
