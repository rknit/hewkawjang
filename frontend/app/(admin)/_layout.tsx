import AdminSidebar from '@/components/admin/nav/adminSidebar';
import AdminNavbar from '@/components/admin/nav/adminNavbar';
import { Stack } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminProvider } from '@/context/AdminContext';

export default function AdminLayout() {
  return (
    <ProtectedRoute adminOnly>
      <AdminProvider>
        <AdminNavbar />
        <AdminSidebar>
          <Stack screenOptions={{ headerShown: false }} />
        </AdminSidebar>
      </AdminProvider>
    </ProtectedRoute>
  );
}
