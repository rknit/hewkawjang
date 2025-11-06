import { useAdmin } from '@/context/AdminContext';
import AdminRestaurantPanel from './panel';
import { useEffect, useState } from 'react';
import { Report } from '@/types/report.type';
import { fetchRestaurants } from '@/apis/restaurant.api';
import AdminRestaurantCard from './card';
import { Restaurant } from '@/types/restaurant.type';
import { ActivityIndicator } from 'react-native';
import { banRestaurant } from '@/apis/admin.api';

interface AdminRestaurantReportPanelProps {
  onPressCard: (restaurantId: number) => void;
}

export default function AdminRestaurantReportPanel({
  onPressCard,
}: AdminRestaurantReportPanelProps) {
  const { pendingReports, updateReportStatus } = useAdmin();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(
    new Map(),
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const filtered = pendingReports.filter(
        (r) => r.reportType === 'restaurant',
      );
      setFilteredReports(filtered);

      // Only fetch if there are reports
      if (filtered.length > 0) {
        const restaurantIds = filtered.map((r) => r.targetRestaurantId!);
        const restaurants = await fetchRestaurants(restaurantIds);
        const restaurantMap = new Map(
          restaurants.map((restaurant) => [restaurant.id, restaurant]),
        );
        setRestaurants(restaurantMap);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [pendingReports]);

  const handleBan = async (index: number) => {
    const report = filteredReports[index];
    await Promise.all([
      banRestaurant(report.targetRestaurantId!),
      updateReportStatus(report.id, true),
    ]);
  };

  const handleDismiss = async (index: number) => {
    const report = filteredReports[index];
    await updateReportStatus(report.id, true);
  };

  if (isLoading) {
    return (
      <AdminRestaurantPanel title="Report">
        <ActivityIndicator size="large" color="#C54D0E" />
      </AdminRestaurantPanel>
    );
  }

  return (
    <AdminRestaurantPanel title="Report">
      {filteredReports.map((report, index) => (
        <AdminRestaurantCard
          key={report.id}
          restaurant={restaurants.get(report.targetRestaurantId!)!}
          onPressCard={() => onPressCard(report.targetRestaurantId!)}
          mainActionLabel="Ban"
          onPressMainAction={() => handleBan(index)}
          subActionLabel="Dismiss"
          onPressSubAction={() => handleDismiss(index)}
          statusLabel="Waiting for ban review..."
        />
      ))}
    </AdminRestaurantPanel>
  );
}
