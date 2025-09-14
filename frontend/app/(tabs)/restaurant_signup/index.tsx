import RegisterRestaurantForm from '@/components/register-restaurant-form';
import { Text } from '@react-navigation/elements';
import { ScrollView, View } from 'react-native';
export default function RestaurantSignUp() {
  return (
    <ScrollView
      className="w-[50%] bg-white"
      contentContainerStyle={{
        paddingBottom: 20,
      }}
    >
      <View>
        <RegisterRestaurantForm />
      </View>
    </ScrollView>
  );
}
