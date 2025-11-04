import { View } from 'react-native';
import RegisterRestaurantForm from '@/components/register-restaurant-form';
import BecomeOurPartner from '@/components/become-our-partner';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RestaurantSignUp() {
  return (
    <ProtectedRoute>
      <View className="flex-row h-screen">
        <BecomeOurPartner />
        <RegisterRestaurantForm />
      </View>
    </ProtectedRoute>
  );
}
