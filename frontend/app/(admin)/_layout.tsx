import AdminSidebar from '@/components/admin_nav/adminSidebar';
import NavBarAdmin from '@/components/admin_nav/navbar-admin';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <ProtectedRoute requireAdmin>
      <NavBarAdmin />
      <AdminSidebar>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminSidebar>
    </ProtectedRoute>
  );
}
