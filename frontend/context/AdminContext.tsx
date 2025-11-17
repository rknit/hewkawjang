import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { Admin } from '@/types/admin.type';
import { Report } from '@/types/report.type';
import { Restaurant } from '@/types/restaurant.type';
import * as adminApi from '@/apis/admin.api';
import * as reportApi from '@/apis/report.api';
import * as restaurantApi from '@/apis/restaurant.api';

interface AdminContextType {
  admin: Admin | null;
  pendingReports: Report[];
  pendingRestaurants: Restaurant[];
  isLoading: boolean;
  updateReportStatus: (id: number, isSolved: boolean) => Promise<void>;
  updateRestaurantVerificationStatus: (
    id: number,
    isVerified: boolean,
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { authRole } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [pendingRestaurants, setPendingRestaurants] = useState<Restaurant[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial admin data and reports
  const fetchAdminData = useCallback(async () => {
    if (authRole !== 'admin') {
      setAdmin(null);
      setPendingReports([]);
      setPendingRestaurants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [fetchedAdmin, fetchedReports, fetchedRestaurants] =
        await Promise.all([
          adminApi.fetchCurrentAdmin(),
          adminApi.fetchPendingReports(),
          adminApi.fetchPendingRestaurants(),
        ]);
      setAdmin(fetchedAdmin);
      setPendingReports(fetchedReports);
      setPendingRestaurants(fetchedRestaurants);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdmin(null);
      setPendingReports([]);
      setPendingRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, [authRole]);

  // Update report status
  const updateReportStatusHandler = useCallback(
    async (id: number, isSolved: boolean) => {
      if (authRole !== 'admin') return;

      try {
        const updatedReport = await reportApi.updateReportStatus(id, isSolved);

        if (updatedReport) {
          // Update local state optimistically
          if (isSolved) {
            // Remove solved reports immediately
            setPendingReports((prev) =>
              prev.filter((report) => report.id !== id),
            );
          } else {
            // Update unsolved reports
            setPendingReports((prev) =>
              prev.map((report) =>
                report.id === id ? { ...report, isSolved } : report,
              ),
            );
          }
        }
      } catch (error) {
        console.error('Error updating report status:', error);
      }
    },
    [authRole],
  );

  // Update restaurant verification status
  const updateRestaurantVerificationStatusHandler = useCallback(
    async (id: number, isVerified: boolean) => {
      if (authRole !== 'admin') return;

      try {
        await restaurantApi.updateRestaurantVerification(id, isVerified);

        // Either way it'll remove from pending list exception is if backend fails
        setPendingRestaurants((prev) => {
          return prev.filter((restaurant) => restaurant.id !== id);
        });
      } catch (error) {
        console.error('Error updating restaurant verification status:', error);
      }
    },
    [authRole],
  );

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (authRole !== 'admin') {
      setAdmin(null);
      setPendingReports([]);
      setPendingRestaurants([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial data
    fetchAdminData();
  }, [authRole, fetchAdminData]);

  useEffect(() => {
    if (authRole !== 'admin') return;

    // Subscribe to realtime changes for reports assigned to this admin
    const reportChannel = supabase
      .channel('reports:admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report',
        },
        (payload) => {
          if (__DEV__) {
            console.log('New report:', payload);
          }

          // Map database fields (snake_case) to Report type (camelCase)
          const newReport: Report = {
            id: payload.new.id,
            userId: payload.new.user_id,
            adminId: payload.new.admin_id,
            reportType: payload.new.report_type,
            targetRestaurantId: payload.new.restaurant_id,
            targetReviewId: payload.new.review_id,
            targetUserId: payload.new.taget_user_id, // Note: DB has typo 'taget_user_id'
            targetMessageId: payload.new.message_id,
            isSolved: payload.new.is_solved,
            createdAt: payload.new.created_at,
          };

          // just to be safe, only add if not solved
          if (!newReport.isSolved) {
            setPendingReports((prev) => [newReport, ...prev]);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'report',
        },
        (payload) => {
          if (__DEV__) {
            console.log('Report updated:', payload);
          }

          // Map database fields (snake_case) to Report type (camelCase)
          const updatedReport: Report = {
            id: payload.new.id,
            userId: payload.new.user_id,
            adminId: payload.new.admin_id,
            reportType: payload.new.report_type,
            targetRestaurantId: payload.new.restaurant_id,
            targetReviewId: payload.new.review_id,
            targetUserId: payload.new.taget_user_id, // Note: DB has typo 'taget_user_id'
            targetMessageId: payload.new.message_id,
            isSolved: payload.new.is_solved,
            createdAt: payload.new.created_at,
          };

          if (updatedReport.isSolved) {
            // If the report is solved, remove it from the list
            setPendingReports((prev) =>
              prev.filter((report) => report.id !== updatedReport.id),
            );
          } else {
            // If the report is marked as unsolved, ensure it's in the list
            setPendingReports((prev) => {
              const exists = prev.find((r) => r.id === updatedReport.id);
              if (exists) {
                return prev.map((report) =>
                  report.id === updatedReport.id ? updatedReport : report,
                );
              } else {
                return [updatedReport, ...prev];
              }
            });
          }
        },
      )
      .subscribe();

    const verifyChannel = supabase
      .channel('restaurants-verify:admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurant',
        },
        (payload) => {
          if (__DEV__) {
            console.log('New restaurant for verification:', payload);
          }

          // Map database fields (snake_case) to Restaurant type (camelCase)
          const newRestaurant: Restaurant = {
            id: payload.new.id,
            ownerId: payload.new.owner_id,
            name: payload.new.name,
            phoneNo: payload.new.phone_no,
            wallet: payload.new.wallet,
            // address: payload.new.address, // Somehow, address field doesn't exist in Frontend type
            houseNo: payload.new.house_no,
            village: payload.new.village,
            building: payload.new.building,
            road: payload.new.road,
            soi: payload.new.soi,
            subDistrict: payload.new.sub_district,
            district: payload.new.district,
            province: payload.new.province,
            postalCode: payload.new.postal_code,
            cuisineType: payload.new.cuisine,
            priceRange: payload.new.priceRange, // This field is camelCase in DB
            status: payload.new.status,
            activation: payload.new.activation,
            isVerified: payload.new.is_verified,
            isDeleted: payload.new.is_deleted,
            images: payload.new.images,
            reservationFee: payload.new.reservation_fee,
            paymentMethod: payload.new.payment_method,
          };

          // Only add if not deleted (this shouldn't happen)
          if (!newRestaurant.isDeleted && !newRestaurant.isVerified) {
            setPendingRestaurants((prev) => [newRestaurant, ...prev]);
          }
        },
      )
      .on(
        // In case other admin update
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurant',
        },
        (payload) => {
          if (__DEV__) {
            console.log('Restaurant verification status updated:', payload);
          }

          const isVerified = payload.new.is_verified;
          const isDeleted = payload.new.is_deleted;

          // Remove from pending list if verified or deleted
          if (isVerified || isDeleted) {
            setPendingRestaurants((prev) =>
              prev.filter((restaurant) => restaurant.id !== payload.new.id),
            );
          } else {
            // replace existing restaurant info if needed
            setPendingRestaurants((prev) => {
              const exists = prev.find(
                (restaurant) => restaurant.id === payload.new.id,
              );
              if (exists) {
                // Map database fields (snake_case) to Restaurant type (camelCase)
                const updatedRestaurant: Restaurant = {
                  id: payload.new.id,
                  ownerId: payload.new.owner_id,
                  name: payload.new.name,
                  phoneNo: payload.new.phone_no,
                  wallet: payload.new.wallet,
                  // address: payload.new.address,
                  houseNo: payload.new.house_no,
                  village: payload.new.village,
                  building: payload.new.building,
                  road: payload.new.road,
                  soi: payload.new.soi,
                  subDistrict: payload.new.sub_district,
                  district: payload.new.district,
                  province: payload.new.province,
                  postalCode: payload.new.postal_code,
                  cuisineType: payload.new.cuisine,
                  priceRange: payload.new.priceRange,
                  status: payload.new.status,
                  activation: payload.new.activation,
                  isVerified: payload.new.is_verified,
                  isDeleted: payload.new.is_deleted,
                  images: payload.new.images,
                  reservationFee: payload.new.reservation_fee,
                  paymentMethod: payload.new.payment_method,
                };

                return prev.map((restaurant) =>
                  restaurant.id === updatedRestaurant.id
                    ? updatedRestaurant
                    : restaurant,
                );
              } else {
                return prev;
              }
            });
          }
        },
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from admin realtime channel');
      supabase.removeChannel(reportChannel);
      supabase.removeChannel(verifyChannel);
    };
  }, [authRole]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        pendingReports,
        pendingRestaurants,
        isLoading,
        updateReportStatus: updateReportStatusHandler,
        updateRestaurantVerificationStatus:
          updateRestaurantVerificationStatusHandler,
        refetch: fetchAdminData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
