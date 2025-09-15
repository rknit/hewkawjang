import { View } from 'react-native';
import RegisterRestaurantForm from '@/components/register-restaurant-form';
import BecomeOurPartner from '@/components/become-our-partner';

export default function RestaurantSignUp() {
  return (
    <View className="flex-row max-h-screen bg-white">
      <View className="w-2/5 flex-1 pt-48 pl-16">
        <BecomeOurPartner />
      </View>
      <View className="w-3/5 flex-1 pt-8 pr-48">
        <RegisterRestaurantForm />
      </View>
    </View>
  );
}
