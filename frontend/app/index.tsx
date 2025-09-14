import MyWallet from '@/components/my-wallet';
import { View } from 'react-native';

export default function Index() {
  const handleAddBalance = () => {
    console.log('Add Balance clicked!');
  };

  return (
    <View className="flex-1 bg-gray-100 p-4 justify-center">
      <MyWallet balance={5000} onAddBalance={handleAddBalance} />
    </View>
  );
}
