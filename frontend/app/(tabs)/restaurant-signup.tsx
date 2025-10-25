import { View } from 'react-native';
import RegisterRestaurantForm from '@/components/register-restaurant-form';
import BecomeOurPartner from '@/components/become-our-partner';

export default function RestaurantSignUp() {
  return (
    <View className="flex-row h-screen">
      <BecomeOurPartner />
      <RegisterRestaurantForm />
    </View>
  );
}
