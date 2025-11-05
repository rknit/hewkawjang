import AdminSidebar from '@/components/admin/nav/adminSidebar';
import AdminNavbar from '@/components/admin/nav/adminNavbar';
import { Stack } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout() {
  return (
    <ProtectedRoute adminOnly>
      <AdminNavbar />
      <AdminSidebar>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminSidebar>
    </ProtectedRoute>
  );
}
