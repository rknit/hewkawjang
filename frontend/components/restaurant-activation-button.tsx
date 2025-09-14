import { setRestaurantActivation } from '@/apis/restaurant.api';
import { useState } from 'react';
import { Alert } from 'react-native';
import SimpleButton from './simple-button';

interface RestaurantActivationButtonProps {
  id: number;
  isActive: boolean;
  onStatusChange?: (newStatus: 'active' | 'inactive') => void;
}

export default function RestaurantActivationButton({
  id,
  isActive,
  onStatusChange,
}: RestaurantActivationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);
      const newStatus = isActive ? 'inactive' : 'active';
      await setRestaurantActivation(id, newStatus);
      onStatusChange?.(newStatus); // tell parent about update
    } catch (error) {
      Alert.alert('Error', 'Failed to update restaurant status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleButton
      title={isActive ? 'Deactivate' : 'Activate'}
      onPress={handlePress}
      disabled={loading}
      className={isActive ? 'bg-[#FF8C42]' : 'bg-[#3AAB09]'}
    />
  );
}
