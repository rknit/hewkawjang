import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import ReservationForm from '@/components/ReservationForm';

type Props = {
  restaurantId?: number;
  label?: string;
};

export default function ReserveButton({ restaurantId, label = 'Reserve' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="rounded-xl items-center py-4"
        style={{ backgroundColor: '#E46D2C' }}
      >
        <Text className="font-bold text-white text-lg">{label}</Text>
      </TouchableOpacity>

      <ReservationForm
        restaurantId={restaurantId}
        visible={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

