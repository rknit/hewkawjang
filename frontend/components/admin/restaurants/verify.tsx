"use client";

import { useAdmin } from '@/context/AdminContext';
import AdminRestaurantPanel from './panel';
import AdminRestaurantCard from './card';

interface AdminRestaurantVerifyPanelProps {
  onPressCard: (restaurantId: number) => void;
}

export default function AdminRestaurantVerifyPanel({
  onPressCard,
}: AdminRestaurantVerifyPanelProps) {
  const { pendingRestaurants, updateRestaurantVerificationStatus } = useAdmin();

  const handleVerify = async (index: number) => {
    updateRestaurantVerificationStatus(
      pendingRestaurants[index].id, true
    );
  }

  const handleReject = async (index: number) => {
    updateRestaurantVerificationStatus(
      pendingRestaurants[index].id, false
    );
  }

  return (
    <AdminRestaurantPanel title="Verification">
      {pendingRestaurants.map((restaurant, index) => (
        <AdminRestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPressCard={() => onPressCard(restaurant.id)}
          mainActionLabel="Verify"
          onPressMainAction={() => handleVerify(index)}
          subActionLabel="Reject"
          onPressSubAction={() => handleReject(index)}
          statusLabel="Waiting for verification..."
        />
      ))}
    </AdminRestaurantPanel>
  );
}
