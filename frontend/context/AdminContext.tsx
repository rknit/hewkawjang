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
import * as adminApi from '@/apis/admin.api';
import * as reportApi from '@/apis/report.api';

interface AdminContextType {
  admin: Admin | null;
  reports: Report[];
  isLoading: boolean;
  updateReportStatus: (id: number, isSolved: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { authRole } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial admin data and reports
  const fetchAdminData = useCallback(async () => {
    if (authRole !== 'admin') {
      setAdmin(null);
      setReports([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [fetchedAdmin, fetchedReports] = await Promise.all([
        adminApi.fetchCurrentAdmin(),
        adminApi.fetchPendingReportsForCurrentAdmin(),
      ]);
      setAdmin(fetchedAdmin);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setAdmin(null);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [authRole]);

  // Update report status
  const updateReportStatusHandler = useCallback(
    async (id: number, isSolved: boolean) => {
      if (!admin?.id) return;

      try {
        const updatedReport = await reportApi.updateReportStatus(id, isSolved);

        if (updatedReport) {
          // Update local state optimistically
          if (isSolved) {
            // Remove solved reports immediately
            setReports((prev) => prev.filter((report) => report.id !== id));
          } else {
            // Update unsolved reports
            setReports((prev) =>
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
    [admin?.id],
  );

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (authRole !== 'admin') {
      setAdmin(null);
      setReports([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial data
    fetchAdminData();

    // We need to wait for admin to be loaded before subscribing
    // Since we need the admin.id for the filter
    if (!admin?.id) {
      return;
    }

    // Subscribe to realtime changes for reports assigned to this admin
    const realtimeChannel = supabase
      .channel(`reports:admin_${admin.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report',
          filter: `admin_id=eq.${admin.id}`,
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
            targetChatId: payload.new.chat_id,
            isSolved: payload.new.is_solved,
            createdAt: payload.new.created_at,
          };

          // just to be safe, only add if not solved
          if (!newReport.isSolved) {
            setReports((prev) => [newReport, ...prev]);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'report',
          filter: `admin_id=eq.${admin.id}`,
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
            targetChatId: payload.new.chat_id,
            isSolved: payload.new.is_solved,
            createdAt: payload.new.created_at,
          };

          if (updatedReport.isSolved) {
            // If the report is solved, remove it from the list
            setReports((prev) =>
              prev.filter((report) => report.id !== updatedReport.id),
            );
          } else {
            // If the report is marked as unsolved, ensure it's in the list
            setReports((prev) => {
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

    // Cleanup function
    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [authRole, admin?.id, fetchAdminData]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        reports,
        isLoading,
        updateReportStatus: updateReportStatusHandler,
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
